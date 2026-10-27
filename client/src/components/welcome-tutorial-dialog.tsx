import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, FileText, Sparkles, ChevronRight, Check } from "lucide-react";

interface WelcomeTutorialDialogProps {
  open: boolean;
  onComplete: () => void;
}

const tutorialSteps = [
  {
    icon: Heart,
    title: "Welcome to VelvetLog",
    description: "Your private space for managing meaningful connections. This quick guide will show you how to get the most value from VelvetLog.",
    tips: [
      "Everything you add stays completely private",
      "Only you can see your connections and notes",
      "No data is ever shared with third parties"
    ]
  },
  {
    icon: FileText,
    title: "Add Rich Details to Connections",
    description: "The more information you add about each connection, the more valuable VelvetLog becomes. Details help you remember what matters most.",
    tips: [
      "Add birthdays to never miss celebrating them",
      "Include where you met for conversation starters",
      "Note their interests, work, and location",
      "Upload photos to put a face to the name"
    ]
  },
  {
    icon: Calendar,
    title: "Create Reminders Consistently",
    description: "Reminders are your secret weapon for staying connected. Set them for important dates and follow-ups to never miss a moment.",
    tips: [
      "Schedule reminders for birthdays and anniversaries",
      "Set follow-up reminders after dates or calls",
      "Plan ahead for gift ideas or special occasions",
      "Use reminders to check in regularly"
    ]
  },
  {
    icon: Sparkles,
    title: "Log Notes After Every Interaction",
    description: "After completing a reminder or having an interaction, add notes about what happened. This builds a rich history you can reference anytime.",
    tips: [
      "Record conversation highlights and topics discussed",
      "Note their mood, updates in their life, or new interests",
      "Track gifts given or received",
      "The more you log, the more personalized your connections become"
    ]
  }
];

export default function WelcomeTutorialDialog({ open, onComplete }: WelcomeTutorialDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const step = tutorialSteps[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onComplete()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <StepIcon className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl">{step.title}</DialogTitle>
          <DialogDescription className="text-base mt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ul className="space-y-3">
            {step.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-pink-600 dark:text-pink-400" />
                </div>
                <span className="text-sm text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-center gap-2 py-2">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? "bg-pink-500"
                  : index < currentStep
                  ? "bg-pink-300"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-col gap-2 pt-2">
          <Button 
            variant="ghost" 
            onClick={handleSkip} 
            className="w-full text-muted-foreground order-first"
          >
            Skip Tutorial
          </Button>
          <Button 
            onClick={handleNext} 
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {isLastStep ? (
              <>
                Get Started
                <Sparkles className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
