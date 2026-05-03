"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  University,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { AuthWindow } from "@/components/auth/AuthWindow";

export default function SignupPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!isAdmin && studentId && !/^\d{8}$/.test(studentId)) {
      setError("Student ID must be exactly 8 digits.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const signUpRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          studentId: isAdmin ? null : studentId.trim() || null,
          isAdmin,
        }),
      });

      if (!signUpRes.ok) {
        const payload = await signUpRes.json().catch(() => null);
        setError(
          payload?.error ?? payload?.message ?? "Failed to create account.",
        );
        return;
      }

      // Sign in after successful sign-up when email confirmation is disabled.
      // If confirmation is required, this will fail with "Email not confirmed".
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      const confirmationRequired =
        !!signInError &&
        /confirm|not confirmed|verification/i.test(signInError.message);

      if (signInError && !confirmationRequired) {
        setError(signInError.message);
        return;
      }

      // If the role should be admin, call the set-role API when signed in.
      if (isAdmin && signInData.session) {
        await fetch("/api/auth/set-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${signInData.session.access_token}`,
          },
          body: JSON.stringify({ role: "admin" }),
        });
      }

      if (signInData.session) {
        // Email confirmation disabled — user is immediately signed in
        router.push("/map");
        router.refresh();
      } else {
        // Email confirmation required
        setSuccess(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full">
        <div className="">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle
                className="w-7 h-7 text-secondary"
                aria-hidden="true"
              />
            </div>
            <h1 className="text-headline-md text-primary">Check your email</h1>
            <p className="text-body-md text-on-surface-variant">
              We sent a confirmation link to{" "}
              <span className="font-semibold text-on-surface">{email}</span>.
              Click it to activate your account.
            </p>
            <Link
              href="/login"
              className="inline-block text-secondary font-semibold text-body-sm hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthWindow
      title="Create account"
      description="Join the campus community."
      tabs={[
        { label: "Sign in", href: "/login", active: false },
        { label: "Create account", href: "/signup", active: true },
      ]}
      footer={
        <p className="text-body-sm text-on-surface-variant text-center w-full">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-secondary font-semibold hover:underline"
          >
            Sign in
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
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="firstName"
              className="text-label-sm text-on-surface font-medium"
            >
              First name
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jane"
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="lastName"
              className="text-label-sm text-on-surface font-medium"
            >
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-label-sm text-on-surface font-medium"
          >
            Email address <span className="text-error">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@pnw.edu"
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition"
          />
        </div>

        {!isAdmin && (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="studentId"
              className="text-label-sm text-on-surface font-medium"
            >
              Student ID{" "}
              <span className="text-on-surface-variant font-normal">
                (8 digits)
              </span>
            </label>
            <input
              id="studentId"
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ""))}
              placeholder="12345678"
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-label-sm text-on-surface font-medium"
          >
            Password <span className="text-error">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
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

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="confirmPassword"
            className="text-label-sm text-on-surface font-medium"
          >
            Confirm password <span className="text-error">*</span>
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            role="checkbox"
            aria-checked={isAdmin}
            tabIndex={0}
            onClick={() => setIsAdmin((v) => !v)}
            onKeyDown={(e) => e.key === " " && setIsAdmin((v) => !v)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              isAdmin
                ? "bg-secondary border-secondary"
                : "border-outline-variant group-hover:border-secondary"
            }`}
          >
            {isAdmin && (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 12 12"
                aria-hidden="true"
              >
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span className="text-body-sm text-on-surface">
            I am a faculty / administrator
          </span>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-secondary text-on-secondary rounded-lg py-2.5 text-label-md font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : null}
          {isLoading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthWindow>
  );
}
