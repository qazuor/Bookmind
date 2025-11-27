/**
 * UI Store (P5-003)
 *
 * Global UI state management with Zustand.
 * Handles sidebar, view mode, theme, and modal states.
 * Persisted to localStorage.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * View modes for bookmark display
 */
export type ViewMode = "grid" | "list";

/**
 * Theme options
 */
export type Theme = "light" | "dark" | "system";

/**
 * Modal types that can be opened
 */
export type ModalType =
  | "create-bookmark"
  | "edit-bookmark"
  | "create-category"
  | "edit-category"
  | "create-collection"
  | "edit-collection"
  | "create-tag"
  | "share-collection"
  | "confirm-delete"
  | "export"
  | "command-palette"
  | null;

/**
 * UI store state
 */
interface UIState {
  /** Sidebar expanded/collapsed */
  sidebarOpen: boolean;
  /** Current view mode for bookmarks */
  viewMode: ViewMode;
  /** Current theme */
  theme: Theme;
  /** Currently open modal */
  activeModal: ModalType;
  /** Data for the active modal (e.g., bookmark ID for edit) */
  modalData: Record<string, unknown> | null;
  /** Mobile navigation open state */
  mobileNavOpen: boolean;
}

/**
 * UI store actions
 */
interface UIActions {
  /** Toggle sidebar open/closed */
  toggleSidebar: () => void;
  /** Set sidebar state explicitly */
  setSidebarOpen: (open: boolean) => void;
  /** Set view mode */
  setViewMode: (mode: ViewMode) => void;
  /** Set theme */
  setTheme: (theme: Theme) => void;
  /** Open a modal with optional data */
  openModal: (type: ModalType, data?: Record<string, unknown>) => void;
  /** Close the active modal */
  closeModal: () => void;
  /** Toggle mobile navigation */
  toggleMobileNav: () => void;
  /** Set mobile nav state explicitly */
  setMobileNavOpen: (open: boolean) => void;
}

/**
 * Combined UI store type
 */
type UIStore = UIState & UIActions;

/**
 * Default UI state
 */
const defaultState: UIState = {
  sidebarOpen: true,
  viewMode: "grid",
  theme: "system",
  activeModal: null,
  modalData: null,
  mobileNavOpen: false,
};

/**
 * UI store with persistence
 */
export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      ...defaultState,

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setViewMode: (mode) => set({ viewMode: mode }),

      setTheme: (theme) => set({ theme }),

      openModal: (type, data) =>
        set({ activeModal: type, modalData: data ?? null }),

      closeModal: () => set({ activeModal: null, modalData: null }),

      toggleMobileNav: () =>
        set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),

      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
    }),
    {
      name: "bookmind-ui",
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        viewMode: state.viewMode,
        theme: state.theme,
      }),
    },
  ),
);

/**
 * Selector hooks for specific UI state
 */
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen);
export const useViewMode = () => useUIStore((state) => state.viewMode);
export const useTheme = () => useUIStore((state) => state.theme);
export const useActiveModal = () => useUIStore((state) => state.activeModal);
export const useModalData = () => useUIStore((state) => state.modalData);
