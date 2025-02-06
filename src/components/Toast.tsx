"use client";

import { useEffect } from "react";
import {
  XCircleIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
} from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = "info", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 800);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles: Record<"success" | "error" | "warning" | "info", string> = {
    success: "bg-green-500 text-white border-green-700",
    error: "bg-red-500 text-white border-red-700",
    warning: "bg-yellow-500 text-black border-yellow-700",
    info: "bg-blue-500 text-white border-blue-700",
  };

  const icons = {
    success: <CheckCircleIcon className="w-6 h-6 text-white" />,
    error: <XCircleIcon className="w-6 h-6 text-white" />,
    warning: <AlertTriangleIcon className="w-6 h-6 text-black" />,
    info: <InfoIcon className="w-6 h-6 text-white" />,
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center justify-center animate-fade-in">
      <div
        className={`${typeStyles[type]} flex items-center gap-3 p-4 rounded-lg shadow-xl min-w-[320px] border-2 transition-all duration-300 transform scale-100 hover:scale-105 opacity-90 hover:opacity-100`}
      >
        {icons[type]}
        <span className="font-semibold text-sm flex-1">{message}</span>
        <button
          onClick={onClose}
          className="hover:opacity-75 transition-opacity"
        >
          <XCircleIcon className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
