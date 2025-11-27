/**
 * Onboarding Store (P5-005)
 *
 * Onboarding state management with Zustand.
 * Tracks onboarding progress and feature discovery.
 * Persisted to localStorage.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Onboarding steps
 */
export type OnboardingStep =
  | "welcome"
  | "add-bookmark"
  | "organize"
  | "ai-features"
  | "complete";

/**
 * Feature tooltips that can be shown once
 */
export type FeatureTooltip =
  | "first-bookmark"
  | "ai-summary"
  | "semantic-search"
  | "collections"
  | "keyboard-shortcuts"
  | "export";

/**
 * Onboarding store state
 */
interface OnboardingState {
  /** Whether user has completed onboarding */
  hasCompletedOnboarding: boolean;
  /** Current onboarding step (if in progress) */
  currentStep: OnboardingStep | null;
  /** Feature tooltips that have been seen */
  seenTooltips: FeatureTooltip[];
  /** Whether onboarding modal is currently open */
  isOnboardingOpen: boolean;
  /** Number of bookmarks user has added (for contextual tips) */
  bookmarkCount: number;
}

/**
 * Onboarding store actions
 */
interface OnboardingActions {
  /** Start the onboarding flow */
  startOnboarding: () => void;
  /** Move to next onboarding step */
  nextStep: () => void;
  /** Go to a specific step */
  goToStep: (step: OnboardingStep) => void;
  /** Complete onboarding */
  completeOnboarding: () => void;
  /** Skip onboarding */
  skipOnboarding: () => void;
  /** Close onboarding modal without completing */
  closeOnboarding: () => void;
  /** Mark a feature tooltip as seen */
  markTooltipSeen: (tooltip: FeatureTooltip) => void;
  /** Check if a tooltip should be shown */
  shouldShowTooltip: (tooltip: FeatureTooltip) => boolean;
  /** Increment bookmark count (for contextual tips) */
  incrementBookmarkCount: () => void;
  /** Reset onboarding (for testing) */
  resetOnboarding: () => void;
}

/**
 * Combined onboarding store type
 */
type OnboardingStore = OnboardingState & OnboardingActions;

/**
 * Onboarding step order
 */
const stepOrder: OnboardingStep[] = [
  "welcome",
  "add-bookmark",
  "organize",
  "ai-features",
  "complete",
];

/**
 * Default onboarding state
 */
const defaultState: OnboardingState = {
  hasCompletedOnboarding: false,
  currentStep: null,
  seenTooltips: [],
  isOnboardingOpen: false,
  bookmarkCount: 0,
};

/**
 * Onboarding store with persistence
 */
export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...defaultState,

      startOnboarding: () =>
        set({
          isOnboardingOpen: true,
          currentStep: "welcome",
        }),

      nextStep: () => {
        const { currentStep } = get();
        if (!currentStep) return;

        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex < stepOrder.length - 1) {
          set({ currentStep: stepOrder[currentIndex + 1] });
        } else {
          // Last step - complete onboarding
          set({
            hasCompletedOnboarding: true,
            currentStep: null,
            isOnboardingOpen: false,
          });
        }
      },

      goToStep: (step) => set({ currentStep: step }),

      completeOnboarding: () =>
        set({
          hasCompletedOnboarding: true,
          currentStep: null,
          isOnboardingOpen: false,
        }),

      skipOnboarding: () =>
        set({
          hasCompletedOnboarding: true,
          currentStep: null,
          isOnboardingOpen: false,
        }),

      closeOnboarding: () =>
        set({
          isOnboardingOpen: false,
          currentStep: null,
        }),

      markTooltipSeen: (tooltip) =>
        set((state) => ({
          seenTooltips: state.seenTooltips.includes(tooltip)
            ? state.seenTooltips
            : [...state.seenTooltips, tooltip],
        })),

      shouldShowTooltip: (tooltip) => {
        const state = get();
        // Don't show tooltips during onboarding
        if (state.isOnboardingOpen) return false;
        // Don't show if already seen
        if (state.seenTooltips.includes(tooltip)) return false;
        // Don't show if onboarding not completed
        if (!state.hasCompletedOnboarding) return false;
        return true;
      },

      incrementBookmarkCount: () =>
        set((state) => ({
          bookmarkCount: state.bookmarkCount + 1,
        })),

      resetOnboarding: () => set(defaultState),
    }),
    {
      name: "bookmind-onboarding",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/**
 * Selector hooks
 */
export const useHasCompletedOnboarding = () =>
  useOnboardingStore((state) => state.hasCompletedOnboarding);
export const useIsOnboardingOpen = () =>
  useOnboardingStore((state) => state.isOnboardingOpen);
export const useCurrentOnboardingStep = () =>
  useOnboardingStore((state) => state.currentStep);
