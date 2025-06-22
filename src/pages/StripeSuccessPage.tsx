import { useEffect, useState } from 'react';
import { CheckCircle2Icon, ArrowRightIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Confetti } from '@/components/Confetti';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/lib/store';
import { toast } from 'sonner';

export default function StripeSuccessPage() {
  const [showConfetti,] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(3);

  const { setPlan, resetEventsCreated, theme, subscription, } = useSettings();
  const isTrial = subscription?.plan == 'trial'
  console.log(isTrial)

  const isDark = theme === 'dark';

  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const subTextColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const highlightColor = isDark ? 'text-yellow-300' : 'text-yellow-600';
  const cardBg = isDark
    ? 'bg-white/5 border border-white/10'
    : 'bg-white border border-gray-200';
  const outlineBtn = isDark
    ? 'border-white/20 text-white hover:bg-white/10'
    : 'border-gray-300 text-gray-800 hover:bg-gray-100';

  useEffect(() => {
    const refreshUser = async () => {
      try {
        await supabase.auth.refreshSession();
        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user) {
          throw new Error('Failed to refresh user session');
        }

        const plan = data.user.user_metadata?.subscription_plan || null;
        setPlan(plan);
        resetEventsCreated();
      } catch (err) {
        toast.error('Could not update subscription. Try logging out and in again.');
      } finally {
        setLoading(false);
        //setShowConfetti(true);

        let timeLeft = 3;
        setCountdown(timeLeft);
        const interval = setInterval(() => {
          timeLeft -= 1;
          setCountdown(timeLeft);
        }, 1000);

        setTimeout(() => {
          clearInterval(interval);
          window.location.href = '/dashboard';
        }, 3000);
      }
    };

    refreshUser();
  }, [setPlan, resetEventsCreated]);

  return (
    <div className="flex items-center justify-center px-4 mt-20">
      {showConfetti && <Confetti />}
      <div
        className={`backdrop-blur-lg rounded-2xl shadow-2xl p-10 max-w-xl text-center space-y-6 ${cardBg}`}
      >
        <CheckCircle2Icon className="h-20 w-20 text-green-400 mx-auto" />
        <h1 className={`text-3xl font-bold font-rajdhani ${textColor}`}>
          {isTrial ? 'Trial Started!' : 'Payment Successful!'}
        </h1>
        <p className={`text-base ${subTextColor}`}>
          {isTrial
            ? 'Your free trial has started. Enjoy exploring Pro features!'
            : 'Thank you for your purchase. You have now upgraded to Pro.'}
        </p>

        {loading ? (
          <div className="flex justify-center items-center space-x-2">
            <Loader2 className="animate-spin h-5 w-5 text-purple-500" />
            <span className={`${highlightColor}`}>Updating your account...</span>
          </div>
        ) : (
          <>
            <p className={`text-sm ${highlightColor}`}>
              Redirecting to dashboard in {countdown}...
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
              <Link to="/dashboard">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Go to Dashboard
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className={`w-full ${outlineBtn}`}>
                  Need Help?
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
