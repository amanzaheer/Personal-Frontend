const STORAGE_KEY = "website_config";

export const DEFAULT_CONFIG = {
  general: {
    siteName: "Aisha Abd El-maguid",
    tagline: "Writer · Publisher",
    metaDescription: "A glimpse into my diverse professional journey.",
    faviconUrl: "",
  },
  hero: {
    greeting: "Hello, I'm",
    name: "Aisha Abd El-maguid",
    intro: "This is a glimpse into my diverse professional journey. From law and media to writing, humanitarian efforts, and creative ventures, join me as we uncover the various facets that shape my professional identity. Let's begin the exploration together.",
    ctaText: "Let's go",
    ctaLink: "#",
    heroImage: "",
    skills: [
      "Presenter", "Lawyer", "Publisher", "Translator", "Fashion designer",
      "Magazine", "Business", "Researcher", "Student agent", "Charity coaching",
      "Politician", "Media", "Tv & Channels", "Writer", "Event organizer",
    ],
  },
  sections: {
    hero: { enabled: true, label: "Hero / Slider", description: "Main banner carousel on homepage" },
    about: { enabled: true, label: "About", description: "About me section" },
    books: { enabled: true, label: "Books & Featured", description: "Featured books and publications" },
    gallery: { enabled: true, label: "Gallery", description: "Image gallery section" },
    contact: { enabled: true, label: "Contact", description: "Contact form and info" },
    footer: { enabled: true, label: "Footer", description: "Site footer with links" },
  },
  appearance: {
    primaryColor: "#D25353",
    showSearchInHeader: true,
    compactHeader: false,
  },
  social: {
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    custom: [],
  },
};

function deepMergeSections(defaultSections, savedSections) {
  if (!savedSections || typeof savedSections !== "object")
    return { ...defaultSections };
  const result = { ...defaultSections };
  for (const key of Object.keys(result)) {
    if (savedSections[key] && typeof savedSections[key] === "object") {
      result[key] = { ...result[key], ...savedSections[key] };
    }
  }
  return result;
}

export function getWebsiteConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const merged = { ...DEFAULT_CONFIG, ...parsed };
      if (parsed.hero && typeof parsed.hero === "object") {
        merged.hero = { ...DEFAULT_CONFIG.hero, ...parsed.hero };
        if (Array.isArray(parsed.hero.skills)) merged.hero.skills = parsed.hero.skills;
      }
      if (parsed.sections) {
        merged.sections = deepMergeSections(
          DEFAULT_CONFIG.sections,
          parsed.sections
        );
      }
      return merged;
    }
  } catch (e) {
    console.error("Error loading website config:", e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

export function saveWebsiteConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent("website-config-changed", { detail: config }));
    return true;
  } catch (e) {
    console.error("Error saving website config:", e);
    return false;
  }
}

export function isSectionEnabled(sectionKey) {
  const config = getWebsiteConfig();
  return config.sections?.[sectionKey]?.enabled !== false;
}
