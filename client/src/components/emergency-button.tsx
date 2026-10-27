import { useState, useEffect } from "react";
import { Phone, PhoneCall, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EmergencyButtonProps {
  position?: "floating" | "header";
  onActivate?: () => void;
}

export default function EmergencyButton({ position = "floating", onActivate }: EmergencyButtonProps) {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const emergencyOptions = [
    {
      id: "fake-call",
      title: "Fake Call",
      description: "Receive a realistic incoming call",
      action: () => triggerFakeCall(),
      icon: <Phone className="w-5 h-5" />,
      delay: 3
    },
    {
      id: "urgent-call",
      title: "Urgent Family Call",
      description: "Emergency family situation call",
      action: () => triggerUrgentCall(),
      icon: <PhoneCall className="w-5 h-5" />,
      delay: 5
    },
    {
      id: "work-emergency",
      title: "Work Emergency",
      description: "Important work-related call",
      action: () => triggerWorkCall(),
      icon: <Shield className="w-5 h-5" />,
      delay: 2
    }
  ];

  const triggerFakeCall = () => {
    // Create realistic call interface
    const callOverlay = document.createElement('div');
    callOverlay.className = 'fixed inset-0 z-[9999] bg-black text-white';
    callOverlay.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full">
        <div class="text-center mb-8">
          <div class="w-32 h-32 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span class="text-4xl">👤</span>
          </div>
          <h2 class="text-2xl font-semibold mb-2">Mom</h2>
          <p class="text-gray-400">Incoming call...</p>
        </div>
        <div class="flex space-x-8">
          <button id="decline-call" class="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.68.28-.53 0-.96-.43-.96-.96V9.72C2.6 10.25 2 11.06 2 12c0 .94.6 1.75 1.54 2.28v5.44c0 .53.43.96.96.96.25 0 .5-.1.68-.28.79-.73 1.68-1.36 2.66-1.85.33-.16.56-.51.56-.9v-3.1C9.85 14.75 11.4 15 13 15s3.15-.25 4.6-.72v3.1c0 .39.23.74.56.9.98.49 1.87 1.12 2.66 1.85.18.18.43.28.68.28.53 0 .96-.43.96-.96v-5.44C22.4 13.75 23 12.94 23 12c0-.94-.6-1.75-1.54-2.28V4.28c0-.53-.43-.96-.96-.96-.25 0-.5.1-.68.28-.79.73-1.68 1.36-2.66 1.85-.33.16-.56.51-.56.9v3.1C16.15 9.25 14.6 9 13 9z"/>
            </svg>
          </button>
          <button id="accept-call" class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(callOverlay);

    // Handle call actions
    document.getElementById('decline-call')?.addEventListener('click', () => {
      document.body.removeChild(callOverlay);
      setIsEmergencyMode(false);
    });

    document.getElementById('accept-call')?.addEventListener('click', () => {
      // Simulate call in progress
      callOverlay.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full">
          <div class="text-center mb-8">
            <div class="w-32 h-32 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span class="text-4xl">👤</span>
            </div>
            <h2 class="text-2xl font-semibold mb-2">Mom</h2>
            <p class="text-green-400">Call in progress...</p>
          </div>
          <div class="flex space-x-8">
            <button id="end-call" class="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.68.28-.53 0-.96-.43-.96-.96V9.72C2.6 10.25 2 11.06 2 12c0 .94.6 1.75 1.54 2.28v5.44c0 .53.43.96.96.96.25 0 .5-.1.68-.28.79-.73 1.68-1.36 2.66-1.85.33-.16.56-.51.56-.9v-3.1C9.85 14.75 11.4 15 13 15s3.15-.25 4.6-.72v3.1c0 .39.23.74.56.9.98.49 1.87 1.12 2.66 1.85.18.18.43.28.68.28.53 0 .96-.43.96-.96v-5.44C22.4 13.75 23 12.94 23 12c0-.94-.6-1.75-1.54-2.28V4.28c0-.53-.43-.96-.96-.96-.25 0-.5.1-.68.28-.79.73-1.68 1.36-2.66 1.85-.33.16-.56.51-.56.9v3.1C16.15 9.25 14.6 9 13 9z"/>
              </svg>
            </button>
          </div>
        </div>
      `;

      document.getElementById('end-call')?.addEventListener('click', () => {
        document.body.removeChild(callOverlay);
        setIsEmergencyMode(false);
      });
    });

    onActivate?.();
  };

  const triggerUrgentCall = () => {
    // Similar implementation for urgent family call
    triggerFakeCall(); // Simplified for demo
  };

  const triggerWorkCall = () => {
    // Similar implementation for work emergency
    triggerFakeCall(); // Simplified for demo
  };

  const handleEmergencyActivation = (option: typeof emergencyOptions[0]) => {
    setCountdown(option.delay);
    setTimeout(() => {
      option.action();
      setIsEmergencyMode(false);
      setCountdown(0);
    }, option.delay * 1000);
  };

  if (position === "floating") {
    return (
      <>
        {/* Floating Emergency Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsEmergencyMode(true)}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 shadow-lg"
            title="Emergency Exit"
          >
            <Shield className="w-6 h-6 text-white" />
          </Button>
        </div>

        {/* Emergency Options Modal */}
        {isEmergencyMode && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60]">
            <Card className="w-full max-w-md border-red-200">
              <CardHeader className="bg-red-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Emergency Exit
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEmergencyMode(false)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription className="text-red-600">
                  Choose a discreet way to exit this situation
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 p-4">
                {emergencyOptions.map((option) => (
                  <Button
                    key={option.id}
                    onClick={() => handleEmergencyActivation(option)}
                    disabled={countdown > 0}
                    variant="outline"
                    className="w-full justify-start h-auto p-4 border-gray-200 hover:border-red-300"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-red-600 mt-1">
                        {option.icon}
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium text-gray-900">
                          {option.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {option.description}
                        </div>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {option.delay}s delay
                        </Badge>
                      </div>
                    </div>
                  </Button>
                ))}

                {countdown > 0 && (
                  <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-amber-800 font-medium">
                      Emergency call incoming in {countdown}s...
                    </p>
                    <Button
                      onClick={() => {
                        setCountdown(0);
                        setIsEmergencyMode(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="mt-2 border-amber-300 text-amber-700"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </>
    );
  }

  // Header emergency button (compact version)
  return (
    <Button
      onClick={() => setIsEmergencyMode(true)}
      variant="ghost"
      size="sm"
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
      title="Emergency Exit"
    >
      <Shield className="w-4 h-4" />
    </Button>
  );
}