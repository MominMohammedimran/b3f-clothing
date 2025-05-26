import { toast as sonnerToast } from 'sonner';

// Universal toast wrapper that handles both string and object formats
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
  custom: sonnerToast,
};

export default toast;
