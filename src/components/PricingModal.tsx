import React from 'react';
import { Check, X, Lock } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useSettings } from '@/lib/store';

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPlan?: (plan: 'free' | 'pro' | 'premium') => void;
  showFreePlan?: boolean;
}

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying out WheresMySong',
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
      'No top songs insights',
    ],
    cta: 'Start Free',
    plan: 'free' as const,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'Everything you need for regular gigs',
    features: [
      'Unlimited events',
      'Pre-event song requests',
      'Custom branding',
      'Basic analytics',
      'Top songs insights',
      'Priority support',
      'Custom event URLs',
    ],
    cta: 'Go Pro',
    popular: true,
    plan: 'pro' as const,
  },
  {
    name: 'Premium',
    price: '$99',
    period: '/year',
    description: 'Save 17% with annual billing',
    features: [
      'Everything in Pro',
      'Advanced analytics',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'Early access to new features',
    ],
    cta: 'Go Premium',
    plan: 'premium' as const,
  },
];

export function PricingModal({ open, onOpenChange, onSelectPlan, showFreePlan = true }: PricingModalProps) {
  const { subscription } = useSettings();

  const displayedPlans = showFreePlan ? plans : plans.slice(1);

  const handleSelectPlan = (plan: 'free' | 'pro' | 'premium') => {
    if (onSelectPlan) {
      onSelectPlan(plan);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Choose Your Plan</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
          {displayedPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border ${
                plan.popular
                  ? 'border-purple-500 bg-purple-500/5'
                  : 'border-border bg-white/5'
              } p-6 space-y-4`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.limitations?.map((limitation) => (
                  <li key={limitation} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4 text-red-500 mt-0.5" />
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan.plan)}
                className={`w-full ${
                  plan.popular
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : ''
                }`}
                disabled={plan.plan === subscription.plan}
              >
                {plan.plan === subscription.plan ? 'Current Plan' : plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}