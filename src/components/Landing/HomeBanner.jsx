import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getWebsiteConfig, isSectionEnabled } from "../../lib/websiteConfig";
import { Instagram } from "lucide-react";
// 3D banner disabled until React 19 or R3F v8 is confirmed installed (was causing "reading 'S' of undefined")
// import Hero3DTextBackground from "./Hero3DTextBackground";

const DEFAULT_HERO = {
  greeting: "Hello, I'm",
  name: "Aisha Abd El-maguid",
  intro:
    "This is a glimpse into my diverse professional journey. From law and media to writing, humanitarian efforts, and creative ventures, join me as we uncover the various facets that shape my professional identity. Let's begin the exploration together.",
  ctaText: "Let's go",
  ctaLink: "#",
  heroImage: "",
  skills: [
    "Presenter",
    "Lawyer",
    "Publisher",
    "Translator",
    "Fashion designer",
    "Magazine",
    "Business",
    "Researcher",
    "Student agent",
    "Charity coaching",
    "Politician",
    "Media",
    "Tv & Channels",
    "Writer",
    "Event organizer",
  ],
};

export default function HomeBanner() {
  const [config, setConfig] = useState(() => getWebsiteConfig());
  const hero = config?.hero || DEFAULT_HERO;
  const skills = Array.isArray(hero?.skills)
    ? hero.skills
    : DEFAULT_HERO.skills || [];
  const primaryColor = config.appearance?.primaryColor || "#D25353";

  const skillsRef = useRef(null);
  const [skillsInView, setSkillsInView] = useState(true);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const handler = () => setConfig(getWebsiteConfig());
    window.addEventListener("website-config-changed", handler);
    return () => window.removeEventListener("website-config-changed", handler);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setIsLargeScreen(mql.matches);
    const onChange = (e) => setIsLargeScreen(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = skillsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setSkillsInView(e.isIntersecting),
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Mobile: full circle (360°). Large: right semicircle only (180°).
  const getSkillAngle = (i, n) => {
    const t = n > 0 ? i / n : 0;
    if (isLargeScreen) {
      return -Math.PI / 2 + t * Math.PI;
    }
    return -Math.PI / 2 + t * 2 * Math.PI;
  };

  return (
    <div
      id="hero-section"
      className="min-h-screen flex flex-col bg-[#fdfbfb] relative"
    >
      {/* 3D typography background - disabled (see import above) */}
      {/* <Hero3DTextBackground primaryColor={primaryColor} /> */}
      {/* Vector.png background */}
      <div
        className="fixed inset-0 pointer-events-none bg-cover bg-no-repeat bg-center bg-[#fdfbfb] z-[1]"
        style={{ backgroundImage: "url(/img/Vector.png)" }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[1]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, ${primaryColor} 1px, transparent 1px),
            radial-gradient(circle at 80% 80%, ${primaryColor} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <main className="flex-1 relative z-10 pt-28 sm:pt-32 md:pt-28 lg:pt-24 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center min-h-0 lg:min-h-[calc(100vh-6rem)]">
            <div className="order-2 lg:order-1 flex flex-col justify-center">
              <p
                className="text-gray-800 text-base sm:text-lg font-medium mb-1 italic"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {hero.greeting}
              </p>
              <h1
                className="hero-name-animate text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4 sm:mb-6 tracking-tight italic inline-block"
                style={{
                  color: primaryColor,
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  textShadow: `0 0 24px ${primaryColor}40`,
                }}
              >
                {hero.name}
              </h1>
              <div className="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-6">
                <span
                  className="w-6 sm:w-8 h-0.5 mt-2 sm:mt-2.5 flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
                />
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {hero.intro}
                </p>
              </div>
              <Link
                to={hero.ctaLink || "#"}
                className="inline-flex items-center justify-center px-8 sm:px-12 py-3 sm:py-3.5 rounded-full min-w-[180px] sm:min-w-[220px] text-white text-sm sm:text-base font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                style={{ backgroundColor: primaryColor, color: "#ffffff" }}
              >
                {hero.ctaText}
              </Link>
            </div>

            <div
              ref={skillsRef}
              className={`skills-container order-1 lg:order-2 relative flex justify-center lg:justify-end min-h-[240px] sm:min-h-[320px] lg:min-h-0 ${skillsInView ? "skills-in-view" : ""}`}
            >
              <div className="relative w-full max-w-[260px] sm:max-w-xs md:max-w-sm lg:max-w-lg aspect-square">
                {/* Central portrait - smaller on mobile, scales up on larger screens */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="relative w-40 h-40 sm:w-72 sm:h-72 md:w-[22rem] md:h-[22rem] lg:w-[88%] lg:h-[88%] rounded-full overflow-hidden shadow-xl ring-2 sm:ring-4 ring-white">
                    {hero.heroImage ? (
                      <img
                        src={hero.heroImage}
                        alt={hero.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src="/img/aisha1.png"
                        alt={hero.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
                {/* Skill tags - oval pills outside portrait only, thin border, soft shadow */}
                {isSectionEnabled("hero") && skills.length > 0 && (
                  <>
                    <div className="absolute inset-0 pointer-events-none">
                      {skills.map((skill, i) => {
                        const n = Math.max(skills.length - 1, 1);
                        const baseAngle = getSkillAngle(i, n);
                        const minRadius = isLargeScreen ? 56 : 52;
                        const radius = minRadius + (i % 5) * 5 + ((i * 11) % 6);
                        const x = 50 + Math.cos(baseAngle) * radius;
                        const y = 50 + Math.sin(baseAngle) * radius * 0.82;
                        return (
                          <span
                            key={i}
                            className="skill-tag-animate absolute text-xs sm:text-sm font-medium text-black bg-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-gray-300 whitespace-nowrap z-10"
                            style={{
                              left: `${x}%`,
                              top: `${y}%`,
                              transform: "translate(-50%, -50%)",
                              "--skill-delay": `${i * 60}ms`,
                            }}
                          >
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                    {/* Connecting lines: portrait edge (35% from center) to skill tags */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      {skills.map((skill, i) => {
                        const n = Math.max(skills.length - 1, 1);
                        const baseAngle = getSkillAngle(i, n);
                        const minRadius = isLargeScreen ? 56 : 52;
                        const radius = minRadius + (i % 5) * 5 + ((i * 11) % 6);
                        const portraitRadius = isLargeScreen ? 44 : 40;
                        const x1 = 50 + Math.cos(baseAngle) * portraitRadius;
                        const y1 =
                          50 + Math.sin(baseAngle) * portraitRadius * 0.82;
                        const x2 = 50 + Math.cos(baseAngle) * (radius - 4);
                        const y2 =
                          50 + Math.sin(baseAngle) * (radius - 4) * 0.82;
                        return (
                          <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={primaryColor}
                            strokeWidth="0.35"
                            opacity="0.35"
                          />
                        );
                      })}
                    </svg>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* {isSectionEnabled("footer") && (
        <footer
          className="relative z-10 border-t-2 py-6"
          style={{ borderColor: primaryColor }}
        >
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {config.social?.instagram && (
                <a
                  href={config.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:opacity-80 transition-opacity"
                >
                  <Instagram className="w-6 h-6" />
                </a>
              )}
              {config.social?.whatsapp && (
                <a
                  href={`https://wa.me/${String(config.social.whatsapp).replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:opacity-80 transition-opacity"
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-lg">
              R
            </div>
          </div>
        </footer>
      )} */}
    </div>
  );
}
