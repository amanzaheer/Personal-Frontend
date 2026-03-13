import React, { useState, useEffect } from "react";
import { BookOpen, BookMarked } from "lucide-react";
import FlipPageReader from "../Books/FlipPageReader";
import { getWebsiteConfig, isSectionEnabled } from "../../lib/websiteConfig";
import { Toaster, toast } from "react-hot-toast";
import SubscribeToReadModal from "./SubscribeToReadModal";

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || "";
const uploadsBaseURL =
  import.meta.env.VITE_UPLOADS_BASE_URL ||
  apiBaseURL.replace(/\/api\/?$/, "").replace(/\/$/, "") ||
  "";

function buildImageUrl(image) {
  if (!image || typeof image !== "string") return null;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  const path = image.startsWith("/") ? image.slice(1) : image;
  if (path.startsWith("uploads/")) return `/${path}`;
  const base = uploadsBaseURL
    ? uploadsBaseURL.endsWith("/")
      ? uploadsBaseURL.slice(0, -1)
      : uploadsBaseURL
    : typeof window !== "undefined"
      ? window.location.origin
      : "";
  return base ? `${base}/${path}` : `/${path}`;
}

function buildAssetUrl(path) {
  if (!path || typeof path !== "string") return null;
  const p = path.replace(/^\/+/, "");
  if (!p) return null;
  if (path.startsWith("http")) return path;
  if (p.startsWith("uploads/")) return `/${p}`;
  const base =
    uploadsBaseURL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return base ? `${base.replace(/\/+$/, "")}/${p}` : `/${p}`;
}

export default function BooksSection() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readingBookId, setReadingBookId] = useState(null);
  const [imgErrors, setImgErrors] = useState(new Set());
  const [readerModal, setReaderModal] = useState({ open: false, url: null, title: "" });
  const [subscribeModal, setSubscribeModal] = useState({
    open: false,
    book: null,
  });
  const config = getWebsiteConfig();
  const primaryColor = config.appearance?.primaryColor || "#D25353";

  const authToken =
    typeof window !== "undefined"
      ? localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
      : null;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const base = apiBaseURL.endsWith("/api")
          ? apiBaseURL
          : `${apiBaseURL}/api`;
        const token =
          localStorage.getItem("auth_token") ||
          sessionStorage.getItem("auth_token");
        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${base}/books?limit=50`, { headers });
        const json = await res.json();
        const data = json?.data ?? json;
        const list = Array.isArray(data?.books)
          ? data.books
          : (data?.books ?? []);
        setBooks(Array.isArray(list) ? list : []);
      } catch {
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [authToken]);

  useEffect(() => {
    const onVisibility = () => {
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      if (token && !document.hidden) {
        const base = apiBaseURL.endsWith("/api")
          ? apiBaseURL
          : `${apiBaseURL}/api`;
        fetch(`${base}/books?limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((json) => {
            const data = json?.data ?? json;
            const list = Array.isArray(data?.books)
              ? data.books
              : (data?.books ?? []);
            setBooks(Array.isArray(list) ? list : []);
          })
          .catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const handleReadBook = async (book) => {
    const id = book?._id || book?.id;
    if (!id) return;

    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");

    setReadingBookId(id);
    let didOpenReader = false;
    try {
      const base = apiBaseURL.endsWith("/api")
        ? apiBaseURL
        : `${apiBaseURL}/api`;
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${base}/books/read/${id}`, { headers });
      const json = await res.json();

      if (res.ok && json?.success && json?.data?.bookUrl) {
        const bookUrl = json.data.bookUrl;
        const fullUrl =
          buildAssetUrl(bookUrl) ||
          (bookUrl.startsWith("/")
            ? `${window.location.origin}${bookUrl}`
            : bookUrl);
        setReaderModal({
          open: true,
          url: fullUrl,
          title: book?.title || "Book",
        });
        didOpenReader = true;
      } else {
        const msg =
          json?.message || json?.data?.message || "Membership required";
        const lowerMsg = String(msg).toLowerCase();
        const isPaidBook = book?.isPaid === true || (typeof book?.price === "number" && book?.price > 0);

        if (isPaidBook && !book.purchasedByUser) {
          setSubscribeModal({
            open: true,
            book,
            guest: !token,
          });
        } else if (book.purchasedByUser && token) {
          toast.error("Unable to open the book. Please try again.");
        } else if (token && (lowerMsg.includes("membership") || lowerMsg.includes("subscribe"))) {
          setSubscribeModal({ open: true, book, guest: false });
        } else {
          toast.error(
            lowerMsg.includes("membership") ||
              lowerMsg.includes("authorized")
              ? "Membership required to read this book. Please sign in or subscribe."
              : msg,
          );
        }
      }
    } catch {
      const isPaidBook = book?.isPaid === true || (typeof book?.price === "number" && book?.price > 0);
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      if (book?.purchasedByUser && token) {
        toast.error("Unable to open the book. Please try again.");
      } else if (isPaidBook) {
        setSubscribeModal({
          open: true,
          book,
          guest: !token,
        });
      } else {
        toast.error(
          "Membership required to read this book. Please sign in or subscribe.",
        );
      }
    } finally {
      if (!didOpenReader) setReadingBookId(null);
    }
  };

  if (!isSectionEnabled("books")) return null;
  if (!books.length) return null;

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      {readerModal.open && readerModal.url && (
        <FlipPageReader
          pdfUrl={readerModal.url}
          title={readerModal.title}
          onClose={() => {
            setReaderModal({ open: false, url: null, title: "" });
            setReadingBookId(null);
          }}
          onReady={() => setReadingBookId(null)}
          embedded={false}
        />
      )}
      <section
        id="books-section"
        className="py-20 md:py-28 px-6  relative overflow-hidden"
      >
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 20%, ${primaryColor} 1px, transparent 1px),
              radial-gradient(circle at 70% 80%, ${primaryColor} 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section heading */}
          <div className="books-section-title flex items-center justify-center gap-6 md:gap-8 mb-14 md:mb-16">
            <div className="hidden sm:flex items-center flex-1 max-w-[140px] md:max-w-[200px]">
              <div
                className="h-0.5 flex-1 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${primaryColor}40 30%, ${primaryColor} 100%)`,
                }}
              />
              <div
                className="w-2 h-2 rounded-full shrink-0 mx-1"
                style={{ backgroundColor: primaryColor, opacity: 0.8 }}
              />
            </div>
            <h2
              className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight italic text-center px-4"
              style={{
                color: primaryColor,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                textShadow: `0 0 24px ${primaryColor}30`,
              }}
            >
              Books & Publications
            </h2>
            <div className="hidden sm:flex items-center flex-1 max-w-[140px] md:max-w-[200px]">
              <div
                className="w-2 h-2 rounded-full shrink-0 mx-1"
                style={{ backgroundColor: primaryColor, opacity: 0.8 }}
              />
              <div
                className="h-0.5 flex-1 rounded-full"
                style={{
                  background: `linear-gradient(270deg, transparent 0%, ${primaryColor}40 30%, ${primaryColor} 100%)`,
                }}
              />
            </div>
          </div>

          {/* Books grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
            {books.map((book, index) => {
              const coverUrl = buildImageUrl(book?.coverImage);
              const isPaid = book?.isPaid === true || book?.isPaid === "true";
              const bookId = book._id || book.id;
              const showCover = coverUrl && !imgErrors.has(bookId);

              return (
                <article
                  key={bookId}
                  className="books-section-card group relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 ease-out border border-stone-100 hover:border-stone-200"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {/* Cover */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {showCover ? (
                      <img
                        src={coverUrl}
                        alt={book.title}
                        className="books-cover-img w-full h-full object-cover"
                        onError={() =>
                          setImgErrors((prev) => new Set(prev).add(bookId))
                        }
                      />
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}08` }}
                      >
                        <BookOpen
                          className="w-16 h-16 mb-3 opacity-40"
                          style={{ color: primaryColor }}
                        />
                        <span
                          className="text-sm font-medium tracking-wide"
                          style={{ color: primaryColor, opacity: 0.7 }}
                        >
                          {book.title || "No cover"}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Badge: price or Purchased */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                      {book.purchasedByUser ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-600 text-white shadow-md">
                          Purchased · Read anytime
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                            isPaid
                              ? "bg-white/95 text-stone-800 shadow-md"
                              : "bg-emerald-500/95 text-white shadow-md"
                          }`}
                        >
                          {isPaid
                            ? `$${Number(book.price ?? 0).toFixed(2)}`
                            : "Free"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 flex flex-col">
                    <h3
                      className="text-lg font-bold text-stone-900 mb-1 line-clamp-2 leading-tight"
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                      }}
                    >
                      {book.title || "Untitled"}
                    </h3>
                    <p className="text-sm text-stone-500 mb-3">
                      by {book.author || "Unknown"}
                    </p>
                    <p className="text-sm text-stone-600 leading-relaxed line-clamp-2 flex-1">
                      {book.description || "—"}
                    </p>

                    {/* Read CTA */}
                    <button
                      onClick={() => handleReadBook(book)}
                      disabled={readingBookId === (book._id || book.id)}
                      className="books-read-btn mt-4 w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white hover:opacity-95 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: primaryColor,
                        boxShadow: `0 4px 14px ${primaryColor}40`,
                      }}
                    >
                      {readingBookId === (book._id || book.id) ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          Opening…
                        </>
                      ) : (
                        <>
                          <BookMarked className="w-4 h-4" />
                          Read
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <SubscribeToReadModal
        open={subscribeModal.open}
        book={subscribeModal.book}
        guest={subscribeModal.guest}
        onClose={() => setSubscribeModal({ open: false, book: null, guest: false })}
        onSuccess={(b) => {
          setSubscribeModal({ open: false, book: null, guest: false });
          if (b) {
            const bookWithPurchased = { ...b, purchasedByUser: true };
            setBooks((prev) =>
              prev.map((book) =>
                (book._id || book.id) === (b._id || b.id)
                  ? { ...book, purchasedByUser: true }
                  : book
              )
            );
            handleReadBook(bookWithPurchased);
          }
        }}
      />
    </>
  );
}
