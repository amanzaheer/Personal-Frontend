import React from "react";

export default function ModalSidebar({
  isOpen,
  onClose,
  title,
  icon: Icon,
  subtitle,
  children,
  footer,
  errorMessage,
  className = "",
}) {
  return (
    <div className="fixed inset-y-0 right-0 z-50 flex overflow-hidden">
      <div
        className={`w-screen max-w-md transform transition-all duration-300 ease-out 
        bg-white dark:bg-black shadow-xl border-l border-gray-200 dark:border-neutral-800 
        ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        } ${className}`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                {Icon && <Icon className="w-5 h-5" />} {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 
                dark:text-gray-300 dark:hover:text-white dark:hover:bg-neutral-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {subtitle && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
                {subtitle}
              </p>
            )}

            {errorMessage && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 text-sm">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-gray-200 dark:border-neutral-800 pt-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
