import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import useApi from "../lib/useApi";
import { Button } from "../components/ui/button";
import {
  Plus,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  ImageIcon,
  Eye,
  Pencil,
} from "lucide-react";

const SOCIAL_NAMES = [
  "whatsapp",
  "facebook",
  "instagram",
  "tiktok",
  "twitter",
  "youtube",
  "linkedin",
  "telegram",
  "other",
];

function buildAssetUrl(path, uploadsBaseURL) {
  if (!path || typeof path !== "string") return null;
  const trimmed = path.trim();
  if (!trimmed || !uploadsBaseURL) return null;
  if (trimmed.startsWith("http")) return trimmed;
  const p = trimmed.replace(/^\/+/, "");
  return `${uploadsBaseURL.replace(/\/+$/, "")}/${p}`;
}

// Live preview panel — shows current form data in a professional footer style
function FooterPreview({ email, phone, address, socialLinks, uploadsBaseURL }) {
  const hasAny =
    email || phone || address || (socialLinks && socialLinks.length > 0);
  const displayLinks = socialLinks?.filter((s) => s?.link?.trim()) || [];

  // Resolve icon URL for preview (object URL for new file, or uploaded path)
  const getIconUrl = (link) => {
    if (link.iconFile && link.iconFile instanceof File) {
      return URL.createObjectURL(link.iconFile);
    }
    return buildAssetUrl(link.icon, uploadsBaseURL);
  };

  return (
    <div className="h-full min-h-[420px] flex flex-col rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
      <div className="px-6 py-4 border-b border-border bg-accent/5">
        <div className="flex items-center gap-2 text-accent">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium tracking-wide">
            Live Preview
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          Read-only — edit contact and links in the form on the left.
        </p>
      </div>
      <div className="flex-1 p-8 flex flex-col justify-center bg-muted/20">
        {!hasAny ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              Add email, address, or social links
            </p>
            <p className="text-xs mt-1 text-muted-foreground/80">
              to see your footer preview here
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Contact block */}
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Get in touch
              </p>
              <div className="space-y-3">
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-3 text-foreground/90 hover:text-foreground transition-colors group"
                  >
                    <span className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Mail className="w-4 h-4 text-accent" />
                    </span>
                    <span className="text-sm font-medium truncate">
                      {email}
                    </span>
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-3 text-foreground/90 hover:text-foreground transition-colors group"
                  >
                    <span className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Phone className="w-4 h-4 text-accent" />
                    </span>
                    <span className="text-sm font-medium">{phone}</span>
                  </a>
                )}
                {address && (
                  <div className="flex items-start gap-3 text-foreground/90">
                    <span className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-accent" />
                    </span>
                    <span className="text-sm leading-relaxed">{address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Social links */}
            {displayLinks.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Follow us
                </p>
                <div className="flex flex-wrap gap-3">
                  {displayLinks.map((link, i) => {
                    const iconUrl = getIconUrl(link);
                    return (
                      <a
                        key={i}
                        href={link.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 rounded-xl bg-accent/10 hover:bg-accent/20 flex items-center justify-center transition-all hover:scale-105 border border-border"
                        title={link.name}
                      >
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt={link.name}
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <span className="text-lg font-bold text-accent">
                            {link.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FooterPage() {
  const navigate = useNavigate();
  const api = useApi();
  const apiBaseURL = import.meta.env.VITE_API_BASE_URL || "";
  const uploadsBaseURL =
    import.meta.env.VITE_UPLOADS_BASE_URL ||
    apiBaseURL.replace(/\/api\/?$/, "");

  const [isAdmin, setIsAdmin] = useState(null);
  const [footer, setFooter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : null;
      const role = user?.role?.toLowerCase?.();
      if (role !== "admin") {
        navigate("/dashboard", { replace: true });
        return;
      }
      setIsAdmin(true);
    } catch {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (isAdmin !== true) return;
    fetchFooter();
  }, [isAdmin]);

  const fetchFooter = async () => {
    try {
      setLoading(true);
      const res = await api.get("footer");
      const data = res?.data?.data ?? res?.data ?? {};
      const f = data.footer ?? data;
      setFooter(f);
      setEmail(f?.email ?? "");
      setPhone(f?.phone ?? "");
      setAddress(f?.address ?? "");
      const links = Array.isArray(f?.socialLinks)
        ? f.socialLinks
        : Array.isArray(f?.sociallinks)
          ? f.sociallinks
          : [];
      setSocialLinks(
        links.length
          ? links.map((s) => ({
              name: s.name || "other",
              link: s.link || "",
              icon: s.icon || "",
              sortOrder: s.sortOrder ?? 0,
              iconFile: null,
            }))
          : [],
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load footer");
      setFooter(null);
      setEmail("");
      setPhone("");
      setAddress("");
      setSocialLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const hasFooter =
    footer &&
    (footer._id ||
      footer.email ||
      (footer.socialLinks?.length ?? footer.sociallinks?.length));

  const addSocialLink = () => {
    setSocialLinks((prev) => [
      ...prev,
      {
        name: "other",
        link: "",
        icon: "",
        sortOrder: prev.length,
        iconFile: null,
      },
    ]);
  };

  const removeSocialLink = (index) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index, field, value) => {
    setSocialLinks((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const setSocialLinkFile = (index, file) => {
    setSocialLinks((prev) =>
      prev.map((s, i) => (i === index ? { ...s, iconFile: file || null } : s)),
    );
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("email", email);
    fd.append("phone", phone);
    fd.append("address", address);
    const payload = socialLinks.map((s, i) => ({
      name: s.name || "other",
      link: s.link || "",
      sortOrder: i,
      icon: s.iconFile ? undefined : s.icon || "",
    }));
    fd.append("socialLinks", JSON.stringify(payload));
    socialLinks.forEach((s, i) => {
      if (s.iconFile && s.iconFile instanceof File) {
        fd.append(`icon_${i}`, s.iconFile);
      }
    });
    return fd;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    try {
      const fd = buildFormData();
      if (hasFooter) {
        const res = await api.putForm("footer", fd);
        if (res?.data?.success || res?.data?.data) {
          toast.success(res?.data?.message || "Footer updated successfully");
          await fetchFooter();
        } else {
          toast.error(res?.data?.message || "Failed to update footer");
        }
      } else {
        const res = await api.postForm("footer", fd);
        if (res?.data?.success || res?.data?.data) {
          toast.success(res?.data?.message || "Footer created successfully");
          await fetchFooter();
        } else {
          toast.error(res?.data?.message || "Failed to create footer");
        }
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to save footer";
      toast.error(msg);
      if (
        err?.response?.data?.error &&
        typeof err.response.data.error === "object"
      ) {
        setErrors(err.response.data.error);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!hasFooter) return;
    if (
      !window.confirm(
        "Are you sure you want to delete the footer? This cannot be undone.",
      )
    )
      return;
    setDeleting(true);
    try {
      await api.delete("footer");
      toast.success("Footer deleted successfully");
      setFooter(null);
      setEmail("");
      setPhone("");
      setAddress("");
      setSocialLinks([]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete footer");
    } finally {
      setDeleting(false);
    }
  };

  if (isAdmin !== true) return null;

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-background p-6">
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
          {/* —— LEFT: Edit form —— */}
          <div className="lg:w-[420px] shrink-0">
            <div className="sticky top-6 space-y-6">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-accent/10">
                      <Pencil className="w-5 h-5 text-accent" />
                    </span>
                    <h1
                      className="text-xl font-semibold text-foreground"
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                      }}
                    >
                      Edit Footer
                    </h1>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fetchFooter}
                    disabled={loading}
                    className="cursor-pointer shrink-0"
                    title="Reload footer data"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Edit contact info and social links below. The panel on the
                  right is a <strong>preview only</strong> — all edits happen
                  here.
                </p>
                {!loading && (
                  <div className="flex justify-end mt-3">
                    <Button
                      type="submit"
                      form="footer-edit-form"
                      disabled={saving}
                      className="cursor-pointer rounded-xl py-2 px-4 bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      {saving
                        ? "Saving…"
                        : hasFooter
                          ? "Update Footer"
                          : "Create Footer"}
                    </Button>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">
                  Loading footer…
                </div>
              ) : (
                <form
                  id="footer-edit-form"
                  onSubmit={handleSave}
                  className="space-y-5"
                >
                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                    <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Mail className="w-4 h-4 text-accent/80" />
                      Contact
                    </h2>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contact@example.com"
                        className="w-full px-3 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-shadow"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 234 567 890"
                        className="w-full px-3 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-shadow"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Address
                      </label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Main St, City, Country"
                        rows={2}
                        className="w-full px-3 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-accent/40 focus:border-accent/50 resize-none transition-shadow"
                      />
                      {errors.address && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.address}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-accent/80" />
                        Social links
                      </h2>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSocialLink}
                        className="cursor-pointer text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add
                      </Button>
                    </div>

                    {socialLinks.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-3">
                        No links yet. Add WhatsApp, Instagram, etc.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                        {socialLinks.map((link, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-xl border border-border bg-background/60 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-muted-foreground">
                                #{index + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeSocialLink(index)}
                                className="p-1 text-red-500 hover:bg-red-500/10 rounded cursor-pointer transition-colors"
                                title="Remove this link only (does not delete the whole footer)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <select
                              value={link.name}
                              onChange={(e) =>
                                updateSocialLink(index, "name", e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-background text-foreground text-xs"
                            >
                              {SOCIAL_NAMES.map((n) => (
                                <option key={n} value={n}>
                                  {n.charAt(0).toUpperCase() + n.slice(1)}
                                </option>
                              ))}
                            </select>
                            <input
                              type="url"
                              value={link.link}
                              onChange={(e) =>
                                updateSocialLink(index, "link", e.target.value)
                              }
                              placeholder="https://..."
                              className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-background text-foreground text-xs focus:ring-2 focus:ring-accent/40"
                            />
                            <div className="flex items-center gap-2">
                              {link.iconFile ? (
                                <span className="text-xs text-foreground truncate">
                                  {link.iconFile.name}
                                </span>
                              ) : link.icon ? (
                                <img
                                  src={buildAssetUrl(link.icon, uploadsBaseURL)}
                                  alt=""
                                  className="h-7 w-7 rounded object-contain border border-border"
                                />
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  No icon
                                </span>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  setSocialLinkFile(
                                    index,
                                    e.target.files?.[0] || null,
                                  )
                                }
                                className="text-xs file:py-1 file:px-2 file:rounded file:border-0 file:bg-accent/10 file:text-accent cursor-pointer"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {hasFooter && (
                    <div className="pt-4 mt-4 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Danger zone
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Permanently remove all footer data (contact + social
                        links). To remove only one social link, use the trash
                        icon next to that link above.
                      </p>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="cursor-pointer w-full rounded-xl py-2.5 bg-accent hover:bg-accent/90"
                      >
                        {deleting ? "Deleting…" : "Delete entire footer"}
                      </Button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* —— RIGHT: Live preview (read-only) —— */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-2 lg:mb-2">
              How your footer will look on the site
            </p>
            <div className="h-full min-h-[500px] lg:min-h-[calc(100vh-6rem)]">
              <FooterPreview
                email={email}
                phone={phone}
                address={address}
                socialLinks={socialLinks}
                uploadsBaseURL={uploadsBaseURL}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
