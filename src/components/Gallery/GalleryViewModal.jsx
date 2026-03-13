import React from "react";
import { X, ImageIcon, Clock } from "lucide-react";

export default function GalleryViewModal({
  item,
  isOpen,
  onClose,
  getImageUrl,
  formatDate,
}) {
  if (!item) return null;

  const imageUrl = getImageUrl?.(item);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 rounded-xl ${
          isOpen ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
        } bg-[#faf7f2] dark:bg-stone-900 border border-stone-200/90 dark:border-stone-700/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-stone-950/50`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-stone-200/80 dark:border-stone-700/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-200/80 dark:bg-stone-700/60 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-stone-600 dark:text-stone-400" />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400 font-medium">
              Gallery Item
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-700/60 cursor-pointer transition-all duration-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pt-5 pb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-6 md:gap-8 items-start">
              {/* Image */}
              <div>
                <div className="relative w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 shadow-md">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.title}
                      className="w-full h-full max-h-[420px] object-contain bg-stone-950/5"
                    />
                  ) : (
                    <div className="w-full h-64 flex flex-col items-center justify-center text-stone-400 dark:text-stone-500">
                      <ImageIcon className="w-12 h-12 mb-3 opacity-60" />
                      <p className="text-sm tracking-wide uppercase">
                        No image available
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Meta */}
              <div className="space-y-4 min-w-0">
                <div>
                  <h1
                    className="text-2xl md:text-3xl font-semibold text-stone-900 dark:text-stone-100 leading-tight tracking-tight"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                    }}
                  >
                    {item.title || "Untitled"}
                  </h1>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
                    {item.type || "image"}
                  </p>
                </div>

                <div className="mt-3 p-4 rounded-lg bg-white/75 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-700/60 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
                    <Clock className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                    <span>
                      Created{" "}
                      <span className="font-medium">
                        {formatDate(item.createdAt)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
                    <Clock className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                    <span>
                      Updated{" "}
                      <span className="font-medium">
                        {formatDate(item.updatedAt)}
                      </span>
                    </span>
                  </div>
                </div>

                {imageUrl && (
                  <div className="mt-2 text-white ">
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent    text-sm font-medium cursor-pointer transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Open full size
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
