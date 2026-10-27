import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, Heart, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  stripePriceId: string;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Get started with basic relationship tracking",
    stripePriceId: "",
    features: [
      "Up to 5 contacts",
      "Basic timeline tracking",
      "Simple reminders",
      "Basic privacy features"
    ]
  },
  {
    id: "membership",
    name: "Membership",
    price: 7.99,
    description: "Unlock all features for complete relationship management",
    stripePriceId: "price_1SjBU03Tmk2rt2lz7LOM0NkR",
    popular: true,
    features: [
      "Unlimited contacts",
      "Advanced timeline tracking",
      "AI-powered insights",
      "Smart reminders",
      "Multi-factor authentication",
      "5GB storage",
      "Priority support"
    ]
  }
];

export default function OnboardingPlan() {
  useEffect(() => {
    document.title = "Choose Plan | VelvetLog";
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  // Pre-select the Membership plan (Most Popular) by default
  const membershipPlan = plans.find(plan => plan.popular) || null;
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(membershipPlan);
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Helper function to check if a plan is the user's current plan
  const isCurrentPlan = (planName: string) => {
    if (!isAuthenticated || !user) return false;
    
    // Check if user has any active subscription
    const hasActiveSubscription = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';
    
    // If no subscription and checking Free plan, that's their current plan
    if (!hasActiveSubscription && planName === 'Free') return true;
    
    // If has subscription and checking Membership, that's their current plan
    if (hasActiveSubscription && planName === 'Membership') return true;
    
    return false;
  };

  const handleContinue = () => {
    if (!selectedPlan) return;
    
    // Don't allow continuing if the selected plan is the current plan
    if (isCurrentPlan(selectedPlan.name)) return;
    
    // Store selected plan in localStorage
    localStorage.setItem('onboarding_plan', JSON.stringify(selectedPlan));
    
    // Free plan skips billing, go straight to home
    if (selectedPlan.id === 'free') {
      localStorage.setItem('velvetlog_onboarding_complete', 'true');
      setLocation('/home');
      return;
    }
    
    // Membership plan goes to billing
    setLocation('/onboarding/billing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              VelvetLog
            </h1>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the plan that best fits your relationship management needs. You can change or cancel anytime.
          </p>
          <div className="flex items-center justify-center mt-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-semibold">1</div>
              <span>Choose Plan</span>
              <ArrowRight className="w-4 h-4" />
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-semibold">2</div>
              <span className="text-gray-400">Billing Info</span>
            </div>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto items-center mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`w-full lg:w-1/3 cursor-pointer transition-all duration-200 ${
                selectedPlan?.id === plan.id 
                  ? 'ring-2 ring-pink-500 shadow-lg scale-105' 
                  : 'hover:shadow-lg hover:scale-102'
              } ${
                plan.popular 
                  ? 'bg-gradient-to-br from-gray-900 to-purple-900 text-white border-0' 
                  : 'bg-white border border-gray-200'
              }`}
              onClick={() => setSelectedPlan(plan)}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-semibold py-1 px-3 rounded-t-lg text-center">
                  Most Popular
                </div>
              )}
              <CardHeader className="pb-8 pt-8">
                <h3 className={`text-xl font-semibold mb-4 ${
                  plan.popular ? 'text-purple-300' : 'text-purple-600'
                }`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline mb-4">
                  <span className={`text-5xl font-bold ${
                    plan.popular ? 'text-white' : 'text-gray-900'
                  }`}>
                    ${plan.price}
                  </span>
                  <span className={`text-lg ml-2 ${
                    plan.popular ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    /month
                  </span>
                </div>
                <p className={plan.popular ? 'text-gray-300' : 'text-gray-600'}>
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pb-8">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className={`h-5 w-5 ${
                        plan.popular ? 'text-purple-300' : 'text-purple-500'
                      }`} />
                      <span className={plan.popular ? 'text-gray-200' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button 
            onClick={handleContinue}
            disabled={!selectedPlan || (selectedPlan && isCurrentPlan(selectedPlan.name))}
            className={`px-8 py-3 text-lg font-medium ${
              selectedPlan && isCurrentPlan(selectedPlan.name)
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
            }`}
          >
            {selectedPlan && isCurrentPlan(selectedPlan.name) 
              ? 'Current Plan'
              : selectedPlan?.id === 'free'
                ? 'Get Started Free'
                : 'Continue to Billing'
            }
            {!(selectedPlan && isCurrentPlan(selectedPlan.name)) && (
              <ArrowRight className="w-5 h-5 ml-2" />
            )}
          </Button>
          {!selectedPlan && (
            <p className="text-sm text-gray-500 mt-2">Please select a plan to continue</p>
          )}
          {selectedPlan && isCurrentPlan(selectedPlan.name) && (
            <p className="text-sm text-gray-500 mt-2">You are already on this plan</p>
          )}
        </div>

        {/* Membership Note */}
        {selectedPlan?.id === 'membership' && (
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-2">
              Cancel anytime • No hidden fees
            </p>
          </div>
        )}
      </div>
    </div>
  );
}