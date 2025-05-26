
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster 
      position="bottom-right" 
      toastOptions={{
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid #e2e8f0'
        },
        classNames: {
          error: '!bg-red-50 !border-red-200 !text-red-800',
          success: '!bg-green-50 !border-green-200 !text-green-800',
          info: '!bg-blue-50 !border-blue-200 !text-blue-800',
          warning: '!bg-amber-50 !border-amber-200 !text-amber-800'
        },
        duration: 5000
      }} 
    />
  );
}
