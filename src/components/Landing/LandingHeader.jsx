import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { Menu, LogIn, UserPlus, LayoutDashboard } from "lucide-react";
import { getWebsiteConfig } from "../../lib/websiteConfig";

const SECTION_LINKS = [
  { key: "hero", label: "Home", targetId: "hero-section" },
  {
    key: "about",
    label: "Professional Identity",
    targetId: "professional-identity-section",
  },
  { key: "books", label: "Books", targetId: "books-section" },
  { key: "gallery", label: "Gallery", targetId: "gallery-section" },
];

function useIsAuthenticated() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token")
      : null;
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return !!(payload?.exp && payload.exp > Math.floor(Date.now() / 1000));
  } catch {
    return false;
  }
}

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const isAuthenticated = useIsAuthenticated();
  const config = getWebsiteConfig();
  const primaryColor = config.appearance?.primaryColor || "#D25353";
  const [isScrolled, setIsScrolled] = useState(false);

  const siteName = config.general?.siteName || "Aisha Abd El-maguid";

  const navLinks = SECTION_LINKS.filter(
    (link) => config.sections?.[link.key]?.enabled !== false,
  );

  const scrollToSection = (targetId) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const headerOffset = 88;
    const rect = el.getBoundingClientRect();
    const offset = window.pageYOffset + rect.top - headerOffset;
    window.scrollTo({
      top: offset,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Header - solid bg to avoid gray line when overlay opens */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          isScrolled ? "backdrop-blur-sm bg-white/40  " : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 pt-4 flex items-center justify-between">
          <Link
            to="/"
            onClick={() => menuOpen && setMenuOpen(false)}
            className="flex items-center gap-3"
          >
            <img
              src="/img/logoaisha.png"
              alt={siteName}
              className=" h-12 lg:h-20 w-auto"
            />
          </Link>

          <div className="relative">
            <button
              ref={menuButtonRef}
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                menuOpen ? "bg-gray-100/90" : "hover:bg-gray-100/80"
              }`}
              style={{ color: primaryColor }}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <Menu
                className={`w-6 h-6 transition-transform duration-300 ${menuOpen ? "scale-95" : ""}`}
                strokeWidth={2}
              />
            </button>

            {/* Dropdown - rendered via portal to avoid stacking/click issues */}
            {menuOpen &&
              createPortal(
                <>
                  <div
                    className="fixed inset-0 menu-overlay-enter"
                    style={{
                      zIndex: 9998,
                      background: "rgba(15, 23, 42, 0.25)",
                    }}
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <nav
                    className="fixed menu-dropdown-enter min-w-[240px] max-w-[280px] max-h-[min(400px,72vh)] flex flex-col overflow-hidden"
                    style={(() => {
                      const rect =
                        menuButtonRef.current?.getBoundingClientRect();
                      return {
                        zIndex: 9999,
                        top: rect ? rect.bottom + 8 : 72,
                        right: rect ? window.innerWidth - rect.right : 24,
                        left: "auto",
                        ["--menu-primary-hover"]: `${primaryColor}12`,
                        background: "rgba(255, 255, 255, 0.97)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        borderRadius: "16px",
                        border: "1px solid rgba(0, 0, 0, 0.06)",
                        boxShadow:
                          "0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 10px 20px -5px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)",
                      };
                    })()}
                    role="menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="overflow-y-auto flex-1 py-3 menu-dropdown-scrollbar-hide max-h-[260px] px-3">
                      {navLinks.map((link, i) => (
                        <button
                          key={link.key}
                          type="button"
                          onClick={() => {
                            scrollToSection(link.targetId);
                            setMenuOpen(false);
                          }}
                          className="menu-item-enter group w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-gray-50 active:scale-[0.99] text-left"
                          style={{
                            animationDelay: `${Math.min(i * 25, 200)}ms`,
                          }}
                        >
                          <span className="text-[13px] font-medium text-gray-700 truncate group-hover:text-gray-900">
                            {link.label}
                          </span>
                          <span
                            className="flex shrink-0 w-2 h-2 rounded-full transition-colors duration-200 group-hover:opacity-100"
                            style={{
                              backgroundColor: `${primaryColor}`,
                              opacity: 0.7,
                            }}
                          />
                        </button>
                      ))}
                    </div>

                    <div
                      className="border-t p-3 space-y-1.5"
                      style={{ borderColor: "rgba(0, 0, 0, 0.06)" }}
                    >
                      {isAuthenticated ? (
                        <a
                          href="/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-95 active:scale-[0.98] no-underline"
                          style={{
                            backgroundColor: primaryColor,
                            color: "#ffffff",
                            boxShadow: `0 2px 12px ${primaryColor}55`,
                          }}
                          role="menuitem"
                        >
                          <LayoutDashboard
                            className="w-4 h-4 shrink-0"
                            strokeWidth={1.5}
                          />
                          <span>Dashboard</span>
                        </a>
                      ) : (
                        <>
                          <a
                            href="/login"
                            onClick={() => setMenuOpen(false)}
                            className="menu-login-btn w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] no-underline"
                            style={{
                              border: `1.5px solid ${primaryColor}60`,
                              color: primaryColor,
                              backgroundColor: `${primaryColor}06`,
                            }}
                            role="menuitem"
                          >
                            <LogIn
                              className="w-4 h-4 shrink-0"
                              strokeWidth={1.5}
                            />
                            <span>Login</span>
                          </a>
                          <a
                            href="/signup"
                            onClick={() => setMenuOpen(false)}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-95 active:scale-[0.98] no-underline"
                            style={{
                              backgroundColor: primaryColor,
                              color: "#ffffff",
                              boxShadow: `0 2px 12px ${primaryColor}55`,
                            }}
                            role="menuitem"
                          >
                            <UserPlus
                              className="w-4 h-4 shrink-0"
                              strokeWidth={1.5}
                            />
                            <span>Signup</span>
                          </a>
                        </>
                      )}
                    </div>
                  </nav>
                </>,
                document.body,
              )}
          </div>
        </div>
      </header>
    </>
  );
}
