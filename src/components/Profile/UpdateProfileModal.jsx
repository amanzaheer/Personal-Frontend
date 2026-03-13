import React, { useState, useEffect, useCallback } from "react";
import { X, User, Mail } from "lucide-react";
import toast from "react-hot-toast";
import useProfile from "../../hooks/useProfile";

export default function UpdateProfileModal({
  isOpen,
  onClose,
  profileData,
  onSuccess,
}) {
  const { updateProfile, loading } = useProfile();
  const [formData, setFormData] = useState({
    name: profileData?.name || "",
    email: profileData?.email || "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData?.name || "",
        email: profileData?.email || "",
      });
    }
  }, [profileData]);

  const handleClose = useCallback(() => {
    setFormData({
      name: profileData?.name || "",
      email: profileData?.email || "",
    });
    setError("");
    onClose();
  }, [onClose, profileData]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name?.trim()) {
      setError("Name is required");
      return;
    }
    if (!formData.email?.trim()) {
      setError("Email is required");
      return;
    }

    try {
      const result = await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      if (result.success) {
        toast.success(result.message || "Profile updated successfully");
        if (onSuccess) onSuccess(result.data);
        onClose();
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    } catch (err) {
      const errorMessage = err?.message || "Failed to update profile.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      <div
        className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-lg"
        onClick={handleClose}
        style={{ zIndex: 100 }}
      />

      <div
        className="relative bg-card border border-border/50 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={{ zIndex: 101 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h3 className="text-xl font-semibold text-foreground">Update Profile</h3>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Name</label>
              <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3 focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20">
                <User className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="flex-1 bg-transparent text-foreground focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Email</label>
              <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3 focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent text-foreground focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <button type="button" onClick={handleClose} className="px-5 py-2.5 border border-border rounded-xl hover:bg-secondary font-medium">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 font-medium disabled:opacity-50">
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
