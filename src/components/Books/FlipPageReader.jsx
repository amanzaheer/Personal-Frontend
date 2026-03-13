import React, { useState, useEffect, useRef, useCallback } from "react";
import { pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PAGE_WIDTH = 400;
const PAGE_HEIGHT = 560;
const SCALE = 1.0; // Lower = faster, less memory
const JPEG_QUALITY = 0.8;
const YIELD_MS = 16; // Yield to main thread between pages to keep UI responsive

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export default function FlipPageReader({ pdfUrl, title = "Book", onClose, embedded = false }) {
  const [pageImages, setPageImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const bookRef = useRef(null);

  useEffect(() => {
    if (!pdfUrl) {
      setLoading(false);
      setError("No PDF URL provided");
      return;
    }

    let cancelled = false;

    const loadPageToImage = async (pdf, pageNum) => {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: SCALE });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: ctx, viewport }).promise;
      return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    };

    const loadPdfToImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const loadingTask = pdfjs.getDocument({
          url: pdfUrl,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
          cMapPacked: true,
        });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const numPages = pdf.numPages;
        setLoadingProgress({ current: 0, total: numPages });
        const images = [];

        for (let i = 1; i <= numPages; i++) {
          if (cancelled) return;
          images.push(await loadPageToImage(pdf, i));
          setLoadingProgress({ current: i, total: numPages });
          await delay(YIELD_MS);
        }

        if (!cancelled) setPageImages(images);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load PDF");
          setPageImages([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPdfToImages();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  const handleFlip = useCallback((e) => {
    setCurrentPage(e.data);
  }, []);

  const flipNext = () => {
    if (bookRef.current?.pageFlip) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  const flipPrev = () => {
    if (bookRef.current?.pageFlip) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const totalPages = pageImages.length;
  const currentDisplayPage = currentPage + 1;

  if (loading) {
    // While the PDF is loading, we rely on the button-level loader in the books grid.
    // Don't render an additional global loader above the books section.
    return null;
  }

  if (error || totalPages === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 min-h-[400px] bg-stone-50 dark:bg-stone-900/30 rounded-xl">
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          {error || "No pages to display"}
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-600"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  const flipbook = (
    <div className="flex flex-col items-center gap-4">
      <div
        className="flip-page-book-container"
        style={{
          minHeight: PAGE_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <HTMLFlipBook
          ref={bookRef}
          width={Math.min(PAGE_WIDTH, typeof window !== "undefined" ? window.innerWidth - 80 : PAGE_WIDTH)}
          height={Math.min(PAGE_HEIGHT, typeof window !== "undefined" ? window.innerHeight - 200 : PAGE_HEIGHT)}
          size="fixed"
          minWidth={280}
          maxWidth={PAGE_WIDTH}
          minHeight={400}
          maxHeight={PAGE_HEIGHT}
          flippingTime={600}
          drawShadow={true}
          usePortrait={true}
          startZIndex={0}
          onFlip={handleFlip}
          className="flip-page-book"
        >
          {pageImages.map((img, i) => (
            <div
              key={i}
              className="flip-page-demo"
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#faf8f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              <img
                src={img}
                alt={`Page ${i + 1}`}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={flipPrev}
          disabled={currentPage <= 0}
          className="p-2.5 rounded-lg border border-stone-300/80 dark:border-stone-600/60 bg-white dark:bg-stone-800/50 hover:bg-stone-50 dark:hover:bg-stone-700/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Previous page"
        >
          <ChevronLeft className="w-5 h-5 text-stone-600 dark:text-stone-400" />
        </button>
        <span className="text-sm text-stone-600 dark:text-stone-400 min-w-[80px] text-center font-medium">
          {currentDisplayPage} / {totalPages}
        </span>
        <button
          onClick={flipNext}
          disabled={currentPage >= totalPages - 1}
          className="p-2.5 rounded-lg border border-stone-300/80 dark:border-stone-600/60 bg-white dark:bg-stone-800/50 hover:bg-stone-50 dark:hover:bg-stone-700/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Next page"
        >
          <ChevronRight className="w-5 h-5 text-stone-600 dark:text-stone-400" />
        </button>
      </div>
    </div>
  );

  if (embedded) {
    return flipbook;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      role="presentation"
    >
      <div
        className="relative w-full max-w-4xl max-h-[95vh] overflow-auto bg-[#faf7f2] dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && (
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-lg font-semibold text-stone-900 dark:text-stone-100 truncate pr-4"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-200 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-700"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {flipbook}
      </div>
    </div>
  );
}
