import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Rocket, CreditCard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Confetti } from '@/components/Confetti';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying out Hey DJ',
    features: [
      '1 Event',
      'Basic song requests',
      'QR code generation',
      'Real-time updates',
    ],
    limitations: [
      'No pre-event requests',
      'No custom branding',
      'No analytics',
    ],
    cta: 'Start Free',
    plan: 'free' as const,
  },
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

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, setPlan, resetEventsCreated } = useSettings();
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const isNewUser = user?.user_metadata?.subscription_plan === undefined;

  const handleSelectPlan = async (plan: 'free' | 'pro') => {
    if (!user) return;

    setLoading(true);
    try {
      // Update user metadata with selected plan
      const { error } = await supabase.auth.updateUser({
        data: {
          subscription_plan: plan,
          subscription_period: isYearly ? 'yearly' : 'monthly',
        },
      });

      if (error) throw error;

      // Update local state
      setPlan(plan);
      resetEventsCreated();

      // Show success feedback
      setShowConfetti(true);
      toast.success(`Welcome to Hey DJ ${plan.charAt(0).toUpperCase() + plan.slice(1)}!`, {
        description: plan === 'free' 
          ? 'You can now create your first event'
          : 'You now have access to all premium features'
      });

      // Redirect after a short delay to show the confetti
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Error selecting plan:', error);
      toast.error('Failed to select plan', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {showConfetti && <Confetti />}

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full text-primary mb-4">
          <Rocket className="h-6 w-6" />
        </div>
        <h1 className="text-4xl font-bold">
          {isNewUser ? 'Choose Your Plan' : 'Upgrade Your DJ Experience'}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {isNewUser 
            ? 'Select the perfect plan to start your DJ journey'
            : 'Choose the perfect plan for your needs and take your events to the next level'}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
            } p-6 space-y-6 cursor-pointer transition-all hover:scale-[1.02] ${
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
                  {plan.plan === 'pro' 
                    ? (isYearly ? plan.yearlyPrice : plan.monthlyPrice)
                    : plan.price}
                </span>
                {plan.plan === 'pro' && (
                  <span className="text-sm text-muted-foreground ml-1">
                    /{isYearly ? 'year' : 'month'}
                  </span>
                )}
              </div>
              {plan.plan === 'pro' && isYearly && (
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
              {plan.limitations?.map((limitation) => (
                <li key={limitation} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{limitation}</span>
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
                className={`w-full ${
                  plan.plan === 'pro'
                    ? 'bg-primary hover:bg-primary/90 gap-2'
                    : 'gap-2'
                }`}
                disabled={loading || (!isNewUser && plan.plan === subscription.plan)}
              >
                {plan.plan === 'pro' && <CreditCard className="h-4 w-4" />}
                {!isNewUser && plan.plan === subscription.plan 
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
        <div className="mt-16 border-t border-border pt-8">
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