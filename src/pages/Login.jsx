import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowLeft } from "lucide-react";
import LoginForm from "../components/auth/LoginForm";

export default function Login() {
  return (
    <div className="min-h-screen bg-background flex auth-page">
      {/* Left panel - books image (desktop only) */}
      <div className="hidden lg:flex w-1/2 relative border-r border-border items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Books and writing"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="relative z-10 text-center px-12 text-white">
          <p className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Where Stories Come to Life
          </p>
          <p className="text-white/90 text-lg font-light max-w-sm mx-auto">
            Novels, inspiration, and a world built on words.
          </p>
        </div>
      </div>

      {/* Right panel - form with vector background */}
      <div
        className="flex-1 flex flex-col min-h-screen lg:min-h-0 relative bg-cover bg-no-repeat bg-right"
        style={{ backgroundImage: "url(/img/Vector.png)" }}
      >
        {/* Top brand bar - always visible, compact on mobile */}
        <div className="shrink-0 flex items-center justify-between gap-3 p-4 md:p-6 lg:p-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-accent text-accent-foreground flex items-center justify-center brand-glow shrink-0">
              <BookOpen className="w-5 h-5 md:w-7 md:h-7" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-display text-2xl md:text-4xl font-semibold text-foreground tracking-tight">
                NAA World
              </p>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Writer • Publisher • Novels
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>

        {/* Form area - centered, with subtle gradient bg on mobile */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8 pt-0 md:pt-0 lg:pt-0 bg-gradient-to-b from-muted/30 to-background lg:bg-transparent">
          <div className="w-full max-w-xl">
            <div className="mb-6">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                Welcome back
              </h2>
              <p className="mt-1.5 text-muted-foreground">
                Sign in to access your account and continue your journey.
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
