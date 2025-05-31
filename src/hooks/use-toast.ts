import { toast as sonnerToast } from "sonner";

type ToastType = "default" | "success" | "error" | "warning" | "info";

interface ToastProps {
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

export const useToast = () => {
  const toast = (props: ToastProps) => {
    const { title, description, type = "default", duration = 5000 } = props;

    switch (type) {
      case "success":
        return sonnerToast.success(title, {
          description,
          duration,
        });
      case "error":
        return sonnerToast.error(title, {
          description,
          duration,
        });
      case "warning":
        return sonnerToast.warning(title, {
          description,
          duration,
        });
      case "info":
        return sonnerToast.info(title, {
          description,
          duration,
        });
      default:
        return sonnerToast(title, {
          description,
          duration,
        });
    }
  };

  return { toast };
};

// Export a simpler toast object for direct use (string-based API)
export const toast = {
  success: (message: string | { title: string; description?: string }, options = {}) => {
    if (typeof message === 'string') {
      return sonnerToast.success(message, options);
    } else {
      return sonnerToast.success(message.title, { ...options, description: message.description });
    }
  },
  error: (message: string | { title: string; description?: string }, options = {}) => {
    if (typeof message === 'string') {
      return sonnerToast.error(message, options);
    } else {
      return sonnerToast.error(message.title, { ...options, description: message.description });
    }
  },
  warning: (message: string | { title: string; description?: string }, options = {}) => {
    if (typeof message === 'string') {
      return sonnerToast.warning(message, options);
    } else {
      return sonnerToast.warning(message.title, { ...options, description: message.description });
    }
  },
  info: (message: string | { title: string; description?: string }, options = {}) => {
    if (typeof message === 'string') {
      return sonnerToast.info(message, options);
    } else {
      return sonnerToast.info(message.title, { ...options, description: message.description });
    }
  },
  default: (message: string | { title: string; description?: string }, options = {}) => {
    if (typeof message === 'string') {
      return sonnerToast(message, options);
    } else {
      return sonnerToast(message.title, { ...options, description: message.description });
    }
  },
  // Keep other methods intact
  promise: sonnerToast.promise,
  loading: (message: string, options = {}) => sonnerToast.loading(message, options),
  dismiss: () => sonnerToast.dismiss(),
};
