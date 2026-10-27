import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, Heart } from "lucide-react";
import Footer from "@/components/footer";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function PricingPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    document.title = "Pricing | VelvetLog";
  }, []);

  const handleGetStarted = () => {
    setLocation("/auth");
  };

  // Helper function to check if a plan is the user's current plan
  const isCurrentPlan = (planName: string) => {
    if (!isAuthenticated || !user) return false;
    
    const hasActiveSubscription = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';
    
    // Free plan is current if user is authenticated but has no active subscription
    if (planName === 'Free' && !hasActiveSubscription) return true;
    
    // Membership plan is current if user has an active subscription
    if (planName === 'Membership' && hasActiveSubscription) return true;
    
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                VelvetLog
              </h1>
            </a>
            <nav className="hidden md:flex items-center space-x-6">
              <a 
                href="/" 
                className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
              >
                Home
              </a>
              {!isAuthenticated && (
                <>
                  <a 
                    href="/about" 
                    className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
                  >
                    About
                  </a>
                  <a 
                    href="/solutions" 
                    className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
                  >
                    Solutions
                  </a>
                  <a 
                    href="/pricing" 
                    className="text-pink-600 font-medium border-b-2 border-pink-600"
                  >
                    Pricing
                  </a>
                  <a 
                    href="/faq" 
                    className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
                  >
                    FAQ
                  </a>
                  <a 
                    href="/contact" 
                    className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
                  >
                    Contact
                  </a>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-6">
            Pricing
          </h1>
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Choose the right plan for you
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Manage your most important relationships for free or become a member with the best features to build meaningful connections and never miss a step, all while maintaining your privacy.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
          {/* Free Plan */}
          <Card className={`w-full border shadow-lg ${
            isCurrentPlan('Free') 
              ? 'bg-gray-100 dark:bg-gray-900 border-pink-300 dark:border-pink-600 ring-2 ring-pink-200 dark:ring-pink-800' 
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}>
            <CardHeader className="pb-8 pt-8">
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-4">
                Free
              </h3>
              <div className="flex items-baseline mb-4">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">$0</span>
                <span className="text-lg text-gray-500 dark:text-gray-400 ml-2">/month</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Perfect for getting started.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Up to 5 contacts</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Basic timeline tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Simple reminders</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Basic privacy features</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Text-only notes</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Email support</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className={`w-full mt-8 ${
                  isCurrentPlan('Free')
                    ? 'border-pink-400 text-pink-600 bg-pink-50 dark:border-pink-500 dark:text-pink-400 dark:bg-pink-900/20 cursor-default'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                onClick={isCurrentPlan('Free') ? undefined : handleGetStarted}
                disabled={isCurrentPlan('Free')}
              >
                {isCurrentPlan('Free') ? 'Current Plan' : 'Get Started Free'}
              </Button>
            </CardContent>
          </Card>

          {/* Membership Plan - Highlighted */}
          <Card className={`w-full text-white shadow-2xl border-0 relative ${
            isCurrentPlan('Membership') 
              ? 'bg-gradient-to-br from-gray-600 to-gray-700 ring-2 ring-purple-300' 
              : 'bg-gradient-to-br from-gray-900 to-purple-900'
          }`}>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-medium">
                Recommended
              </div>
            </div>
            <CardHeader className="pb-8 pt-12">
              <h3 className="text-xl font-semibold text-purple-300 mb-4">
                Membership
              </h3>
              <div className="flex items-baseline mb-4">
                <span className="text-5xl font-bold text-white">$7</span>
                <span className="text-2xl font-bold text-white">.99</span>
                <span className="text-lg text-gray-300 ml-2">/month</span>
              </div>
              <p className="text-gray-300">
                Full access to all features for serious relationship management.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-purple-300" />
                  <span className="text-gray-200">Unlimited contacts</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-purple-300" />
                  <span className="text-gray-200">Photo & video uploads (5GB)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-purple-300" />
                  <span className="text-gray-200">Advanced AI insights</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-purple-300" />
                  <span className="text-gray-200">Custom reminder automation</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-purple-300" />
                  <span className="text-gray-200">Multi-factor authentication</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-purple-300" />
                  <span className="text-gray-200">White-glove setup</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-purple-300" />
                  <span className="text-gray-200">Email support</span>
                </div>
              </div>
              <Button 
                className={`w-full mt-8 text-white font-medium ${
                  isCurrentPlan('Membership')
                    ? 'bg-purple-400 cursor-default'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                }`}
                onClick={isCurrentPlan('Membership') ? undefined : handleGetStarted}
                disabled={isCurrentPlan('Membership')}
              >
                {isCurrentPlan('Membership') ? 'Current Plan' : 'Upgrade to Membership'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            All plans include a 7-day free trial.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Cancel anytime. Your data is always yours.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}