import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';


export default function StripeSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 8000); // Redirect after 5 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-8">
      
       
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="text-green-500 w-16 h-16" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Payment Successful!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Your subscription has been activated. You'll be redirected to your dashboard shortly.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          If you're not redirected automatically,{' '}
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 dark:text-blue-400 underline"
          >
            click here
          </button>
          .
        </p>
      
    </div>
  );
}
