import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/lib/store';
import { Moon, Sun, Eye, Hash, AlertTriangle } from 'lucide-react';
import { ProfileDialog } from '@/components/ProfileDialog';
import { MembershipStatus } from '@/components/MembershipStatus';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';


export default function Settings() {
  const {
    theme,
    showVoteCount,
    requestLimit,
    setTheme,
    setShowVoteCount,
    setRequestLimit,
    subscription,
    
  } = useSettings();

  const isDark = theme === 'dark';
  const [profileOpen, setProfileOpen] = useState(false);
  const [showDowngradeConfirm, setShowDowngradeConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { user,  } = useAuth();
 
 
  const handleDowngrade = async () => {
    setIsCancelling(true);
    try {
      const response = await fetch('http://localhost:5000/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });
  
      const result = await response.json();
  
      if (result.success) {
        toast.success('Successfully scheduled cancellation of your Pro plan. You’ll retain access until the end of the billing period.');
        setShowDowngradeConfirm(false); // Close dialog on success
      } else {
        toast.error(result.error || 'Failed to cancel subscription');
      }
    } catch (err) {
      toast.error('Something went wrong while cancelling subscription.');
      console.error(err);
    } finally {
      setIsCancelling(false);
    }
  };
  

  const bgClass = isDark ? 'bg-white/5' : 'bg-gray-100';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const selectBg = isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-900 border border-gray-300';

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <MembershipStatus />

      <div className={`${bgClass} rounded-lg p-6`}>
        <h2 className={`text-2xl font-bold mb-6 ${textPrimary}`}>Settings</h2>

        <div className="space-y-6">
          {/* Theme */}
          <div className="flex items-center justify-between py-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isDark ? (
                  <Moon className="h-5 w-5 text-purple-400" />
                ) : (
                  <Sun className="h-5 w-5 text-yellow-500" />
                )}
                <h3 className={`font-medium ${textPrimary}`}>Theme</h3>
              </div>
              <p className={`text-sm ${textSecondary}`}>
                Switch between dark and light mode
              </p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>

          {/* Show Vote Count */}
          <div className="flex items-center justify-between py-4 border-t border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-400" />
                <h3 className={`font-medium ${textPrimary}`}>Show Vote Count</h3>
              </div>
              <p className={`text-sm ${textSecondary}`}>
                Display the number of votes for each song
              </p>
            </div>
            <Switch
              checked={showVoteCount}
              onCheckedChange={setShowVoteCount}
            />
          </div>

          {/* Request Limit */}
          <div className="flex items-center justify-between py-4 border-t border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-purple-400" />
                <h3 className={`font-medium ${textPrimary}`}>Request Limit</h3>
              </div>
              <p className={`text-sm ${textSecondary}`}>
                Maximum number of requests per attendee
              </p>
            </div>
            <select
              value={requestLimit}
              onChange={(e) => setRequestLimit(Number(e.target.value))}
              className={`rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 ${selectBg}`}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'request' : 'requests'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Plan Management */}
      {subscription?.plan === 'pro' && (
        <div className={`${bgClass} rounded-lg p-6`}>
          <h2 className={`text-xl font-bold mb-6 ${textPrimary}`}>Plan Management</h2>
          <div className="space-y-4">
            <p className={`text-sm ${textSecondary}`}>
              You are currently on the Pro plan. You can downgrade to the free plan,
              but please note that this will limit you to one event.
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowDowngradeConfirm(true)}
              className="w-full"
            >
              Cancel Subscription
            </Button>
          </div>
        </div>
      )}

      {/* Profile Section */}
      <div className={`${bgClass} rounded-lg p-6`}>
        <h2 className={`text-xl font-bold mb-6 ${textPrimary}`}>Profile</h2>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setProfileOpen(true)}
        >
          Update Profile
        </Button>
      </div>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />

      {/* Downgrade Confirmation Dialog */}
      <Dialog open={showDowngradeConfirm} onOpenChange={setShowDowngradeConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Cancel Pro Subscription
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
            Are you sure you want to cancel your Pro plan? You’ll still retain access until the end of your current billing period.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDowngradeConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDowngrade} disabled={isCancelling}>
            {isCancelling ? 'Cancelling...' : 'Confirm Cancel Subscription'}
          </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
