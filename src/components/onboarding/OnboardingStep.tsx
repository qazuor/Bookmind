/**
 * OnboardingStep Component (P6-042)
 *
 * Individual step content for the onboarding flow.
 */

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OnboardingStepProps {
  /** Step title */
  title: string;
  /** Step description */
  description: string;
  /** Icon component from lucide-react */
  icon?: LucideIcon;
  /** Optional image/illustration URL */
  image?: string;
  /** Optional image alt text */
  imageAlt?: string;
  /** Whether this step is currently active */
  isActive?: boolean;
  /** Additional content to render below description */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function OnboardingStep({
  title,
  description,
  icon: Icon,
  image,
  imageAlt = "",
  isActive = true,
  children,
  className = "",
}: OnboardingStepProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center px-6 py-8",
        !isActive && "hidden",
        className,
      )}
    >
      {/* Icon or Image */}
      {image ? (
        <img
          src={image}
          alt={imageAlt}
          className="w-48 h-48 object-contain mb-6"
        />
      ) : Icon ? (
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-primary" />
        </div>
      ) : null}

      {/* Title */}
      <h2 className="text-2xl font-bold mb-3">{title}</h2>

      {/* Description */}
      <p className="text-muted-foreground max-w-md">{description}</p>

      {/* Additional content */}
      {children && <div className="mt-6 w-full max-w-md">{children}</div>}
    </div>
  );
}

/**
 * Step indicator dots for navigation
 */
export interface StepIndicatorProps {
  /** Total number of steps */
  totalSteps: number;
  /** Current step index (0-based) */
  currentStep: number;
  /** Callback when a step dot is clicked */
  onStepClick?: (stepIndex: number) => void;
  /** Whether clicking steps is enabled */
  clickable?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function StepIndicator({
  totalSteps,
  currentStep,
  onStepClick,
  clickable = true,
  className = "",
}: StepIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <button
          key={`step-${index}`}
          type="button"
          onClick={() => clickable && onStepClick?.(index)}
          disabled={!clickable}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-200",
            index === currentStep
              ? "w-6 bg-primary"
              : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
            clickable && "cursor-pointer",
          )}
          aria-label={`Go to step ${index + 1}`}
        />
      ))}
    </div>
  );
}
