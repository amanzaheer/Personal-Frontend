import React, { useState } from "react";
import { X, Mail, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";

export default function ForgetPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { recoverPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !email.trim()) {
        setError("Please enter your email address");
        setLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      const result = await recoverPassword(email);

      if (result.success) {
        setSuccess(true);
        toast.success("Password recovery email sent! Please check your inbox.");
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to send recovery email. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h3 className="text-xl font-semibold text-foreground">
            Forgot Password
          </h3>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Check your email
                </h4>
                <p className="text-sm text-muted-foreground">
                  We've sent a password recovery link to{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Please check your inbox and follow the instructions to reset
                  your password.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
              {error && (
                <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-md px-3 py-2">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-sm text-foreground">Email address</span>
                  <div className="mt-1.5 flex items-center gap-2 bg-background border border-border rounded-lg px-3 focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/20">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full bg-transparent py-2.5 text-foreground placeholder-muted-foreground focus:outline-none"
                      required
                      autoFocus
                    />
                  </div>
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full cursor-pointer inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 shadow-sm ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <span>{loading ? "Sending..." : "Send recovery link"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
