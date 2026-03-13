import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, User, ArrowRight, UserCircle } from "lucide-react";
import Toast from "../ui/Toast";
import useAuth from "../../hooks/useAuth";

export default function SignupForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { signup } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signup(name, email, password);

    if (result.success) {
      setToastMessage(result.message || "Account created successfully!");
      setShowToast(true);
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <>
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
          duration={5000}
        />
      )}

      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 md:p-8 shadow-xl shadow-black/5">
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg">
          <UserCircle className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-accent">
            Join NAA World as a <span className="font-semibold">Reader</span>
          </span>
        </div>

        <h3 className="font-display text-xl font-semibold text-foreground">
          Sign up
        </h3>

        <p className="text-sm text-muted-foreground mt-1">
          Create your account to discover novels, receive updates from the
          author, and be part of our community.
        </p>
        {error && (
          <div className="mt-4 text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-sm text-foreground">Name</span>
            <div className="mt-1.5 flex items-center gap-2 bg-background border border-border rounded-lg px-3 focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/20">
              <User className="w-4 h-4 text-muted-foreground" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-transparent py-2.5 text-foreground placeholder-muted-foreground focus:outline-none"
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm text-foreground">Email</span>
            <div className="mt-1.5 flex items-center gap-2 bg-background border border-border rounded-lg px-3 focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/20">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent py-2.5 text-foreground placeholder-muted-foreground focus:outline-none"
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm text-foreground">Password</span>
            <div className="mt-1.5 flex items-center gap-2 bg-background border border-border rounded-lg px-3 focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/20">
              <User className="w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password123"
                className="w-full bg-transparent py-2.5 text-foreground placeholder-muted-foreground focus:outline-none"
                required
                minLength={6}
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 shadow-sm disabled:opacity-60"
          >
            <span>{loading ? "Creating..." : "Create account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </>
  );
}
