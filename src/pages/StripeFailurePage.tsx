
import { XCircleIcon, RefreshCwIcon, MessageCircleIcon, HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function StripeFailurePage() {
  return (
    <div className="flex items-center justify-center px-4 mt-20">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl p-10 max-w-xl text-center space-y-6 border border-white/10">
        <XCircleIcon className="h-20 w-20 text-red-500 mx-auto animate-pulse" />
        <h1 className="text-3xl font-bold text-white font-rajdhani">
          Payment Failed
        </h1>
        <p className="text-gray-300 text-base">
          Unfortunately, your payment didn’t go through. This could be due to a declined card or network issue.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/pricing">
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
              <MessageCircleIcon className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="w-full text-gray-400 hover:text-white">
              <HomeIcon className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
