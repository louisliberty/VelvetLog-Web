import { useEffect } from "react";
import { Heart, Shield, Users, Clock } from "lucide-react";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";

export default function AboutPage() {
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    document.title = "About Us | VelvetLog";
  }, []);
  
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
                    className="text-pink-600 font-medium border-b-2 border-pink-600"
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
                    className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                We're improving the way people{" "}
                <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  connect
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                VelvetLog brings discretion and organization to relationship management. 
                We believe meaningful connections deserve thoughtful attention, and privacy 
                should never be compromised. Our platform helps you nurture relationships 
                with complete confidence and security, ensuring every interaction is 
                remembered and every moment matters.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-6 mt-12">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Complete Privacy
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    End-to-end encryption ensures your data stays private
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Smart Organization
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Intuitive tools to manage all your connections
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Never Forget
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Smart reminders for important dates and follow-ups
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Meaningful Connections
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Tools designed to deepen your relationships
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Content */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {/* Top Left */}
              <div className="bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-900/40 dark:to-purple-900/40 rounded-2xl p-6 h-48 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-pink-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Relationship<br />Management
                  </p>
                </div>
              </div>

              {/* Top Right */}
              <div className="bg-gradient-to-br from-purple-200 to-indigo-200 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-2xl p-6 h-32 flex items-center justify-center mt-8">
                <div className="text-center">
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Secure & Private
                  </p>
                </div>
              </div>

              {/* Bottom Left */}
              <div className="bg-gradient-to-br from-indigo-200 to-pink-200 dark:from-indigo-900/40 dark:to-pink-900/40 rounded-2xl p-6 h-32 flex items-center justify-center -mt-4">
                <div className="text-center">
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Smart Reminders
                  </p>
                </div>
              </div>

              {/* Bottom Right */}
              <div className="bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-900/40 dark:to-purple-900/40 rounded-2xl p-6 h-48 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Connection<br />Insights
                  </p>
                </div>
              </div>
            </div>

            {/* Floating decorative elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-60"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full opacity-40"></div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mt-24 text-center max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Our Mission
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            To provide a secure, private, and intuitive platform that helps individuals 
            manage their personal relationships with confidence and discretion. We believe 
            everyone deserves tools that help them build meaningful connections while 
            respecting their privacy.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}