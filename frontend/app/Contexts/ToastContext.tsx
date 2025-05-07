import { createContext, useContext, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import type { ToastMessage } from "primereact/toast";

type ToastContextType = {
  showToast: (message: ToastMessage) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toastRef = useRef<Toast>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (options: ToastMessage) => {
    if (!toastRef.current || isToastVisible) return;
    setIsToastVisible(true);
    toastRef.current.show(options);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast
        ref={toastRef}
        position="top-right"
        onHide={() => {
          setIsToastVisible(false);
        }}
      />
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
