import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, ArrowRight, Eye, EyeOff, Mail } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import ForgetPasswordModal from "./ForgetPasswordModal";

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) return false;
    return true;
  } catch {
    return false;
  }
};

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgetPasswordModal, setShowForgetPasswordModal] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    if (token && !isTokenValid(token)) {
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("menu_permissions");
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
      toast.error(result.error);
    }

    setLoading(false);
  };

  return (
    <>
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 md:p-8 shadow-xl shadow-black/5">
        <h3 className="font-display text-xl font-semibold text-foreground">
          Sign in
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Use your email and password to access your account
        </p>
        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-sm text-foreground">Email</span>
            <div className="mt-1.5 flex items-center gap-2 bg-background border border-border rounded-lg px-3 focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/20">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-transparent py-2.5 text-foreground placeholder-muted-foreground focus:outline-none"
                required
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm text-foreground">Password</span>
            <div className="mt-1.5 flex items-center gap-2 bg-background border border-border rounded-lg px-3 focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/20">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent py-2.5 text-foreground placeholder-muted-foreground focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </label>
          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 select-none">
              <input
                type="checkbox"
                className="rounded border-border text-accent focus:ring-accent bg-background"
              />
              <span className="text-muted-foreground">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setShowForgetPasswordModal(true)}
              className="text-accent hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full cursor-pointer inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 shadow-sm ${
              loading ? "opacity-50" : ""
            }`}
          >
            <span>{loading ? "Signing in..." : "Sign in"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-sm text-muted-foreground">
          No account?{" "}
          <Link to="/signup" className="text-accent hover:underline">
            Create one
          </Link>
        </div>
      </div>
      <ForgetPasswordModal
        isOpen={showForgetPasswordModal}
        onClose={() => setShowForgetPasswordModal(false)}
      />
    </>
  );
}
