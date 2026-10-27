import { useEffect } from "react";
import { Heart } from "lucide-react";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";

export default function FAQPage() {
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    document.title = "Frequently Asked Questions | VelvetLog";
  }, []);
  const faqs = [
    {
      question: "Is my data completely private and secure?",
      answer: "Absolutely. VelvetLog uses end-to-end encryption to protect all your personal information. Only you have access to your relationship data, and we never share or sell your information to third parties."
    },
    {
      question: "How do you handle data storage and backups?",
      answer: "Your data is securely encrypted before storage and backed up across multiple secure servers. We use industry-standard AES-256 encryption, and all backups maintain the same level of security as your primary data."
    },
    {
      question: "Can I export my data if I want to leave?",
      answer: "Yes, you have complete control over your data. You can export all your contacts, timeline entries, and notes at any time through your account settings. We believe your data belongs to you."
    },
    {
      question: "What makes VelvetLog different from other apps?",
      answer: "VelvetLog is specifically designed for discrete relationship management with privacy as the top priority. We focus on helping you maintain meaningful connections without compromising your personal information."
    },
    {
      question: "Do you offer customer support?",
      answer: "Yes, we provide dedicated support through our contact form and email. All support communications are handled with complete discretion and confidentiality, understanding the sensitive nature of relationship management."
    },
    {
      question: "Can I use VelvetLog on multiple devices?",
      answer: "Yes, VelvetLog syncs securely across all your devices. Your encrypted data is synchronized in real-time, so you can access your information from your phone, tablet, or computer while maintaining complete security."
    }
  ];

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
                    className="text-gray-700 hover:text-pink-600 transition-colors font-medium"
                  >
                    Pricing
                  </a>
                  <a 
                    href="/faq" 
                    className="text-pink-600 font-medium border-b-2 border-pink-600"
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
        {/* Header Section */}
        <div className="mb-16">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently asked questions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-4xl">
            Have a different question and can't find the answer you're looking for? Reach out to our 
            support team by{" "}
            <a 
              href="/contact" 
              className="text-pink-600 hover:text-pink-700 font-medium underline"
            >
              sending us an email
            </a>{" "}
            and we'll get back to you as soon as we can.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {faqs.map((faq, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                {faq.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>


      </div>

      <Footer />
    </div>
  );
}