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

// Mount raw body parser for Stripe webhook
app.post('/webhook', express.raw({ type: 'application/json' }));

// Use JSON parser for all other routes
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Hey DJ backend with Stripe and Supabase!');
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
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Hey DJ Pro (${period})`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: 'https://heydjtest.vercel.app/success',
      cancel_url: 'https://heydjtest.vercel.app/failure',
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
app.post('/webhook', async (req, res) => {
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
    console.log(`Payment success for ${userId}: ${plan} (${period})`);

    const startDate = new Date();
    const expiresDate = new Date(startDate);
    if (period === 'monthly') {
      expiresDate.setMonth(expiresDate.getMonth() + 1);
    } else if (period === 'yearly') {
      expiresDate.setFullYear(expiresDate.getFullYear() + 1);
    }

    const amountPaid = (session.amount_total / 100).toFixed(2);
    const formattedAmount = `$${amountPaid}`;
    const formattedExpiry = expiresDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        subscription_plan: plan,
        subscription_period: period,
        subscription_start: startDate.toISOString(),
        subscription_expires: expiresDate.toISOString(),
      },
    });

    if (error) {
      console.error('Supabase update failed:', error.message);
    } else {
      console.log('Supabase user metadata updated');

      const { error: notifError } = await supabase.from('notifications').insert([
        {
          user_id: userId,
          title: `Hey ${name}, A payment of ${formattedAmount} was made to your account`,
          message: `Your Pro (${period}) subscription is now active and will expire on ${formattedExpiry}. Enjoy all the premium features!`,
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
        message: `Your Hey DJ Pro (${period}) subscription payment failed. Please try again.`,
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




//cron job to downgrade users if the plan expires
app.post('/downgrade-expired', async (req, res) => {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: users, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Failed to list users:', error.message);
    return res.status(500).send('Failed');
  }

  const now = new Date();

  for (const user of users) {
    const metadata = user.user_metadata;
    const expires = metadata?.subscription_expires;

    if (expires && new Date(expires) < now) {
      console.log(`Downgrading user: ${user.email}`);

      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          subscription_plan: null,
          subscription_period: null,
          subscription_start: null,
          subscription_expires: null,
        },
      });

      await supabase.from('notifications').insert([
        {
          user_id: user.id,
          title: 'Subscription Expired',
          message: 'Your Hey DJ Pro subscription has expired. Upgrade again to unlock premium features.',
          read: false,
        },
      ]);
    }
  }

  res.status(200).send('Downgrade completed');
});




// New route: Check if user exists by email
app.post('/check-user-exists', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Fetch all users (may need to paginate if >1000 users)
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error fetching user list:', error);
      return res.status(500).json({ error: 'Failed to fetch user list' });
    }

    // Manually check for user with matching email
    const userExists = data.users.some((user) => user.email === email);

    return res.json({ userExists });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});





// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
