import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music2Icon, AlertCircle } from 'lucide-react';
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
        console.log(plan)
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
          description: 'Please select your plan to continue.',
        });
        setPlan(null);
        navigate('/pricing');
      }
    } catch (error: any) {
      logger.error('Authentication error:', { error });

      // Handle network errors specifically
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
  
    // Handle sign up with Apple
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

        // Handle network errors specifically
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

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col justify-center">
      <div className="mx-auto w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Music2Icon className="h-12 w-12 text-purple-500 mb-4" />
          <h1 className="text-3xl font-bold text-white">Hey DJ</h1>
          <p className="text-gray-400 mt-2">Your party, your playlist</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-lg px-8 py-12 shadow-xl">
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

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Sign up'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#121212] text-gray-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAppleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg bg-black hover:bg-black/90 text-white font-medium transition-colors relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
              </svg>
              {loading ? 'Please wait...' : 'Continue with Apple'}
            </button>

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
    </div>
  );
}
