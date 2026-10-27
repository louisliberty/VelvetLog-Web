import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    document.title = "Page Not Found | VelvetLog";
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(250,15%,6%)] text-white flex flex-col">
      <header className="w-full bg-[hsl(250,15%,6%)]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-bold text-white">VelvetLog</span>
            </a>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="relative mb-8">
            <span className="text-[120px] sm:text-[160px] font-bold leading-none bg-gradient-to-b from-purple-400/30 to-transparent bg-clip-text text-transparent select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-3">
            Page not found
          </h1>
          <p className="text-gray-400 mb-8 text-sm sm:text-base leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Head back to learn more about VelvetLog.
          </p>

          <a href="/">
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full px-8 shadow-lg shadow-purple-500/25"
            >
              Back to Home
            </Button>
          </a>
        </div>
      </div>

      <footer className="py-6 text-center text-gray-500 text-xs border-t border-white/5">
        &copy; {new Date().getFullYear()} VelvetLog. All rights reserved.
      </footer>
    </div>
  );
}
