import { useSettings } from '@/lib/store';
import { ProBadge } from './ProBadge';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

export function MembershipStatus() {
  const { subscription } = useSettings();
  const navigate = useNavigate();

  return (
    <div className="bg-white/5 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Membership Status</h3>
        {subscription.plan === 'pro' && <ProBadge />}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Current Plan</span>
          <span className="capitalize">{subscription.plan}</span>
        </div>
        {subscription.plan === 'free' && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Events Created</span>
            <span>{subscription.eventsCreated} / 1</span>
          </div>
        )}
      </div>

      {subscription.plan === 'free' ? (
        <Button
          onClick={() => navigate('/pricing')}
          className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black"
        >
          Upgrade to Pro
        </Button>
      ) : (
        <div className="text-sm text-gray-400 text-center">
          You're enjoying all Pro features!
        </div>
      )}
    </div>
  );
}