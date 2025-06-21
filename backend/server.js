const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Supabase server-side client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Enable CORS
app.use(cors());

// Use JSON parser for all other routes
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send(`© ${new Date().getFullYear()} WheresMySong. All rights reserved.`);
});


app.post('/start-trial', async (req, res) => {
  const { userId, email } = req.body;

  if (!userId || !email) {
    return res.status(400).json({ error: 'Missing userId or email' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: 'price_xxx', // ← your Pro plan price ID
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id: userId,
        },
      },
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/faulure',
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('Error creating Stripe session:', err);
    return res.status(500).json({ error: 'Could not create Stripe session' });
  }
});





// Create Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  const { plan, period, email, userId, name } = req.body;

  let amount = 0;
  if (plan === 'pro') {
    amount = period === 'yearly' ? 9999 : 999;
  }

  if (amount === 0) {
    return res.status(400).json({ error: 'Invalid plan or billing period' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `WheresMySong Pro (${period})`,
            },
            unit_amount: amount,
            recurring: {
              interval: period === 'yearly' ? 'year' : 'month',  // 👈 Automatic subscription
            },
          },
          quantity: 1,
        },
      ],
      success_url: 'https://wheresmysong.com/success',
      cancel_url: 'https://wheresmysong.com/failure',
      metadata: {
        userId,
        plan,
        period,
        email,
        name,
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});



// Stripe Webhook Handler
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.sendStatus(400);
  }

  const session = event.data.object;
  const { userId, plan, period, name = '' } = session.metadata || {};

  if (event.type === 'checkout.session.completed') {
    const subscriptionId = session.subscription;
    const { userId, plan, period, name = '' } = session.metadata || {};
  
    // Load full subscription info from Stripe (to get trial_end if available)
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  
    const startDate = new Date(stripeSubscription.start_date * 1000);
    const expiresDate = stripeSubscription.trial_end
      ? new Date(stripeSubscription.trial_end * 1000)
      : (() => {
          const temp = new Date(startDate);
          if (period === 'monthly') temp.setMonth(temp.getMonth() + 1);
          else if (period === 'yearly') temp.setFullYear(temp.getFullYear() + 1);
          return temp;
        })();
  
    const subscriptionPlan = stripeSubscription.trial_end ? 'trial' : plan;
  
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        subscription_id: subscriptionId,
        subscription_plan: subscriptionPlan,
        subscription_period: stripeSubscription.trial_end ? 'weekly' : period,
        subscription_start: startDate.toISOString(),
        subscription_expires: expiresDate.toISOString(),
      },
    });
  
    if (error) {
      console.error('Supabase update failed:', error.message);
    } else {
      console.log('Supabase user metadata updated');
  
      const isTrial = subscriptionPlan === 'trial';
  
      const { error: notifError } = await supabase.from('notifications').insert([
        {
          user_id: userId,
          title: isTrial
            ? `Hey ${name}, Your 7-day free trial has started`
            : `Hey ${name}, A payment of $${(session.amount_total / 100).toFixed(2)} was made to your account`,
          message: isTrial
            ? `You have full access to WheresMySong Pro until ${expiresDate.toDateString()}`
            : `Your Pro (${period}) subscription is now active and will expire on ${expiresDate.toDateString()}. Enjoy all the premium features!`,
          read: false,
        },
      ]);
  
      if (notifError) {
        console.error('Notification insert failed:', notifError.message);
      } else {
        console.log('Notification inserted');
      }
    }
  }
  

  if (event.type === 'checkout.session.expired') {
    console.warn(`Session expired for user ${userId}`);
  }

  if (event.type === 'checkout.session.async_payment_failed') {
    console.warn(`Payment failed for user ${userId}`);

    const { error: notifError } = await supabase.from('notifications').insert([
      {
        user_id: userId,
        title: 'Payment Failed',
        message: `Your WheresMySong Pro (${period}) subscription payment failed. Please try again.`,
        read: false,
      },
    ]);

    if (notifError) {
      console.error('Failed to insert failure notification:', notifError.message);
    } else {
      console.log('Failure notification inserted');
    }
  }

  res.status(200).json({ received: true });
});




app.post('/cancel-subscription', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    // 1. Get user metadata
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.user_metadata?.subscription_id) {
      return res.status(404).json({ error: 'Subscription not found for user.' });
    }

    const subscriptionId = userData.user.user_metadata.subscription_id;
   
    const userName = userData.user.user_metadata?.dj_name || 'there';

    const period = userData.user.user_metadata?.subscription_period || '';

    // 2. Cancel on Stripe
    const deletedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // 3. Insert notification
    const { error: notifError } = await supabase.from('notifications').insert([
      {
        user_id: userId,
        title: `Your ${period} subscription has been canceled`,
        message: `Hi ${userName}, your Pro (${period}) plan has been successfully canceled. You'll retain access until the end of your billing period.`,
        read: false,
      },
    ]);

    if (notifError) {
      console.error('Failed to insert notification:', notifError.message);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Cancel subscription error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});





// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
