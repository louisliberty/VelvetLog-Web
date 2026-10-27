import { useEffect } from "react";
import { Heart, Shield, Bell, CalendarDays, Users, Sparkles, ChevronRight, Star, Lock, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

import homeScreen from "@assets/01_Home_Connections_1771457232284.png";
import addConnection1 from "@assets/02_Adding_Connection_1_1771457232285.png";
import remindersScreen from "@assets/04_Reminders_1771457232285.png";
import reminderCloseup from "@assets/05_Reminder_Close-Up_1_1771457232286.png";
import calendarScreen from "@assets/07_Calendar_1771457232286.png";
import accountStats from "@assets/08_Account_Statistics_1771457232287.jpg";

function PhoneFrame({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative mx-auto w-[260px] h-[520px] bg-gray-900 rounded-[40px] border-[6px] border-gray-700 shadow-2xl shadow-purple-500/20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover object-top"
        />
      </div>
    </div>
  );
}

export default function Landing() {
  useEffect(() => {
    document.title = "VelvetLog | Your Private Relationship Manager";
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(250,15%,6%)] text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[hsl(250,15%,6%)]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-bold text-white">VelvetLog</span>
            </a>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
              <a href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a>
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-full px-6"
                onClick={() => window.open('#download', '_self')}
              >
                Download App
              </Button>
            </nav>
            <Button
              size="sm"
              className="md:hidden bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-full px-4"
              onClick={() => window.open('#download', '_self')}
            >
              Download
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px]" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-8">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Now available on iOS & Android</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your Private{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                Relationship Manager
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Track your connections, set smart reminders, and never forget the details that matter. 
              Built for discretion. Designed for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center" id="download">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100 rounded-full px-8 py-6 text-base font-semibold gap-2"
                onClick={() => window.open('https://apps.apple.com', '_blank')}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                Download for iOS
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-white hover:bg-white/5 rounded-full px-8 py-6 text-base font-semibold gap-2"
                onClick={() => window.open('https://play.google.com', '_blank')}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm.45-3.24L8.8 5.11l8.46 4.88-1 1.89zm3.35 1.67c.37.22.59.62.59 1.06 0 .44-.22.84-.59 1.06l-1.85 1.07-2.34-2.34 2.34-2.34 1.85 1.49z"/></svg>
                Download for Android
              </Button>
            </div>
          </div>

          {/* Phone Mockups */}
          <div className="flex items-center justify-center gap-6 md:gap-10">
            <div className="hidden md:block animate-float-delayed">
              <PhoneFrame src={remindersScreen} alt="Smart Reminders" className="transform -rotate-6 scale-90 opacity-80" />
            </div>
            <div className="animate-float">
              <PhoneFrame src={homeScreen} alt="VelvetLog Home Screen" className="transform scale-105" />
            </div>
            <div className="hidden md:block animate-float-delayed">
              <PhoneFrame src={calendarScreen} alt="Calendar View" className="transform rotate-6 scale-90 opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="border-y border-white/5 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="ml-2 text-sm text-gray-400">4.9 Rating</span>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-white">100%</span>
              <span className="text-sm text-gray-400 ml-2">Private & Encrypted</span>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-white">2</span>
              <span className="text-sm text-gray-400 ml-2">Platforms (iOS & Android)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">stay organized</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Manage your connections effortlessly with powerful features designed for discretion and ease of use.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Connection Profiles"
              description="Store detailed profiles with photos, birthdays, locations, and personal notes for every connection."
              gradient="from-pink-500 to-rose-600"
            />
            <FeatureCard
              icon={<Bell className="w-6 h-6" />}
              title="Smart Reminders"
              description="Never miss a birthday, anniversary, or follow-up. AI-powered suggestions keep you one step ahead."
              gradient="from-purple-500 to-indigo-600"
            />
            <FeatureCard
              icon={<CalendarDays className="w-6 h-6" />}
              title="Calendar View"
              description="See all your upcoming events, dates, and reminders in a clean monthly calendar layout."
              gradient="from-indigo-500 to-purple-600"
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Quick Interaction Logging"
              description="Log calls, texts, dates, and meetings in seconds. Track mood, outcome, and follow-up needs."
              gradient="from-amber-500 to-orange-600"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Privacy First"
              description="Biometric lock, encrypted data, and discreet notifications. Your personal life stays personal."
              gradient="from-emerald-500 to-teal-600"
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="Smart Suggestions"
              description="Get AI-powered reminders for anniversaries, follow-ups, and thoughtful gestures based on your history."
              gradient="from-violet-500 to-purple-600"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              How it{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">works</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Get started in under a minute. Your connections, organized.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 items-start">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Add Your Connections</h3>
              <p className="text-gray-400">Import from contacts or add manually. Include photos, details, and how you met.</p>
              <div className="mt-6">
                <PhoneFrame src={addConnection1} alt="Add Connection" className="transform scale-75" />
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Set Smart Reminders</h3>
              <p className="text-gray-400">Schedule calls, plan dates, and get anniversary alerts. VelvetLog suggests reminders for you.</p>
              <div className="mt-6">
                <PhoneFrame src={reminderCloseup} alt="Reminder Detail" className="transform scale-75" />
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Track Everything</h3>
              <p className="text-gray-400">Log interactions, view your calendar, and see account statistics at a glance.</p>
              <div className="mt-6">
                <img src={accountStats} alt="Account Statistics" className="rounded-2xl border border-white/10 shadow-2xl mx-auto max-w-[220px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Screenshots Showcase */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-purple-600/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Designed for{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">your lifestyle</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-16">
            A beautiful, intuitive interface that keeps your dating life organized and discreet.
          </p>

          <div className="flex items-end justify-center gap-4 md:gap-8">
            <PhoneFrame src={homeScreen} alt="Connections" className="hidden sm:block transform scale-75 md:scale-90 opacity-70" />
            <PhoneFrame src={remindersScreen} alt="Reminders" className="transform scale-90 md:scale-100" />
            <PhoneFrame src={calendarScreen} alt="Calendar" className="hidden sm:block transform scale-75 md:scale-90 opacity-70" />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Simple,{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">transparent pricing</span>
            </h2>
            <p className="text-gray-400 text-lg">Start free. Upgrade when you're ready.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <PricingFeature text="Up to 5 connections" />
                <PricingFeature text="Basic reminders" />
                <PricingFeature text="Timeline logging" />
                <PricingFeature text="Calendar view" />
                <PricingFeature text="Contact import" />
              </ul>
              <Button
                className="w-full rounded-full bg-white/10 hover:bg-white/15 text-white py-6"
                onClick={() => window.open('#download', '_self')}
              >
                Get Started Free
              </Button>
            </div>

            {/* Membership Plan */}
            <div className="relative bg-gradient-to-b from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-3xl p-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
                MOST POPULAR
              </div>
              <h3 className="text-lg font-semibold text-purple-300 mb-2">Membership</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$7.99</span>
                <span className="text-gray-400 ml-1">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <PricingFeature text="Unlimited connections" highlighted />
                <PricingFeature text="AI-powered smart suggestions" highlighted />
                <PricingFeature text="Photo & video uploads" highlighted />
                <PricingFeature text="5GB secure storage" highlighted />
                <PricingFeature text="Multi-factor authentication" highlighted />
                <PricingFeature text="Priority support" highlighted />
                <PricingFeature text="7-day free trial" highlighted />
              </ul>
              <Button
                className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-6 font-semibold"
                onClick={() => window.open('#download', '_self')}
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-600/8 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Lock className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Your privacy is{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">non-negotiable</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-12">
            VelvetLog was built from the ground up with privacy and discretion in mind. 
            Your personal life stays personal.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            <PrivacyFeature icon={<Shield className="w-6 h-6" />} title="End-to-End Encryption" />
            <PrivacyFeature icon={<Lock className="w-6 h-6" />} title="Biometric App Lock" />
            <PrivacyFeature icon={<Bell className="w-6 h-6" />} title="Discreet Notifications" />
            <PrivacyFeature icon={<Heart className="w-6 h-6" />} title="No Data Sharing" />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Frequently asked{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            <FAQItem
              question="What is VelvetLog?"
              answer="VelvetLog is a private relationship management app that helps you keep track of your connections, set reminders for important dates, and log interactions — all with complete discretion and privacy."
            />
            <FAQItem
              question="Is my data private and secure?"
              answer="Absolutely. Your data is encrypted and stored securely. VelvetLog features biometric app lock, discreet notifications, and zero data sharing with third parties. Your personal life stays personal."
            />
            <FAQItem
              question="How much does it cost?"
              answer="VelvetLog is free to use with up to 5 connections. Our Membership plan at $7.99/month unlocks unlimited connections, AI suggestions, photo uploads, and more. Every membership starts with a 7-day free trial."
            />
            <FAQItem
              question="Is it available on iPhone and Android?"
              answer="Yes! VelvetLog is available on both iOS (App Store) and Android (Google Play). Download it today and get started in under a minute."
            />
            <FAQItem
              question="Can I import my existing contacts?"
              answer="Yes, VelvetLog supports importing contacts directly from your phone. You can select which contacts to import and add additional details like relationship type, notes, and more."
            />
            <FAQItem
              question="What happens if I cancel my subscription?"
              answer="If you cancel your Membership, you'll keep access to all features until the end of your billing period. After that, your account reverts to the Free plan with up to 5 connections. Your data is never deleted."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-purple-600/15 to-pink-500/15 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to get{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">organized?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Download VelvetLog today and take control of your dating life with privacy, style, and intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-100 rounded-full px-8 py-6 text-base font-semibold gap-2"
              onClick={() => window.open('https://apps.apple.com', '_blank')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Download for iOS
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-600 text-white hover:bg-white/5 rounded-full px-8 py-6 text-base font-semibold gap-2"
              onClick={() => window.open('https://play.google.com', '_blank')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm.45-3.24L8.8 5.11l8.46 4.88-1 1.89zm3.35 1.67c.37.22.59.62.59 1.06 0 .44-.22.84-.59 1.06l-1.85 1.07-2.34-2.34 2.34-2.34 1.85 1.49z"/></svg>
              Download for Android
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <a href="/" className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="text-lg font-bold text-white">VelvetLog</span>
              </a>
              <p className="text-sm text-gray-500">Your private relationship manager. Built for discretion.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">Pricing</a></li>
                <li><a href="#faq" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="/about" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">About</a></li>
                <li><a href="/contact" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/privacy" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-sm text-gray-600">&copy; 2025 VelvetLog. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }: { icon: React.ReactNode; title: string; description: string; gradient: string }) {
  return (
    <div className="group bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 hover:bg-white/[0.05] transition-all duration-300">
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function PricingFeature({ text, highlighted = false }: { text: string; highlighted?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <Check className={`w-4 h-4 flex-shrink-0 ${highlighted ? 'text-purple-400' : 'text-gray-500'}`} />
      <span className={`text-sm ${highlighted ? 'text-white' : 'text-gray-400'}`}>{text}</span>
    </li>
  );
}

function PrivacyFeature({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-center">
      <div className="text-purple-400 mb-3 flex justify-center">{icon}</div>
      <p className="text-sm font-medium text-white">{title}</p>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
      <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
        <span className="text-base font-medium text-white pr-4">{question}</span>
        <ChevronRight className="w-5 h-5 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0" />
      </summary>
      <div className="px-6 pb-6 pt-0">
        <p className="text-gray-400 text-sm leading-relaxed">{answer}</p>
      </div>
    </details>
  );
}
