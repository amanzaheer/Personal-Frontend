import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  getWebsiteConfig,
  saveWebsiteConfig,
  DEFAULT_CONFIG,
} from "../lib/websiteConfig";
import {
  Layout,
  Globe,
  Palette,
  Share2,
  Save,
  Image,
  BookOpen,
  Mail,
  FileText,
  LayoutGrid,
  Settings2,
} from "lucide-react";

export default function WebsiteConfiguration() {
  const [config, setConfig] = useState(() =>
    JSON.parse(JSON.stringify(DEFAULT_CONFIG)),
  );
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setConfig(getWebsiteConfig());
  }, []);

  const updateConfig = (path, value) => {
    setConfig((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!obj[k]) obj[k] = {};
        obj = obj[k];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
    setHasChanges(true);
  };

  const updateSection = (key, field, value) => {
    setConfig((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next.sections[key])
        next.sections[key] = { ...DEFAULT_CONFIG.sections[key] };
      next.sections[key][field] = value;
      return next;
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    setSaving(true);
    try {
      if (saveWebsiteConfig(config)) {
        toast.success("Website configuration saved");
        setHasChanges(false);
      } else {
        toast.error("Failed to save configuration");
      }
    } catch (e) {
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm("Reset all settings to defaults?")) {
      setConfig(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
      setHasChanges(true);
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col bg-background">
        <Toaster position="top-right" />
        <div className="p-6 max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="slider-card-title text-2xl font-bold text-foreground">
                Website Configuration
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage UI sections and global website settings
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetToDefaults}
                className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-muted/50 cursor-pointer text-sm font-medium transition-colors"
              >
                Reset defaults
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="px-5 py-2.5 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {/* General Settings */}
            <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-accent/10">
                  <Globe className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">General</h2>
                  <p className="text-sm text-muted-foreground">
                    Site name, tagline, and meta
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Site name
                  </label>
                  <input
                    type="text"
                    value={config.general?.siteName || ""}
                    onChange={(e) =>
                      updateConfig("general.siteName", e.target.value)
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-accent/30 focus:border-accent"
                    placeholder="Your site name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={config.general?.tagline || ""}
                    onChange={(e) =>
                      updateConfig("general.tagline", e.target.value)
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-accent/30 focus:border-accent"
                    placeholder="Writer · Publisher"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Meta description
                  </label>
                  <textarea
                    value={config.general?.metaDescription || ""}
                    onChange={(e) =>
                      updateConfig("general.metaDescription", e.target.value)
                    }
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none"
                    placeholder="SEO meta description"
                  />
                </div>
              </div>
            </section>

            {/* UI Sections */}
            <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-accent/10">
                  <Layout className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">UI Sections</h2>
                  <p className="text-sm text-muted-foreground">
                    Show or hide sections on the public website
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {Object.entries(config.sections || {}).map(([key, section]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-background">
                        {key === "hero" && (
                          <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                        )}
                        {key === "about" && (
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        )}
                        {key === "books" && (
                          <BookOpen className="w-5 h-5 text-muted-foreground" />
                        )}
                        {key === "gallery" && (
                          <Image className="w-5 h-5 text-muted-foreground" />
                        )}
                        {key === "contact" && (
                          <Mail className="w-5 h-5 text-muted-foreground" />
                        )}
                        {key === "footer" && (
                          <Settings2 className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {section.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        updateSection(key, "enabled", !section.enabled)
                      }
                      className={`relative w-14 h-8 rounded-full transition-colors cursor-pointer ${
                        section.enabled ? "bg-accent" : "bg-muted"
                      }`}
                      role="switch"
                      aria-checked={section.enabled}
                    >
                      <span
                        className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                          section.enabled ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Appearance */}
            <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-accent/10">
                  <Palette className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Appearance</h2>
                  <p className="text-sm text-muted-foreground">
                    Visual preferences and layout
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                  <div>
                    <p className="font-medium text-foreground">
                      Show search in header
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Display search bar in site header
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updateConfig(
                        "appearance.showSearchInHeader",
                        !config.appearance?.showSearchInHeader,
                      )
                    }
                    className={`relative w-14 h-8 rounded-full transition-colors cursor-pointer ${
                      config.appearance?.showSearchInHeader
                        ? "bg-accent"
                        : "bg-muted"
                    }`}
                    role="switch"
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                        config.appearance?.showSearchInHeader
                          ? "left-7"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                  <div>
                    <p className="font-medium text-foreground">
                      Compact header
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Use a smaller header layout
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updateConfig(
                        "appearance.compactHeader",
                        !config.appearance?.compactHeader,
                      )
                    }
                    className={`relative w-14 h-8 rounded-full transition-colors cursor-pointer ${
                      config.appearance?.compactHeader
                        ? "bg-accent"
                        : "bg-muted"
                    }`}
                    role="switch"
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                        config.appearance?.compactHeader ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Social Links */}
            <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-accent/10">
                  <Share2 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    Social Links
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    URLs for social media profiles
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "facebook",
                  "twitter",
                  "instagram",
                  "linkedin",
                  "youtube",
                ].map((platform) => (
                  <div key={platform}>
                    <label className="block text-sm font-medium text-foreground mb-1.5 capitalize">
                      {platform}
                    </label>
                    <input
                      type="url"
                      value={config.social?.[platform] || ""}
                      onChange={(e) =>
                        updateConfig(`social.${platform}`, e.target.value)
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-accent/30 focus:border-accent"
                      placeholder={`https://${platform}.com/username`}
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
