
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StripeFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md p-6 bg-white dark:bg-gray-900 shadow-xl rounded-2xl text-center"
      >
        <div className="flex justify-center mb-4">
          <XCircle className="text-red-500 w-16 h-16" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Something went wrong or the payment was canceled. Don't worry, you can try again anytime.
        </p>
        <button
          onClick={() => navigate('/pricing')}
          className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition"
        >
          Try Again
        </button>
      </motion.div>
    </div>
  );
}
