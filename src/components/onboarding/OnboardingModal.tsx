/**
 * OnboardingModal Component (P6-041)
 *
 * Multi-step onboarding modal for new users.
 */

import {
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Folder,
  Sparkles,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OnboardingStep, StepIndicator } from "./OnboardingStep";

export interface OnboardingModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when onboarding is completed */
  onComplete?: () => void;
  /** User's name for personalization */
  userName?: string;
}

interface Step {
  title: string;
  description: string;
  icon: typeof Bookmark;
}

const DEFAULT_STEPS: Step[] = [
  {
    title: "Welcome to BookMind",
    description:
      "Your intelligent bookmark manager. Save, organize, and rediscover your favorite content with the power of AI.",
    icon: Sparkles,
  },
  {
    title: "Save Bookmarks Easily",
    description:
      "Add bookmarks manually or use our browser extension. BookMind automatically extracts titles, descriptions, and images.",
    icon: Bookmark,
  },
  {
    title: "Organize with Collections",
    description:
      "Group related bookmarks into collections. Share collections with friends or keep them private.",
    icon: Folder,
  },
  {
    title: "Smart Tagging",
    description:
      "Use tags to categorize your bookmarks. Our AI suggests relevant tags based on content analysis.",
    icon: Tag,
  },
  {
    title: "You're All Set!",
    description:
      "Start exploring BookMind. Add your first bookmark or import from your browser.",
    icon: CheckCircle2,
  },
];

export function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
  userName,
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = DEFAULT_STEPS;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete?.();
    onClose();
  };

  const currentStepData = steps[currentStep];

  // Safety check - should never happen since currentStep is controlled
  if (!currentStepData) {
    return null;
  }

  const welcomeTitle = userName
    ? `Welcome to BookMind, ${userName}!`
    : currentStepData.title;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>{currentStepData.title}</DialogTitle>
          <DialogDescription>{currentStepData.description}</DialogDescription>
        </DialogHeader>

        {/* Step Content */}
        <OnboardingStep
          title={currentStep === 0 ? welcomeTitle : currentStepData.title}
          description={currentStepData.description}
          icon={currentStepData.icon}
        />

        {/* Step Indicator */}
        <StepIndicator
          totalSteps={steps.length}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          className="mb-4"
        />

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div>
            {!isFirstStep && (
              <Button variant="ghost" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isLastStep && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
            )}
            <Button onClick={handleNext}>
              {isLastStep ? (
                "Get Started"
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
