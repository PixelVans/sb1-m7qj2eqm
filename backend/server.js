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

app.use(cors());



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
  
    const { data: userData, error: fetchError } = await supabase.auth.admin.getUserById(userId);

      if (fetchError || !userData) {
        console.error('Failed to fetch user:', fetchError?.message || 'No user data found');
        return res.sendStatus(500);
      }

      const existingMetadata = userData.user?.user_metadata || {};

      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...existingMetadata,
          trial_used: true,
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



// Use JSON parser for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Root route
app.get('/', (req, res) => {
  res.send(`© ${new Date().getFullYear()} WheresMySong. All rights reserved.`);
});




// Create Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  const { plan, period, email, userId, name } = req.body;

  // Get user metadata to check if they've used a trial
  const { data: user, error } = await supabase.auth.admin.getUserById(userId);

  if (error || !user) {
    return res.status(500).json({ error: 'User not found' });
  }

  const trialUsed = user.user.user_metadata?.trial_used === true;
 
  //pricing from stripe
  const priceMap = {
    monthly: 'price_1RcvTDJu6e4DMNIyQmO8cfLk', 
    yearly: 'price_1RcvUwJu6e4DMNIy5XHGfB5j',
  };

  const selectedPrice = priceMap[period];

  if (!selectedPrice) {
    return res.status(400).json({ error: 'Invalid billing period' });
  }

  try {
    const sessionOptions = {
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: selectedPrice,
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
      subscription_data: {
        metadata: {
          userId,
          plan,
          period,
          email,
          name,
        },
      },
    };

    
    if (!trialUsed) {
      sessionOptions.subscription_data.trial_period_days = 7;
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});





//Cancel Subscription
app.post('/cancel-subscription', express.json(), async (req, res) => {
  const { userId } = req.body;

  // Fetch user to get their subscription ID
  const { data: userData, error: fetchError } = await supabase.auth.admin.getUserById(userId);

  if (fetchError || !userData) {
    return res.status(500).json({ error: 'User not found' });
  }

  const subscriptionId = userData.user?.user_metadata?.subscription_id;

  if (!subscriptionId) {
    return res.status(400).json({ error: 'No subscription ID found' });
  }

  try {
    // Cancel at period end
    const canceled = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    const { data: userData, error: fetchError } = await supabase.auth.admin.getUserById(userId);

    if (fetchError || !userData) {
      console.error('Failed to fetch user:', fetchError?.message || 'No user data found');
      return res.sendStatus(500);
    }

    const existingMetadata = userData.user?.user_metadata || {};
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...existingMetadata,
        subscription_cancelled: true, 
      },
    });

    return res.json({ success: true, canceled });
  } catch (err) {
    console.error('Error canceling subscription:', err);
    return res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});





// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
