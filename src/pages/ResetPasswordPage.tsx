import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Loader2, LockIcon, CheckCircle2Icon } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { theme } = useSettings();
  const isDark = theme === 'dark';

  useEffect(() => {
    supabase.auth.getSession();
  }, []);

  const handleReset = async () => {
    setErrorMsg('');
    if (password !== confirmPassword) {
      setErrorMsg("Passwords don't match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center  px-4">
      <div className={`w-full max-w-md p-6 rounded-2xl shadow-lg border ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-white'}`}>
        <div className="flex flex-col gap-5 items-center text-center">
          <LockIcon className={`w-10 h-10 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          <h2 className={`text-2xl font-bold font-rajdhani ${isDark ? 'text-white' : 'text-gray-900'}`}>Reset Your Password</h2>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
            Enter your new password below.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-2 rounded-md border outline-none transition ${
              isDark
                ? 'bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-purple-500'
                : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500 focus:border-purple-500'
            }`}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-4 py-2 rounded-md border outline-none transition ${
              isDark
                ? 'bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-purple-500'
                : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500 focus:border-purple-500'
            }`}
          />

          {errorMsg && (
            <div className="text-red-500 text-sm mt-1">{errorMsg}</div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-600 text-sm mt-1">
              <CheckCircle2Icon className="w-4 h-4" /> Password has been updated!
            </div>
          )}

          <Button
            onClick={handleReset}
            disabled={loading || success}
            className={`${isDark ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'} w-full`}
          >
            {loading && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
            Reset Password
          </Button>
        </div>
      </div>
    </div>
  );
}
