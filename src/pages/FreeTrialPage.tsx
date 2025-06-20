import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Timer } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';



const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function FreeTrialPage() {
  const features = [
    'Unlimited events',
    'Pre-event song requests',
    'Basic analytics',
    'Priority support',
  ];

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStartTrial = async () => {
    setLoading(true);

    try {
      // Get current time and expiration date (7 days later)
      const now = new Date();
      const expires = new Date(now);
      expires.setDate(expires.getDate() + 7);
      //expires.setMinutes(expires.getMinutes() + 2); (testing expiry)

      // Format ISO strings
      const subscriptionStart = now.toISOString();
      const subscriptionExpires = expires.toISOString();

      // Update Supabase user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          subscription_plan: 'trial',
          subscription_period: 'weekly',
          subscription_start: subscriptionStart,
          subscription_expires: subscriptionExpires,
        },
      });

      if (error) throw error;

      toast.success('7-day free trial started! Enjoy full access.');

      //redirect to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);

    } catch (error) {
      console.error('Error starting free trial:', error);
      toast.error('Failed to start free trial. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:min-h-screen flex items-center justify-center bg-gradient-to-r from-black to-gray-900 text-white px-4">
      <div className="bg-white/5 rounded-2xl p-8 max-w-md w-full shadow-lg space-y-7 px-12">
        <div className="space-y-2 text-center">
          <Timer className="h-12 w-12 mx-auto text-purple-400 mb-5" />
          <h2 className="text-2xl sm:text-3xl font-bold ">Start Your 7-Day Free Trial</h2>
          <p className="text-md text-gray-400">
            Full access to WheresMySong Pro. No credit card required
          </p>
        </div>

        <ul className="space-y-1">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm ml-9">
              <Check className="text-green-500 h-5  font-bold mt-0.5" />
              <span className='font-normal text-base'>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="text-md text-gray-400 text-center">
          7 days of full access • No credit card required<br />
          Cancel anytime, no strings attached
        </div>

        <Button
          className="w-full bg-violet-600 hover:bg-violet-700 text-white text-base font-medium"
          onClick={handleStartTrial}
          disabled={loading}
        >
          {loading ? 'Starting Trial...' : 'Start Free Trial'}
        </Button>

        <div className="text-center text-md text-gray-400">
          Already a member? <a href="/login" className="text-violet-400 hover:underline">Log in</a>
        </div>
      </div>
    </div>
  );
}


