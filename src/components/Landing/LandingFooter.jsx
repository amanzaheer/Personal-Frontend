import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Heart } from "lucide-react";
import { getWebsiteConfig, isSectionEnabled } from "../../lib/websiteConfig";
import { buildUploadUrl } from "../../lib/uploadUrl";

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || "";

export default function LandingFooter() {
  const [footer, setFooter] = useState(null);
  const [loading, setLoading] = useState(true);
  const config = getWebsiteConfig();
  const primaryColor = config.appearance?.primaryColor || "#D25353";
  const siteName = config.general?.siteName || "Aisha Abd El-maguid";

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        setLoading(true);
        const base = apiBaseURL.endsWith("/api")
          ? apiBaseURL
          : `${apiBaseURL}/api`;
        const res = await fetch(`${base}/footer`);
        const json = await res.json();
        const data = json?.data ?? json;
        const f = data?.footer ?? data;
        setFooter(f);
      } catch {
        setFooter(null);
      } finally {
        setLoading(false);
      }
    };
    fetchFooter();
  }, []);

  if (!isSectionEnabled("footer")) return null;

  const hasContent =
    footer &&
    (footer.email ||
      footer.phone ||
      footer.address ||
      (footer.socialLinks && footer.socialLinks.length > 0));

  if (!hasContent && !loading) return null;

  const links = Array.isArray(footer?.socialLinks)
    ? footer.socialLinks
    : Array.isArray(footer?.sociallinks)
      ? footer.sociallinks
      : [];

  const lineStyle = (dir) => ({
    background: `linear-gradient(${dir}, transparent 0%, ${primaryColor}40 30%, ${primaryColor} 100%)`,
  });
  const dotStyle = { backgroundColor: primaryColor };

  return (
    <footer
      className="relative mt-auto overflow-hidden"
      aria-label="Site footer"
    >
      {/* Curved top edge - primary color into dark */}
      <div
        className="absolute left-0 right-0 top-0 h-12 md:h-16 -translate-y-px"
        style={{
          background: `linear-gradient(180deg, transparent 50%, ${primaryColor} 50%)`,
          clipPath: "ellipse(120% 100% at 50% 100%)",
        }}
      />

      <div
        className="relative pt-14 md:pt-20 pb-8 px-6 text-stone-800"
        style={{
          background: `linear-gradient(165deg, ${primaryColor}18 0%, #fafaf9 40%, #f5f5f4 100%)`,
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, ${primaryColor} 1px, transparent 1px),
              radial-gradient(circle at 80% 20%, ${primaryColor} 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          {loading ? (
            <div className="flex justify-center py-12">
              <div
                className="w-10 h-10 rounded-full border-2 animate-spin"
                style={{ borderColor: `${primaryColor}40`, borderTopColor: primaryColor }}
              />
            </div>
          ) : (
            <>
              {/* Main footer heading with lines (like other sections) */}
              <div className="flex items-center justify-center gap-4 md:gap-6 mb-12">
                <div className="hidden sm:flex flex-1 max-w-[120px] md:max-w-[180px] items-center">
                  <div
                    className="h-0.5 flex-1 rounded-full"
                    style={lineStyle("90deg")}
                  />
                  <div className="w-2 h-2 rounded-full shrink-0 mx-1 opacity-90" style={dotStyle} />
                </div>
                <h2
                  className="text-xl md:text-2xl font-bold tracking-tight italic text-center px-4"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    color: primaryColor,
                  }}
                >
                  Connect
                </h2>
                <div className="hidden sm:flex flex-1 max-w-[120px] md:max-w-[180px] items-center">
                  <div className="w-2 h-2 rounded-full shrink-0 mx-1 opacity-90" style={dotStyle} />
                  <div
                    className="h-0.5 flex-1 rounded-full"
                    style={lineStyle("270deg")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mb-12">
                {/* Brand */}
                <div className="text-center md:text-left">
                  <h3
                    className="text-2xl md:text-3xl font-bold tracking-tight italic mb-2"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      color: primaryColor,
                    }}
                  >
                    {siteName}
                  </h3>
                  <p className="text-stone-600 text-sm">
                    Writer · Publisher
                  </p>
                </div>

                {/* Contact - with line heading */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 rounded-full max-w-[60px]" style={lineStyle("90deg")} />
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={dotStyle} />
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: primaryColor }}>
                      Get in touch
                    </p>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={dotStyle} />
                    <div className="h-px flex-1 rounded-full max-w-[60px]" style={lineStyle("270deg")} />
                  </div>
                  {footer?.email && (
                    <a
                      href={`mailto:${footer.email}`}
                      className="flex items-center gap-3 text-stone-700 hover:opacity-90 transition-colors group"
                    >
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 text-stone-600"
                        style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${primaryColor}28`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${primaryColor}18`; }}
                      >
                        <Mail className="w-5 h-5" style={{ color: primaryColor }} />
                      </span>
                      <span className="text-sm font-medium break-all">
                        {footer.email}
                      </span>
                    </a>
                  )}
                  {footer?.phone && (
                    <a
                      href={`tel:${footer.phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-3 text-stone-700 hover:opacity-90 transition-colors group"
                    >
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                        style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${primaryColor}28`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${primaryColor}18`; }}
                      >
                        <Phone className="w-5 h-5" style={{ color: primaryColor }} />
                      </span>
                      <span className="text-sm font-medium">
                        {footer.phone}
                      </span>
                    </a>
                  )}
                  {footer?.address && (
                    <div className="flex items-start gap-3 text-stone-700">
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
                      >
                        <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
                      </span>
                      <span className="text-sm leading-relaxed text-stone-700">
                        {footer.address}
                      </span>
                    </div>
                  )}
                  {!footer?.email && !footer?.phone && !footer?.address && (
                    <p className="text-stone-500 text-sm">No contact info yet.</p>
                  )}
                </div>

                {/* Social - with line heading */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 rounded-full max-w-[60px]" style={lineStyle("90deg")} />
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={dotStyle} />
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: primaryColor }}>
                      Follow
                    </p>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={dotStyle} />
                    <div className="h-px flex-1 rounded-full max-w-[60px]" style={lineStyle("270deg")} />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {links
                      .filter((s) => s?.link?.trim())
                      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                      .map((link, i) => {
                        const iconUrl = buildUploadUrl(link.icon);
                        return (
                          <a
                            key={link._id || i}
                            href={link.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                            style={{
                              backgroundColor: `${primaryColor}12`,
                              border: `1px solid ${primaryColor}30`,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = `${primaryColor}60`;
                              e.currentTarget.style.backgroundColor = `${primaryColor}20`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = `${primaryColor}30`;
                              e.currentTarget.style.backgroundColor = `${primaryColor}12`;
                            }}
                            title={link.name}
                            aria-label={link.name}
                          >
                            {iconUrl ? (
                              <img
                                src={iconUrl}
                                alt=""
                                className="w-6 h-6 object-contain"
                              />
                            ) : (
                              <span
                                className="text-lg font-bold"
                                style={{ color: primaryColor }}
                              >
                                {(link.name || "?")[0].toUpperCase()}
                              </span>
                            )}
                          </a>
                        );
                      })}
                  </div>
                  {!links.filter((s) => s?.link?.trim()).length && (
                    <p className="text-stone-500 text-sm">No links yet.</p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div
                className="h-px w-full mb-8"
                style={{ background: `linear-gradient(90deg, transparent 0%, ${primaryColor}40 50%, transparent 100%)` }}
              />

              {/* Copyright */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <p className="text-stone-600 text-sm">
                  © {new Date().getFullYear()} {siteName}. All rights reserved.
                </p>
                <p className="text-stone-600 text-xs flex items-center gap-1">
                  Made with <Heart className="w-3.5 h-3.5 fill-current" style={{ color: primaryColor }} /> for readers
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
