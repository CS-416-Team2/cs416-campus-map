"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { AuthWindow } from "@/components/auth/AuthWindow";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/map";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      router.push(next);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthWindow
      title="Welcome back"
      description="Sign in to access your campus dashboard."
      tabs={[
        { label: "Sign in", href: "/login", active: true },
        { label: "Create account", href: "/signup", active: false },
      ]}
      footer={
        <p className="text-body-sm text-on-surface-variant text-center w-full">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-secondary font-semibold hover:underline"
          >
            Create account
          </Link>
        </p>
      }
    >
      {error && (
        <div
          className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-body-sm"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-label-sm text-on-surface font-medium"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-label-sm text-on-surface font-medium"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 pr-10 text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-secondary text-on-secondary rounded-lg py-2.5 text-label-md font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : null}
          {isLoading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthWindow>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center">
          <Loader2
            className="w-6 h-6 animate-spin text-secondary"
            aria-hidden="true"
          />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
