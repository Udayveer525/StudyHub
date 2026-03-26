// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

const MASCOT_IMAGE = "/owl-mascot.png";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Show success banner if coming from email verification
  const justVerified = searchParams.get("verified") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // For the inline resend flow
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setUnverifiedEmail(null);
    setResendSent(false);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.code === "EMAIL_NOT_VERIFIED") {
          setUnverifiedEmail(email);
          throw new Error(data.error);
        }
        throw new Error(data.error || "Login failed");
      }

      login(data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!unverifiedEmail || resendLoading || resendSent) return;
    setResendLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
    } catch {
      // Intentionally silent
    } finally {
      setResendSent(true);
      setResendLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light p-4 font-sans">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* BRAND SIDEBAR */}
        <div className="hidden w-1/2 flex-col justify-between bg-brand-deep p-12 text-white md:flex">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl tracking-wider">
              <div className="h-8 w-8 rounded-lg bg-brand-accent"></div>
              StudyHub
            </div>
            <div className="mt-12">
              <h2 className="text-3xl font-extrabold leading-tight">
                Welcome back, <br /> Scholar!
              </h2>
              <p className="mt-4 text-blue-200">
                Your community of notes, questions, and resources is waiting.
                Jump back in to continue your streak.
              </p>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative h-48 w-48 opacity-80">
              <img
                src={MASCOT_IMAGE}
                alt="StudyHub Mascot"
                className="h-full w-full object-contain"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          </div>
          <div className="text-xs text-blue-300">
            © 2026 StudyHub. All rights reserved.
          </div>
        </div>

        {/* FORM SIDE */}
        <div className="flex w-full flex-col justify-center p-8 md:w-1/2 md:p-12">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-brand-deep">
              Sign in to Account
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Enter your email and password below
            </p>
          </div>

          {/* ── Email just verified banner ── */}
          {justVerified && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
              <div>
                <p className="text-sm font-bold text-emerald-700">
                  Email verified!
                </p>
                <p className="text-xs text-emerald-600">
                  Your account is active. Sign in below.
                </p>
              </div>
            </div>
          )}

          {/* ── Error banner ── */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>

              {/* Inline resend — only shown for unverified accounts */}
              {unverifiedEmail && (
                <div className="mt-3 border-t border-red-100 pt-3 pl-8">
                  {resendSent ? (
                    <p className="text-xs font-semibold text-emerald-600">
                      ✓ Verification email sent — check your inbox.
                    </p>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={resendLoading}
                      className="text-xs font-bold text-brand-accent hover:underline disabled:opacity-60"
                    >
                      {resendLoading
                        ? "Sending..."
                        : "Resend verification email →"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm font-medium text-brand-deep placeholder:text-gray-400 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 outline-none transition-all"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Password
                </label>
                <Link
                  to="/forgot"
                  className="text-xs font-semibold text-brand-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-11 text-sm font-medium text-brand-deep placeholder:text-gray-400 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-brand-deep transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent"
                checked={remember}
                onChange={() => setRemember(!remember)}
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-600"
              >
                Keep me logged in
              </label>
            </div>

            <button
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-600 hover:shadow-blue-500/50 disabled:opacity-70 disabled:shadow-none"
            >
              {loading ? (
                <span className="animate-pulse">Signing in...</span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-bold text-brand-deep hover:text-brand-accent hover:underline"
            >
              Create free account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
