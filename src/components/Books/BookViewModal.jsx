import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Download,
  BookOpen,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import FlipPageReader from "./FlipPageReader";

export default function BookViewModal({
  book,
  isOpen,
  onClose,
  getCoverImageUrl,
  getBookFileUrl,
  formatIsPaid,
  formatDate,
}) {
  const coverUrl = book ? getCoverImageUrl?.(book) : null;
  const bookFileUrl = book ? getBookFileUrl?.(book) : null;
  const isPdf = book?.bookFile?.toLowerCase?.().endsWith(".pdf");
  const isPaid = book?.isPaid === true || book?.isPaid === "true";

  if (!book) return null;

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

      {/* Modal — premium literary aesthetic */}
      <div
        className={`relative w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 rounded-xl ${
          isOpen ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
        } bg-[#faf7f2] dark:bg-stone-900 border border-stone-200/90 dark:border-stone-700/80 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-stone-950/50`}
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-stone-200/80 dark:border-stone-700/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-200/80 dark:bg-stone-700/60 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-stone-600 dark:text-stone-400" />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400 font-medium">
              Book Details
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Cover + title block */}
          <div className="px-6 pt-5 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-8">
              {/* Cover only */}
              <div>
                <div
                  className="aspect-[3/4] overflow-hidden rounded-lg shadow-lg max-w-[200px]"
                  style={{
                    boxShadow:
                      "0 4px 6px -1px rgba(0,0,0,0.1), 0 4px 12px -4px rgba(0,0,0,0.1)",
                  }}
                >
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 dark:bg-stone-800/50 text-stone-400 dark:text-stone-500">
                      <FileText
                        className="w-12 h-12 mb-2 opacity-50"
                        strokeWidth={1.25}
                      />
                      <span className="text-xs tracking-wide">No cover</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title, author, description, metadata, download */}
              <div className="space-y-3 min-w-0">
                <h1
                  className="text-2xl md:text-3xl font-semibold text-stone-900 dark:text-stone-100 leading-tight tracking-tight"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  {book.title || "Untitled"}
                </h1>
                <p
                  className="text-base text-stone-600 dark:text-stone-400 italic -mt-1"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  — by {book.author || "Unknown author"}
                </p>

                <div className="border-l-2 border-stone-300/80 dark:border-stone-600/60 pl-4 py-1">
                  <div className="prose prose-stone dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 leading-relaxed text-sm [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 [&_strong]:font-semibold [&_strong]:text-stone-900 dark:[&_strong]:text-stone-100">
                    {book.description ? (
                      <ReactMarkdown>{book.description}</ReactMarkdown>
                    ) : (
                      <p className="italic text-stone-500 dark:text-stone-400">
                        No description provided.
                      </p>
                    )}
                  </div>
                </div>

                {/* Metadata below description — premium card */}
                <div className="mt-4 p-4 rounded-lg bg-white/60 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-700/50 shadow-sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 font-medium mb-1">
                        Status
                      </p>
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-md ${
                          isPaid
                            ? "bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300"
                            : "bg-sky-100/80 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300"
                        }`}
                      >
                        {isPaid ? "Paid" : "Free"}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 font-medium mb-1">
                        Price
                      </p>
                      <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                        {isPaid
                          ? `$${Number(book.price ?? 0).toFixed(2)}`
                          : "Free"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 font-medium mb-1">
                        Created
                      </p>
                      <p className="text-sm text-stone-700 dark:text-stone-300">
                        {formatDate(book.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 font-medium mb-1">
                        Updated
                      </p>
                      <p className="text-sm text-stone-700 dark:text-stone-300">
                        {formatDate(book.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className=" px-4 py-2  w-fit rounded-lg bg-accent text-white hover:opacity-90 font-medium text-sm cursor-pointer mt-2">
                  {bookFileUrl && (
                    <a
                      href={bookFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className=" inline-flex items-center gap-2 "
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PDF Viewer — flip-page style */}
          {isPdf && bookFileUrl && (
            <div className="border-t border-stone-200/80 dark:border-stone-700/60 mx-6 pt-5 pb-5">
              <h4
                className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-3"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Preview
              </h4>
              <FlipPageReader
                pdfUrl={bookFileUrl}
                title={book?.title}
                embedded={true}
              />
            </div>
          )}

          {/* Non-PDF */}
          {bookFileUrl && !isPdf && (
            <div className="border-t border-stone-200/80 dark:border-stone-700/60 mx-6 pt-5 pb-5">
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
                Preview available for PDF files. Download to read.
              </p>
              <a
                href={bookFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 font-medium text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                {book.bookFile?.split("/").pop() || "Download file"}
              </a>
            </div>
          )}

          {!bookFileUrl && (
            <div className="border-t border-stone-200/80 dark:border-stone-700/60 mx-6 pt-5 pb-5">
              <p className="text-sm text-stone-500 dark:text-stone-400 italic">
                No file attached.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
