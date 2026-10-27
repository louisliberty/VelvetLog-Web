import { useEffect } from "react";
import { Heart, Shield, Clock, Brain, History, Users } from "lucide-react";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";

export default function SolutionsPage() {
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    document.title = "Our Solutions | VelvetLog";
  }, []);
  const solutions = [
    {
      icon: Users,
      title: "Relationship Management",
      description: "Organize and track multiple connections with detailed profiles, preferences, and relationship status. Keep all your important relationship data in one secure, private place.",
      features: [
        "Comprehensive partner profiles with age, location, and preferences",
        "Relationship status tracking (casual, serious, dating, ended)",
        "Private notes and observations for each connection",
        "Photo and document attachment capabilities"
      ]
    },
    {
      icon: History,
      title: "Timeline Tracking",
      description: "Document every interaction, date, call, and meaningful moment to build a comprehensive history of your relationships and connections.",
      features: [
        "Detailed interaction logging (calls, texts, dates, meetings)",
        "Activity summaries with mood and context tracking",
        "Visual timeline view of relationship progression",
        "Quick interaction logger with follow-up scheduling"
      ]
    },
    {
      icon: Clock,
      title: "Smart Reminders",
      description: "Never miss important dates, follow-ups, or opportunities to connect. Our intelligent reminder system helps you stay engaged with your network.",
      features: [
        "Birthday and anniversary notifications",
        "Follow-up reminders after dates or conversations",
        "Gift suggestion alerts based on preferences",
        "Customizable notification timing and frequency"
      ]
    },
    {
      icon: Brain,
      title: "Connection Insights",
      description: "Gain valuable insights into your relationship patterns, communication frequency, and connection quality to improve your personal relationships.",
      features: [
        "Relationship pattern analysis and trends",
        "Communication frequency tracking",
        "Mood and interaction quality metrics",
        "Personalized relationship improvement suggestions"
      ]
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Enterprise-grade encryption and privacy controls ensure your relationship data remains completely confidential and secure from unauthorized access.",
      features: [
        "End-to-end AES-256 encryption for all data",
        "Multi-factor authentication with TOTP support",
        "Zero-knowledge architecture - we can't see your data",
        "Secure local storage with encrypted cloud backup"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-pink-100 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                VelvetLog
              </span>
            </a>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                Home
              </a>
              {!isAuthenticated && (
                <>
                  <a href="/about" className="text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    About
                  </a>
                  <a href="/solutions" className="text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    Solutions
                  </a>
                  <a href="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    Pricing
                  </a>
                  <a href="/faq" className="text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    FAQ
                  </a>
                  <a href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                    Contact
                  </a>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Elevate every relationship
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Build meaningful connections while maintaining complete discretion and security. 
            Streamline your relationship management with VelvetLog's comprehensive suite of privacy-focused tools.
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="space-y-16">
          {solutions.map((solution, index) => (
            <div key={solution.title} className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              {/* Content */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <solution.icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {solution.title}
                  </h2>
                </div>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {solution.description}
                </p>

                <ul className="space-y-3">
                  {solution.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual Mockup */}
              <div className="flex-1 max-w-lg">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-pink-100 dark:border-gray-700">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-pink-100 dark:border-gray-600">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <solution.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {solution.title}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-3 h-3 bg-red-400 rounded-full" />
                        <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                        <div className="w-3 h-3 bg-green-400 rounded-full" />
                      </div>
                    </div>

                    {/* Content based on solution type */}
                    {solution.title === "Relationship Management" && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white text-sm">Sarah Chen</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Dating • New York</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white text-sm">Alex Morgan</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Serious • Los Angeles</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {solution.title === "Privacy & Security" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Encryption</span>
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <span className="text-sm text-gray-700 dark:text-gray-300">2FA Enabled</span>
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                        </div>
                      </div>
                    )}

                    {solution.title === "Timeline Tracking" && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className="w-2 h-2 bg-pink-500 rounded-full" />
                          <span>Coffee date • 2 days ago</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className="w-2 h-2 bg-purple-500 rounded-full" />
                          <span>Phone call • 1 week ago</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span>Text message • 2 weeks ago</span>
                        </div>
                      </div>
                    )}

                    {solution.title === "Smart Reminders" && (
                      <div className="space-y-2">
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-400">
                          <div className="text-xs font-medium text-gray-900 dark:text-white">Birthday reminder</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Sarah's birthday tomorrow</div>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-400">
                          <div className="text-xs font-medium text-gray-900 dark:text-white">Follow-up</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Check in with Alex</div>
                        </div>
                      </div>
                    )}

                    {solution.title === "Connection Insights" && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Communication frequency</span>
                          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div className="w-12 h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" />
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Relationship quality</span>
                          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div className="w-14 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to transform your relationships?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust VelvetLog to manage and <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">enhance their personal connections</span> with complete privacy and professional discretion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
              >
                Get started for free
              </a>
              <a
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-pink-200 dark:border-pink-700 text-base font-medium rounded-lg text-pink-600 dark:text-pink-400 bg-transparent hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all"
              >
                View pricing
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}