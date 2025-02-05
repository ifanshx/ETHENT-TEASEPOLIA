"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import Toast from "@/components/Toast";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastContextProps {
  showToast: (message: string, type?: ToastType) => void;
}

interface ToastState {
  isVisible: boolean;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    message: "",
    type: "info",
  });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.isVisible && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextProps => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
