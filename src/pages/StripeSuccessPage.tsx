import  { useState } from 'react';
import { CheckCircle2Icon, ArrowRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Confetti } from '@/components/Confetti';



export default function StripeSuccessPage() {
  const [showConfetti, setShowConfetti] = useState(false);
  setTimeout(() => {
    setShowConfetti(true)
  }, 1000);

  return (
    <div className="bg-[#121212]  flex items-center justify-center px-4">
      {showConfetti && <Confetti />}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl p-10 max-w-xl text-center space-y-6 border border-white/10">
        <CheckCircle2Icon className="h-20 w-20 text-green-400 mx-auto" />
        <h1 className="text-3xl font-bold text-white font-rajdhani">
          Payment Successful!
        </h1>
        <p className="text-gray-300 text-base">
          Thank you for your purchase. You have now upgraded to pro
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard">
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              Go to Dashboard
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
              Need Help?
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
