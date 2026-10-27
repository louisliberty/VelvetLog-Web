import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { loadStripe } from "@stripe/stripe-js";

import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, ArrowLeft, ArrowRight, CreditCard, Shield, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.error('🔧 Missing Stripe public key');
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

console.log('🔧 Initializing Stripe with key:', import.meta.env.VITE_STRIPE_PUBLIC_KEY?.substring(0, 10) + '...');
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  stripePriceId: string;
}

const CheckoutForm = ({ plan, onClose }: { plan: Plan; onClose: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔧 Setup Intent submit attempt');

    if (!stripe || !elements) {
      console.log('🔧 Stripe not ready:', { stripe: !!stripe, elements: !!elements });
      toast({
        title: "Payment System Loading",
        description: "Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔧 Confirming setup intent with Stripe');
      const { error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/onboarding/success`,
        },
      });

      if (error) {
        console.error('🔧 Stripe setup error:', error);
        toast({
          title: "Payment Setup Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('🔧 Setup successful, redirecting to app');
        toast({
          title: "Welcome to VelvetLog!",
          description: "Your trial has started successfully.",
        });
        setLocation("/");
      }
    } catch (error) {
      console.error('🔧 Setup confirmation error:', error);
      toast({
        title: "Setup Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <PaymentElement 
            options={{
              layout: "tabs",
              fields: {
                billingDetails: "auto"
              },
              wallets: {
                applePay: "never",
                googlePay: "never"
              },
              paymentMethodOrder: ['card']
            }}
          />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield className="w-4 h-4 text-green-600" />
          <span>Your payment information is secure and encrypted</span>
        </div>

        <div className="flex gap-3 pt-4 sticky bottom-0 bg-white border-t pt-4 -mx-2 px-2">
          <Button 
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={!stripe || isLoading}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
          >
            {isLoading ? "Processing..." : `Start Trial - $${plan.price}/month`}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default function OnboardingBilling() {
  useEffect(() => {
    document.title = "Billing | VelvetLog";
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Get selected plan from localStorage
    const storedPlan = localStorage.getItem('onboarding_plan');
    if (!storedPlan) {
      // Redirect back to plan selection if no plan is stored
      setLocation('/onboarding/plan');
      return;
    }

    const selectedPlan = JSON.parse(storedPlan);
    setPlan(selectedPlan);
  }, [setLocation]);

  const handleGoBack = () => {
    setLocation('/onboarding/plan');
  };

  const handleStartTrial = async () => {
    if (!plan) return;
    
    try {
      console.log('🔧 Creating subscription for plan:', plan.stripePriceId);
      setShowPaymentModal(true); // Show modal immediately with loading state
      
      // Create subscription intent
      const res = await apiRequest("POST", "/api/create-subscription", { 
        priceId: plan.stripePriceId 
      });
      const data = await res.json();
      console.log('🔧 Subscription response:', data);
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error('No client secret received');
      }
    } catch (error) {
      console.error('🔧 Subscription setup error:', error);
      setShowPaymentModal(false);
      toast({
        title: "Setup Error",
        description: "Failed to initialize billing. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setClientSecret("");
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plan details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              VelvetLog
            </h1>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Complete Your Setup
          </h2>
          <p className="text-xl text-gray-600">
            Enter your billing information to start your 7-day free trial
          </p>
          <div className="flex items-center justify-center mt-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">✓</div>
              <span className="text-green-600">Plan Selected</span>
              <ArrowRight className="w-4 h-4" />
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-semibold">2</div>
              <span>Billing Info</span>
            </div>
          </div>
        </div>

        {/* Plan Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-pink-600" />
              Plan Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{plan.name} Plan</h3>
                <p className="text-gray-600">{plan.description}</p>
                <p className="text-sm text-green-600 mt-1">7-day free trial included</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${plan.price}</p>
                <p className="text-gray-500">/month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trial Benefits */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 text-green-700 font-semibold mb-3">
            <Shield className="w-5 h-5" />
            7-Day Free Trial Included
          </div>
          <ul className="text-sm text-green-600 space-y-2">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
              Try all features risk-free for 7 days
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
              Cancel anytime during trial with no charges
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
              Secure payment processing by Stripe
            </li>
          </ul>
        </div>

        {/* Start Trial Button */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <Button
              onClick={handleStartTrial}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-5 font-semibold h-auto flex flex-col items-center justify-center gap-1"
            >
              <span className="text-xl font-bold">Start Free Trial</span>
              <span className="text-base font-normal opacity-90">Add Payment Method</span>
            </Button>
            <p className="text-center text-sm text-gray-500 mt-3">
              You'll be charged ${plan.price}/month after your 7-day trial ends
            </p>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Plans
          </Button>
          
          <div className="text-sm text-gray-500 text-right">
            <p>No charges during your 7-day trial</p>
            <p>Cancel anytime from your account settings</p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-pink-600" />
              Add Payment Method
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>7-day free trial</strong> - You won't be charged until {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe'
                }
              }}>
                <CheckoutForm plan={plan} onClose={handleCloseModal} />
              </Elements>
            )}
            {!clientSecret && (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-gray-600">Setting up your billing...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}