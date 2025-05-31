
import { toast as sonnerToast, type ToastT } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
};

// Extended toast with variant methods
interface ToastFunction {
  (props: ToastProps): string | number;
  error: (props: ToastProps) => string | number;
  success: (props: ToastProps) => string | number;
  warning: (props: ToastProps) => string | number;
  info: (props: ToastProps) => string | number;
}

export const toast: ToastFunction = (props: ToastProps) => {
  const { variant = "default", title, description } = props;

  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
    });
  }

  if (variant === "success") {
    return sonnerToast.success(title, {
      description,
    });
  }

  return sonnerToast(title, {
    description,
  });
};

// Add variant methods to toast function
toast.error = (props: ToastProps) => {
  return sonnerToast.error(props.title, {
    description: props.description,
  });
};

toast.success = (props: ToastProps) => {
  return sonnerToast.success(props.title, {
    description: props.description,
  });
};

toast.warning = (props: ToastProps) => {
  return sonnerToast.warning(props.title, {
    description: props.description,
  });
};

toast.info = (props: ToastProps) => {
  return sonnerToast.info(props.title, {
    description: props.description,
  });
};

export const useToast = () => {
  return {
    toast,
  };
};
