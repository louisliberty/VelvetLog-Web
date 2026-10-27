import { Heart } from "lucide-react";

export default function Footer() {

  return (
    <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-pink-100 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Solutions */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Solutions
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/solutions" className="text-sm text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  Relationship Management
                </a>
              </li>
              <li>
                <a href="/solutions" className="text-sm text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  Privacy & Security
                </a>
              </li>
              <li>
                <a href="/solutions" className="text-sm text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  Timeline Tracking
                </a>
              </li>
              <li>
                <a href="/solutions" className="text-sm text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  Smart Reminders
                </a>
              </li>
              <li>
                <a href="/solutions" className="text-sm text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  Connection Insights
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/about" className="text-sm text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="/solutions" className="text-sm text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  Solutions
                </a>
              </li>
              <li>
                <a href="/pricing" className="text-sm text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/faq" className="text-sm text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/calendar" className="text-sm text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  Calendar
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  Terms of service
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-sm text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                  Privacy policy
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <a href="/" className="flex items-center space-x-2 mb-4 md:mb-0 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                VelvetLog
              </span>
            </a>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 VelvetLog. All rights reserved. Designed for discrete relationship management.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}