import { useState, useEffect } from 'react';
import { Check, X, Rocket, CreditCard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';



const plans = [
  {
    name: 'Pro',
    price: '$9.99',
    monthlyPrice: '$9.99',
    yearlyPrice: '$99.99',
    description: 'Everything you need for regular gigs',
    features: [
      'Unlimited events',
      'Pre-event song requests',
      'Custom branding',
      'Basic analytics',
      'Priority support',
      'Custom event URLs',
    ],
    cta: 'Go Pro',
    popular: true,
    plan: 'pro' as const,
    savePercent: 17,
  }
];

export default function UpgradePlanPage() {
  const { user } = useAuth();
  const { subscription } = useSettings();
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | null>(null);
  const [loading, setLoading] = useState(false);
  const { signOut } = useAuth();
 
  const isNewUser = user?.user_metadata?.subscription_plan === undefined;
 
    const [showExpiredModal, setShowExpiredModal] = useState(subscription?.expired === true);

  
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  useEffect(() => {
    if (subscription?.expired) {
      setShowExpiredModal(true);
    }
  }, [subscription]);
    

   

  const handleSelectPlan = async (plan: 'pro') => {
    if (!user) return;
    setLoading(true);

    try {
      const stripe = await stripePromise;
      const response = await fetch('https://heydj-pro.onrender.com/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.user_metadata?.dj_name?.trim() || '',
          plan,
          period: isYearly ? 'yearly' : 'monthly',
        }),
      });

      const session = await response.json();
      if (!session.id) throw new Error('Failed to create Stripe session');

      const result = await stripe?.redirectToCheckout({ sessionId: session.id });
      if (result?.error) throw result.error;

    } catch (error: any) {
      console.error('Error selecting plan:', error);
      toast.error('Failed to select plan', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="max-w-5xl mx-auto space-y-8 mt-4 sm:mt-7 mb-14">
          
        {showExpiredModal && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/60">
            <div className="bg-background border border-border shadow-xl rounded-2xl p-8 w-[90%] max-w-md text-center space-y-6 animate-fade-in-up">
            <Rocket className="w-12 h-12 text-primary mx-auto" />

            <h2 className="text-xl font-semibold">
                Hey {user.user_metadata?.dj_name || 'DJ'},
            </h2>

            <h3 className="text-lg font-medium">
                {subscription?.plan === 'pro'
                ? 'Your Pro Plan Has Ended'
                : 'You completed your free trial'}
            </h3>

            <p className="text-sm text-muted-foreground">
                {subscription?.plan === 'pro'
                ? `To continue enjoying Pro features, please choose a plan. Your previous subscription was on a ${user.user_metadata?.subscription_period || 'monthly'} basis.`
                : 'To keep using the app and unlock all features, please choose a plan that suits you.'}
            </p>

            <Button
                className="w-full"
                onClick={() => setShowExpiredModal(false)}
            >
                Choose a Plan
                      </Button>
                      <div className="flex items-center justify-center gap-3 mt-4">
            <span className="text-sm text-muted-foreground">Not now ?</span>
            <Button
                onClick={signOut}
                variant="ghost"
                className="text-red-500 hover:text-red-600 px-3 py-2 h-auto text-sm"
                
            >
                Log Out
            </Button>
            </div>
            
                
        
                
            </div>
        </div>
        )}



     {/* Header */}
      <div className="text-center space-y-4 px-5 md:px-0">
       
      <h1 className=" text-2xl sm:text-3xl font-bold">
          Upgrade Your DJ Experience
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your needs and take your events to the next level
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/5 rounded-full p-1 flex gap-1">
          <button
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              !isYearly ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setIsYearly(false)}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              isYearly ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setIsYearly(true)}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Plans */}
          
      <div className="flex gap-8 max-w-4xl mx-auto text-center justify-center">

        {plans.map((plan) => (
          <div
            key={plan.name}
            onClick={() => !loading && setSelectedPlan(plan.plan)}
            className={`relative rounded-xl border ${
              plan.popular
                ? 'border-primary bg-primary/5'
                : selectedPlan === plan.plan
                ? 'border-primary'
                : 'border-border bg-card'
            } p-9 px-14 sm:px-20 space-y-6 cursor-pointer transition-all hover:scale-[1.02] ${
              loading ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                Most Popular
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold">
                  {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                <span className="text-sm text-muted-foreground ml-1">
                  /{isYearly ? 'year' : 'month'}
                </span>
              </div>
              {isYearly && (
                <div className="mt-1 text-sm text-green-400">
                  Save {plan.savePercent}% with yearly billing
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {plan.description}
              </p>
            </div>

            <ul className="space-y-3 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            
            </ul>

            <div className="relative">
              {selectedPlan === plan.plan && (
                <div className="absolute inset-0 border-2 border-primary rounded-lg -m-2 pointer-events-none">
                  <Sparkles className="absolute -top-3 -right-3 h-6 w-6 text-primary" />
                </div>
              )}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPlan(plan.plan);
                }}
                className="w-full bg-primary hover:bg-primary/90 gap-2"
                disabled={loading || (!isNewUser && plan.plan === subscription?.plan)}
              >
                <CreditCard className="h-4 w-4" />
                {!isNewUser && plan.plan === subscription?.plan 
                  ? 'Current Plan' 
                  : loading 
                    ? 'Processing...' 
                    : plan.cta}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      {!isNewUser && (
        <div className="mt-16 border-t border-border pt-8 px-9 sm:px-0">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium">Can I switch plans later?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes will take effect immediately.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, including Visa, Mastercard, and American Express.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Is there a contract or commitment?</h3>
              <p className="text-sm text-muted-foreground">
                No, all plans are month-to-month with no long-term commitment required.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">What happens to my events if I downgrade?</h3>
              <p className="text-sm text-muted-foreground">
                Your existing events will remain accessible, but you won't be able to create new ones until you upgrade again.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
