import React, { useState, useEffect, useCallback } from "react";
import { X, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import useProfile from "../../hooks/useProfile";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { changePassword, loading } = useProfile();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleClose = useCallback(() => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setError("");
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    onClose();
  }, [onClose]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.currentPassword.trim()) {
      setError("Current password is required");
      return;
    }

    if (!formData.newPassword.trim()) {
      setError("New password is required");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError("Current password and new password should not be the same");
      return;
    }

    try {
      const result = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      if (result.success) {
        toast.success(result.message || "Password changed successfully");
        handleClose();
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to change password. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative bg-background rounded-2xl shadow-2xl border border-border/50 w-full max-w-md mx-4 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-background to-secondary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Lock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Change Password
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Update your account password
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-200 hover:rotate-90"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "var(--secondary) var(--background)",
          }}
        >
          {error && (
            <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg px-4 py-3 flex items-start gap-2">
              <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              Current Password
              <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3 focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20 transition-all duration-200">
              <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter current password"
                className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-sm"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-secondary/50"
                aria-label={
                  showPasswords.current ? "Hide password" : "Show password"
                }
              >
                {showPasswords.current ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              New Password
              <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3 focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20 transition-all duration-200">
              <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-sm"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-secondary/50"
                aria-label={
                  showPasswords.new ? "Hide password" : "Show password"
                }
              >
                {showPasswords.new ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Password must be at least 8 characters long
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              Confirm Password
              <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3 focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20 transition-all duration-200">
              <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-sm"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-secondary/50"
                aria-label={
                  showPasswords.confirm ? "Hide password" : "Show password"
                }
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border bg-gradient-to-r from-transparent to-secondary/10 -mx-6 px-6 py-4 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-secondary/80 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
