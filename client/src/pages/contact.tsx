import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MapPin, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/footer";
import { SmartPhoneInput } from "@/components/smart-phone-input";
import { useAuth } from "@/hooks/use-auth";

export default function ContactPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    document.title = "Contact Us | VelvetLog";
  }, []);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Comprehensive validation
    if (!formData.firstName.trim()) {
      toast({
        title: "First name required",
        description: "Please enter your first name.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.lastName.trim()) {
      toast({
        title: "Last name required",
        description: "Please enter your last name.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message.",
        variant: "destructive"
      });
      return;
    }

    if (formData.message.trim().length < 100) {
      toast({
        title: "Message too short",
        description: `Please enter at least 100 characters. Current: ${formData.message.trim().length}`,
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send message");
      }
      
      toast({
        title: "Message sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: ""
      });
    } catch (error: any) {
      toast({
        title: "Failed to send",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                    className="text-pink-600 font-medium border-b-2 border-pink-600"
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
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Get in touch
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                Have questions about VelvetLog? Need help with your relationship management? 
                We're here to help you maintain your connections with complete privacy and confidence. 
                Reach out to us anytime.
              </p>
            </div>


          </div>

          {/* Right Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">
                    First name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="border-gray-200 dark:border-gray-600 focus:border-pink-500 dark:focus:border-pink-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">
                    Last name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="border-gray-200 dark:border-gray-600 focus:border-pink-500 dark:focus:border-pink-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="border-gray-200 dark:border-gray-600 focus:border-pink-500 dark:focus:border-pink-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
                  Phone number <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(begin with country code)</span>
                </Label>
                <SmartPhoneInput
                  value={formData.phone}
                  onChange={(value) => handleInputChange("phone", value)}
                  placeholder="Enter phone number"
                  className="border-gray-200 dark:border-gray-600 focus:border-pink-500 dark:focus:border-pink-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="message" className="text-gray-700 dark:text-gray-300">
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <span className={`text-xs ${formData.message.length < 100 ? 'text-red-500' : 'text-green-600'}`}>
                    {formData.message.length}/100 minimum
                  </span>
                </div>
                <Textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  className="border-gray-200 dark:border-gray-600 focus:border-pink-500 dark:focus:border-pink-400 resize-none"
                  placeholder="Tell us how we can help you (minimum 100 characters)..."
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={
                  !formData.firstName.trim() ||
                  !formData.lastName.trim() ||
                  !formData.email.trim() ||
                  !formData.phone.trim() ||
                  !formData.message.trim() ||
                  formData.message.trim().length < 100
                }
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium py-3"
              >
                Send message
              </Button>
            </form>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy First Support
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We understand the sensitive nature of relationship management. All support communications 
              are handled with the utmost discretion and confidentiality. Your privacy is our priority.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}