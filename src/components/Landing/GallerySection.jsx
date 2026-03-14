import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, Sparkles } from "lucide-react";
import { getWebsiteConfig, isSectionEnabled } from "../../lib/websiteConfig";
import { buildUploadUrl } from "../../lib/uploadUrl";

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || "";

const AUTO_SLIDE_INTERVAL = 6000;
const VISIBLE_COUNT = 5;

export default function GallerySection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState(new Set());
  const [slideDirection, setSlideDirection] = useState("next");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const config = getWebsiteConfig();
  const primaryColor = config.appearance?.primaryColor || "#D25353";

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const base = apiBaseURL.endsWith("/api")
          ? apiBaseURL
          : `${apiBaseURL}/api`;
        const res = await fetch(`${base}/gallery?limit=50`);
        const json = await res.json();
        const data = json?.data ?? json;
        const list = Array.isArray(data?.gallery)
          ? data.gallery
          : Array.isArray(data)
            ? data
            : [];
        setItems(Array.isArray(list) ? list : []);
        setActiveIndex(0);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const goPrev = useCallback(() => {
    if (isTransitioning || items.length <= 1) return;
    setSlideDirection("prev");
    setIsTransitioning(true);
    setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
  }, [isTransitioning, items.length]);

  const goNext = useCallback(() => {
    if (isTransitioning || items.length <= 1) return;
    setSlideDirection("next");
    setIsTransitioning(true);
    setActiveIndex((i) => (i >= items.length - 1 ? 0 : i + 1));
  }, [isTransitioning, items.length]);

  useEffect(() => {
    if (isTransitioning) {
      const t = setTimeout(() => setIsTransitioning(false), 500);
      return () => clearTimeout(t);
    }
  }, [isTransitioning, activeIndex]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(goNext, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [items.length, goNext]);

  if (!isSectionEnabled("gallery")) return null;

  if (loading) {
    return (
      <section className="py-16 md:py-24 px-6 bg-[#faf8f6]">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[320px]">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{
              borderColor: `${primaryColor}40`,
              borderTopColor: primaryColor,
            }}
          />
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  const active = items[activeIndex];
  const imageUrl = active?.image ? buildUploadUrl(active.image) : null;
  const showFallback = !imageUrl || imgErrors.has(active?._id || active?.id);

  const total = items.length;
  const halfWindow = Math.floor(VISIBLE_COUNT / 2);
  let start = Math.max(0, activeIndex - halfWindow);
  if (start + VISIBLE_COUNT > total) {
    start = Math.max(0, total - VISIBLE_COUNT);
  }
  const visibleItems = items.slice(start, start + VISIBLE_COUNT);

  return (
    <section
      id="gallery-section"
      className="py-20 md:py-28 px-6 relative overflow-hidden"
    >
      {/* Subtle background pattern using primary color */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, ${primaryColor} 1px, transparent 1px),
            radial-gradient(circle at 80% 80%, ${primaryColor} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10 text-stone-900">
        {/* Heading */}
        <div className="flex items-center justify-center gap-6 md:gap-8 mb-14 md:mb-18">
          <div className="hidden sm:flex items-center flex-1 max-w-[140px] md:max-w-[200px]">
            <div
              className="h-[1px] flex-1 rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${primaryColor}40 30%, ${primaryColor} 100%)`,
              }}
            />
            <div
              className="w-2 h-2 rounded-full shrink-0 mx-1"
              style={{ backgroundColor: primaryColor, opacity: 0.9 }}
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gray-500">
              <Sparkles className="w-3.5 h-3.5" />
              Visual Gallery
            </span>
            <h2
              className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight italic text-center"
              style={{
                color: primaryColor,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                textShadow: `0 0 24px ${primaryColor}30`,
              }}
            >
              Moments from the Journey
            </h2>
          </div>
          <div className="hidden sm:flex items-center flex-1 max-w-[140px] md:max-w-[200px]">
            <div
              className="w-2 h-2 rounded-full shrink-0 mx-1"
              style={{ backgroundColor: primaryColor, opacity: 0.9 }}
            />
            <div
              className="h-[1px] flex-1 rounded-full"
              style={{
                background: `linear-gradient(270deg, transparent 0%, ${primaryColor}40 30%, ${primaryColor} 100%)`,
              }}
            />
          </div>
        </div>

        {/* Slider */}
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-10 lg:gap-14 items-stretch">
          {/* Large spotlight image */}
          <div
            key={active?._id || active?.id || activeIndex}
            className={`relative rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-xl transition-all duration-500 ${
              slideDirection === "next"
                ? "translate-x-0 opacity-100"
                : "translate-x-0 opacity-100"
            }`}
          >
            <div className="relative aspect-[16/9] w-full bg-stone-100">
              {showFallback ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-500">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl border border-dashed border-stone-300 mb-3 bg-white/70">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-medium tracking-[0.22em] uppercase">
                    Visual coming soon
                  </p>
                </div>
              ) : (
                <img
                  src={imageUrl}
                  alt={active?.title || "Gallery item"}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() =>
                    setImgErrors((prev) => {
                      const next = new Set(prev);
                      next.add(active?._id || active?.id);
                      return next;
                    })
                  }
                />
              )}

              {/* Soft overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">
                    {active?.type || "Image"}
                  </p>
                  <h3
                    className="text-xl md:text-2xl font-semibold tracking-tight mb-1"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                    }}
                  >
                    {active?.title || "Untitled moment"}
                  </h3>
                  {(active?.createdAt || active?.updatedAt) && (
                    <p className="text-xs text-stone-600">
                      Captured{" "}
                      <span className="font-medium">
                        {new Date(
                          active?.updatedAt || active?.createdAt,
                        ).toLocaleDateString()}
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 justify-between md:justify-end">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goPrev}
                      className="w-9 h-9 rounded-full flex items-center justify-center border bg-white hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      style={{
                        borderColor: primaryColor,
                        color: primaryColor,
                      }}
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={goNext}
                      className="w-9 h-9 rounded-full flex items-center justify-center border text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      style={{
                        borderColor: primaryColor,
                        backgroundColor: primaryColor,
                      }}
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs font-medium text-stone-600">
                    {String(activeIndex + 1).padStart(2, "0")} /{" "}
                    {String(items.length).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical filmstrip of upcoming images + CTA */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-stone-700 max-w-sm">
                A rotating glimpse into talks, media appearances, events, and
                behind-the-scenes moments that shape this journey.
              </p>
              <span
                className="hidden sm:inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-gray-600"
                style={{ borderColor: `${primaryColor}40` }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: primaryColor }}
                />
                Live gallery
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-3">
              <div className="min-h-[0] h-90 rounded-2xl bg-white border border-stone-200 p-3 md:p-4 flex flex-col gap-3 overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
                    Next in frame
                  </p>
                </div>
                <div className="flex-1 pr-1 space-y-2.5">
                  {visibleItems.map((item, idx) => {
                    const globalIndex = start + idx;
                    const thumbUrl = item?.image
                      ? buildUploadUrl(item.image)
                      : null;
                    const isActive = globalIndex === activeIndex;
                    return (
                      <button
                        key={item._id || item.id || globalIndex}
                        onClick={() => {
                          if (globalIndex === activeIndex) return;
                          setSlideDirection(
                            globalIndex > activeIndex ? "next" : "prev",
                          );
                          setIsTransitioning(true);
                          setActiveIndex(globalIndex);
                        }}
                        className={`w-full flex items-center gap-3 rounded-xl border px-2.5 py-2 text-left transition-all cursor-pointer ${
                          isActive ? "bg-white" : "bg-white hover:bg-gray-50"
                        }`}
                        style={
                          isActive
                            ? {
                                borderColor: primaryColor,
                                boxShadow: `0 0 0 1px ${primaryColor}20`,
                              }
                            : {}
                        }
                      >
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-stone-100 flex items-center justify-center shrink-0">
                          {thumbUrl ? (
                            <img
                              src={thumbUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">
                            {item.title || "Untitled"}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">
                            {item.type || "Image"}
                          </p>
                        </div>
                        <span className="text-[11px] text-gray-500 ml-1">
                          {String(globalIndex + 1).padStart(2, "0")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
