import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import { getWebsiteConfig } from "../../lib/websiteConfig";

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || "";
const uploadsBaseURL =
  import.meta.env.VITE_UPLOADS_BASE_URL ||
  apiBaseURL.replace(/\/api\/?$/, "").replace(/\/$/, "") ||
  "";

function buildImageUrl(image) {
  if (!image || typeof image !== "string") return null;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  const path = image.startsWith("/") ? image.slice(1) : image;
  const base = uploadsBaseURL
    ? uploadsBaseURL.endsWith("/")
      ? uploadsBaseURL.slice(0, -1)
      : uploadsBaseURL
    : typeof window !== "undefined"
      ? window.location.origin
      : "";
  return base ? `${base}/${path}` : `/${path}`;
}

const AUTO_SLIDE_INTERVAL = 5000;

export default function ProfessionalIdentitySection() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [slideDirection, setSlideDirection] = useState("next");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const config = getWebsiteConfig();
  const primaryColor = config.appearance?.primaryColor || "#D25353";
  const siteName = config.general?.siteName || "Aisha Abd El-maguid";

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        setLoading(true);
        const base = apiBaseURL.endsWith("/api")
          ? apiBaseURL
          : `${apiBaseURL}/api`;
        const res = await fetch(`${base}/sliders?limit=50`);
        const json = await res.json();
        const data = json?.data ?? json;
        const list = Array.isArray(data) ? data : (data?.sliders ?? []);
        const active = (Array.isArray(list) ? list : [])
          .filter((s) => s?.status === "active")
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setSliders(active);
        setActiveIndex(0);
      } catch {
        setSliders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSliders();
  }, []);

  const slide = sliders[activeIndex];
  const imageUrl = slide?.image ? buildImageUrl(slide.image) : null;
  const showFallbackImg = !imageUrl || imgError;

  const goPrev = useCallback(() => {
    if (isTransitioning) return;
    setImgError(false);
    setSlideDirection("prev");
    setIsTransitioning(true);
    setActiveIndex((i) => (i <= 0 ? sliders.length - 1 : i - 1));
  }, [isTransitioning, sliders.length]);

  const goNext = useCallback(() => {
    if (isTransitioning) return;
    setImgError(false);
    setSlideDirection("next");
    setIsTransitioning(true);
    setActiveIndex((i) => (i >= sliders.length - 1 ? 0 : i + 1));
  }, [isTransitioning, sliders.length]);

  useEffect(() => {
    setImgError(false);
  }, [activeIndex]);

  useEffect(() => {
    if (isTransitioning) {
      const t = setTimeout(() => setIsTransitioning(false), 500);
      return () => clearTimeout(t);
    }
  }, [isTransitioning, activeIndex]);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const timer = setInterval(goNext, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [sliders.length, goNext]);

  if (loading) {
    return (
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
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

  if (!sliders.length) return null;

  return (
    <section
      id="professional-identity-section"
      className="pb-20 md:pb-28 px-6 relative overflow-hidden pro-identity-section-fade-in"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section heading – centered with decorative lines */}
        <div className="flex items-center justify-center gap-6 md:gap-8 mb-16 md:mb-20">
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
            className="pro-identity-title-bounce text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight italic text-center px-4"
            style={{
              color: primaryColor,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              textShadow: `0 0 24px ${primaryColor}30`,
            }}
          >
            Professional Identity
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
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-start min-h-[700px] lg:min-h-[780px]">
          {/* Left: Title, bullets, section number */}
          <div
            key={activeIndex}
            className={`order-2 lg:order-1 ${
              slideDirection === "next"
                ? "pro-identity-slide-enter"
                : "pro-identity-slide-enter-prev"
            }`}
          >
            <h2
              className="pro-identity-title-bounce text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight italic"
              style={{
                color: primaryColor,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                textShadow: `0 0 24px ${primaryColor}40`,
              }}
            >
              {slide?.title || ""}
            </h2>

            {slide?.description && (
              <div className="relative mb-8 pr-14 md:pr-16">
                <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1.5 [&_p]:my-2 [&_strong]:font-semibold [&_strong]:text-gray-800 [&_ul]:space-y-1">
                  <ReactMarkdown>{slide.description}</ReactMarkdown>
                </div>
                {slide?.icon && (
                  <div
                    className="absolute bottom-0 right-0 w-12 h-12 md:w-16 md:h-20 rounded-lg overflow-hidden  flex items-center justify-center"
                    style={{ marginBottom: 0 }}
                  >
                    <img
                      src={buildImageUrl(slide.icon)}
                      alt=""
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center flex-1 max-w-[140px]">
                <div
                  className="h-0.5 flex-1 rounded-full transition-all duration-500"
                  style={{ backgroundColor: primaryColor }}
                />
                <div
                  className="w-2 h-2 rounded-full shrink-0 ml-1"
                  style={{ backgroundColor: primaryColor, opacity: 0.8 }}
                />
              </div>
              <span
                className="text-2xl md:text-3xl font-bold text-gray-800 tabular-nums italic"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {String(activeIndex + 1).padStart(2, "0")}
              </span>
            </div>

            {Array.isArray(slide?.images) && slide.images.length > 0 && (
              <div className="flex gap-2 md:gap-3 mt-6 overflow-x-auto pb-2 items-end">
                {slide.images.map((img, i) => (
                  <div
                    key={i}
                    className="shrink-0 w-24 h-36 md:w-28 md:h-40 rounded-lg overflow-hidden flex items-center justify-center"
                  >
                    <img
                      src={buildImageUrl(img)}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center gap-4">
              {slide?.buttonText && slide?.buttonLink && (
                <Link
                  to={slide.buttonLink}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white transition-all hover:opacity-95 active:scale-[0.98]"
                  style={{ backgroundColor: primaryColor }}
                >
                  {slide.buttonText}
                </Link>
              )}
            </div>
          </div>

          {/* Right: Portrait */}
          <div
            key={`img-${activeIndex}`}
            className="order-1 lg:order-2 relative pro-identity-image-wrap pro-identity-image-fade-in"
          >
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <div className="relative overflow-visible aspect-[4/5] max-h-[520px] min-h-[320px] flex items-end justify-end bg-transparent">
                  {showFallbackImg ? (
                    <img
                      src="/img/aisha1.png"
                      alt={siteName}
                      className="max-h-[520px] w-auto h-full object-contain object-right-bottom"
                      style={{ background: "transparent" }}
                    />
                  ) : (
                    <img
                      src={imageUrl}
                      alt={slide?.title || siteName}
                      className="max-h-[520px] w-auto h-full object-contain object-right-bottom"
                      style={{ background: "transparent" }}
                      onError={() => setImgError(true)}
                    />
                  )}
                </div>
                <div className="flex items-center justify-center lg:justify-end gap-2 mt-5">
                  <button
                    onClick={goPrev}
                    className="w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goNext}
                    className="w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dots indicator */}
        {sliders.length > 1 && (
          <div className="flex justify-center items-center gap-3 mt-14">
            {sliders.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (i !== activeIndex) {
                    setImgError(false);
                    setSlideDirection(i > activeIndex ? "next" : "prev");
                    setIsTransitioning(true);
                    setActiveIndex(i);
                  }
                }}
                className="rounded-full transition-all duration-300 ease-out"
                style={{
                  width: i === activeIndex ? 24 : 8,
                  height: 8,
                  backgroundColor: i === activeIndex ? primaryColor : "#d1d5db",
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
