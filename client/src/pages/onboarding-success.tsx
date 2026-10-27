import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, CheckCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function OnboardingSuccess() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const hasShownToast = useRef(false);

  useEffect(() => {
    document.title = "Welcome | VelvetLog";
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  useEffect(() => {
    // Only run once on mount
    if (hasShownToast.current) return;
    hasShownToast.current = true;
    
    // Refresh user data to get updated subscription status
    refreshUser();
    
    // Mark onboarding as complete
    localStorage.setItem('velvetlog_onboarding_complete', 'true');
    
    // Show success message
    toast({
      title: "Welcome to VelvetLog!",
      description: "Your trial has started successfully. Let's begin managing your connections.",
    });

    // Clear any onboarding data from localStorage
    localStorage.removeItem('onboarding_plan');
  }, []);

  const handleContinue = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-full">
                <Heart className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome to VelvetLog!</h1>
            <p className="text-lg text-gray-600">Your subscription is active and your trial has begun</p>
          </div>

          {/* Success Card */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-700 font-semibold mb-4">
                <CheckCircle className="w-6 h-6" />
                Setup Complete!
              </div>
              <div className="space-y-3 text-sm text-green-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                  7-day free trial activated
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                  Payment method securely saved
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                  Full access to all features unlocked
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                  Ready to start managing your connections
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">What's Next?</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                Add your first contact with photos and details
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                Log interactions and track your relationship timeline
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                Set reminders for important dates and follow-ups
              </li>
            </ul>
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}