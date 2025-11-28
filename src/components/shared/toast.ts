/**
 * Toast Notification Utilities (P6-009)
 *
 * Helper functions for toast notifications using Sonner.
 */

import { toast } from "sonner";

/**
 * Show a success toast
 */
export function toastSuccess(message: string, description?: string) {
  toast.success(message, {
    description,
  });
}

/**
 * Show an error toast
 */
export function toastError(message: string, description?: string) {
  toast.error(message, {
    description,
  });
}

/**
 * Show an info toast
 */
export function toastInfo(message: string, description?: string) {
  toast.info(message, {
    description,
  });
}

/**
 * Show a warning toast
 */
export function toastWarning(message: string, description?: string) {
  toast.warning(message, {
    description,
  });
}

/**
 * Show a loading toast that can be updated
 */
export function toastLoading(message: string) {
  return toast.loading(message);
}

/**
 * Dismiss a specific toast by ID
 */
export function toastDismiss(toastId: string | number) {
  toast.dismiss(toastId);
}

/**
 * Show a promise-based toast
 */
export function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  },
) {
  return toast.promise(promise, messages);
}

/**
 * Re-export toast for custom usage
 */
export { toast };
