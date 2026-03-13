import React, { useEffect, useState } from "react";

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
  actions = null,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    const dismissTimer =
      duration && duration > 0 && !actions
        ? setTimeout(() => {
            setIsLeaving(true);
            setTimeout(() => onClose?.(), 300);
          }, duration)
        : null;

    return () => {
      clearTimeout(showTimer);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose?.(), 300);
  };

  const isConfirmation = Array.isArray(actions) && actions.length > 0;

  const getToastStyles = () => {
    // Position: normal toasts top-right
    // Use z-[9999] to ensure toast appears above modals (which typically use z-50)
    const positionStyles = "fixed top-4 right-4 z-[9999]";

    const baseStyles = `${positionStyles} rounded-lg px-4 py-3 text-white shadow-xl backdrop-blur-sm border transition-all duration-300 ease-out transform`;

    const typeStyles = {
      success: "bg-green-500/90 border-green-400/50 text-green-50",
      error: "bg-red-500/90 border-red-400/50 text-red-50",
      warning: "bg-yellow-500/90 border-yellow-400/50 text-yellow-50",
      info: "bg-blue-500/90 border-blue-400/50 text-blue-50",
    };

    const animationStyles =
      isVisible && !isLeaving
        ? "translate-x-0 opacity-100 scale-100"
        : "translate-x-full opacity-0 scale-95";

    return `${baseStyles} ${
      typeStyles[type] || typeStyles.info
    } ${animationStyles}`;
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "error":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  // Render centered confirmation modal when actions are present
  if (isConfirmation) {
    return (
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
          isVisible && !isLeaving ? "opacity-100" : "opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
        {/* Dialog */}
        <div
          className={`relative mx-4 w-full max-w-lg rounded-xl border bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-2xl transform transition-all duration-300 ${
            isVisible && !isLeaving ? "scale-100" : "scale-95"
          }`}
        >
          <div className="px-5 py-4 flex items-start gap-3">
            <div
              className={`mt-0.5 p-2 rounded-full ${
                type === "warning"
                  ? "bg-yellow-100 text-yellow-700"
                  : type === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {getIcon()}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Confirmation</div>
              <div className="mt-1 text-sm text-gray-700 dark:text-white">
                {message}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded hover:bg-gray-100 text-gray-500"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="px-5 pb-4 pt-2 flex justify-end gap-2 bg-gray-50 dark:bg-zinc-900">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  action.label === "Delete" || action.label === "Confirm"
                    ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                    : "bg-accent text-white border hover:bg-accent/80 dark:hover:bg-accent/80 cursor-pointer"
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default top-right toast (no actions)
  return (
    <div className={getToastStyles()} role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1 text-sm font-medium">{message}</div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
