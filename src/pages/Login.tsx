import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music2Icon, AlertCircle, LinkIcon, KeyIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/lib/store';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';


export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [djName, setDjName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setPlan, resetEventsCreated } = useSettings();
  const navigate = useNavigate();
 
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        const plan = data.user?.user_metadata?.subscription_plan || null;
        setPlan(plan);
        resetEventsCreated();
        navigate('/dashboard');
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              dj_name: djName,
            },
          },
        });

        if (signUpError) throw signUpError;

        toast.success('Account created successfully!', {
          description: 'You can start your free trial to continue.',
        });
        setPlan(null);
        navigate('/select-plan');
      }
    } catch (error: any) {
      logger.error('Authentication error:', { error });

      if (error.message === 'Failed to fetch') {
        setError('Unable to connect to authentication service. Please check your internet connection and try again.');
      } else if (error.message?.includes('network')) {
        setError('There was a problem connecting to our servers. Please try again later.');
      } else {
        setError(error.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/pricing`,
          queryParams: {
            response_type: 'code',
            scope: 'name email',
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      logger.error('Apple Sign In error:', { error });

      if (error.message === 'Failed to fetch') {
        setError('Unable to connect to Apple authentication service. Please check your internet connection and try again.');
      } else if (error.message?.includes('network')) {
        setError('There was a problem connecting to our servers. Please try again later.');
      } else {
        setError(error.message || 'An error occurred during authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (cooldown > 0) return;
  
    setResetLoading(true);
    setResetMessage('');
  
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
  
      if (error) {
        setResetMessage(error.message || 'Failed to send reset email.');
      } else {
        toast.success('Password reset link sent', {
          description: 'Check your email inbox to reset your password.',
        });
        setResetMessage('A password reset link has been sent to your email.');
  
        // Start 30 second cooldown
        setCooldown(30);
        const interval = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: any) {
      setResetMessage('An error occurred. Please try again later.');
    } finally {
      setResetLoading(false);
    }
  };
  
  

  return (
    <div className="h-screen bg-[#121212] flex flex-col justify-center lg:py-5">
      <div className="mx-auto w-full max-w-md">
        <div className="flex flex-col items-center mb-4">
        
          <Music2Icon className="h-12 w-12 text-purple-500 mb-4" />
          <h1 className="text-3xl font-bold text-white">WheresMySong</h1>
          <p className="text-gray-400 mt-2">Your party, your playlist</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-lg px-8 py-5 lg:py-7 shadow-xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-white mb-8">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-destructive/20 border border-destructive/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-2 block w-full rounded-lg border-0 py-2 px-3 bg-white/10 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-purple-500 sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="djName" className="block text-sm font-medium text-gray-300">
                  DJ Name
                </label>
                <input
                  id="djName"
                  type="text"
                  required
                  className="mt-2 block w-full rounded-lg border-0 py-2 px-3 bg-white/10 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-purple-500 sm:text-sm"
                  value={djName}
                  onChange={(e) => setDjName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="mt-2 block w-full rounded-lg border-0 py-2 px-3 bg-white/10 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-purple-500 sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {isLogin && (
              <div className="text-righ text-center">
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Sign up'}
            </Button>

            {/* <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#121212] text-gray-400">Or continue with</span>
              </div>
            </div> */}

            {/* <button
              type="button"
              onClick={handleAppleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg bg-black hover:bg-black/90 text-white font-medium transition-colors relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
              </svg>
              {loading ? 'Please wait...' : 'Continue with Apple'}
            </button> */}

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm ">
          <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-6 mx-4 sm:mx-0 w-full max-w-sm md:max-w-md shadow-sm shadow-purple-400">
            
            <h2 className="text-2xl md:text-[30px] font-semibold text-white mb-4 text-center mt-2">Reset Your Password</h2>
            <div className="text-center mb-3">
              <KeyIcon className="h-9 w-9 text-purple-500 mx-auto" /></div>

  
            <p className="text-sm md:text-md text-gray-400 mb-4 text-center">
              Enter your email to receive a password reset link.
            </p>
            <input
              type="email"
              placeholder="Enter Your Account email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2
               focus:ring-purple-500 placeholder-gray-400 text-sm mb-4 mt-2"
            />
            {resetMessage && (
              <p className="text-sm mb-2  text-center text-yellow-300">{resetMessage}</p>
            )}
            {cooldown > 0 && (
                <p className="text-xs text-purple-400 text-center mt-3">
                  Please wait {cooldown} second{cooldown !== 1 && 's'} before requesting another reset link.
                </p>
              )}

            <div className="flex justify-end space-x-2 mt-9">
              <Button
                onClick={() => setShowResetModal(false)}
                variant="ghost"
                className="text-gray-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
              onClick={handlePasswordReset}
              disabled={resetLoading || cooldown > 0}
              className="bg-purple-800 hover:bg-purple-900 text-white flex items-center gap-2"
            >
              <LinkIcon className="h-4 w-4 text-white" />
              {resetLoading ? 'Sending...' : 'Request Link'}
            </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
