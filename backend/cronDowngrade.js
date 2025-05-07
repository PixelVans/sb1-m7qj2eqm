const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function downgradeExpiredUsers() {
  const now = new Date().toISOString();

  // Get users with expired subscriptions
  const { data: users, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Failed to list users:', error.message);
    return;
  }

  for (const user of users) {
    const metadata = user.user_metadata;
    if (
      metadata?.subscription_expires &&
      new Date(metadata.subscription_expires) < new Date()
    ) {
      console.log(`Downgrading ${user.email}`);

      // Update metadata to downgrade
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          subscription_plan: null,
          subscription_period: null,
          subscription_start: null,
          subscription_expires: null,
        },
      });

      // Optional: Notify the user
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
}

downgradeExpiredUsers();
