import React, { useState } from "react";
import { X, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";

export default function ResetPasswordModal({
  isOpen,
  onClose,
  token,
  onSuccess,
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || !password.trim()) {
      setError("Please enter a new password");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, password, confirmPassword);

      if (result.success) {
        setSuccess(true);
        toast.success(
          "Password reset successfully! You can now login with your new password."
        );
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to reset password. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h3 className="text-xl font-semibold text-foreground">
            Reset Password
          </h3>
          {!success && (
            <button
              onClick={handleClose}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Password Reset Successful
                </h4>
                <p className="text-sm text-muted-foreground">
                  Your password has been reset successfully. You can now login
                  with your new password.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your new password below. Make sure it's at least 8
                characters long.
              </p>
              {error && (
                <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-md px-3 py-2">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-sm text-foreground">New Password</span>
                  <div className="mt-1.5 flex items-center gap-2 bg-background border border-border rounded-lg px-3 focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/20">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full bg-transparent py-2.5 text-foreground placeholder-muted-foreground focus:outline-none"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm text-foreground">
                    Confirm Password
                  </span>
                  <div className="mt-1.5 flex items-center gap-2 bg-background border border-border rounded-lg px-3 focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/20">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full bg-transparent py-2.5 text-foreground placeholder-muted-foreground focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full cursor-pointer inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 shadow-sm ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <span>{loading ? "Resetting..." : "Reset Password"}</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
