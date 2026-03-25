// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  BookOpen,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";

const MASCOT_IMAGE = "/owl-mascot.png";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || data.message || "Registration failed");
      }

      setRegistered(true);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
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
                Join the <br /> Revolution.
              </h2>
              <p className="mt-4 text-blue-200">
                Share resources, ask questions, and ace your exams together. Be
                part of the fastest growing student community.
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-sm font-medium text-blue-100">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent/20 text-brand-accent">
                    ✓
                  </div>
                  Access 1000+ PYQs
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-blue-100">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent/20 text-brand-accent">
                    ✓
                  </div>
                  Connect with Seniors
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-blue-100">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent/20 text-brand-accent">
                    ✓
                  </div>
                  Free Forever
                </div>
              </div>
            </div>
          </div>

          {/* Mascot Display */}
          <div className="flex justify-center opacity-80 ">
            <div className="relative h-48 w-48">
              <img
                src={MASCOT_IMAGE}
                alt="Mascot"
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

          {registered ? (
            /* ── Success: Check your email ── */
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-brand-deep">Check your inbox!</h1>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-xs">
                We sent a verification link to <strong className="text-brand-deep">{email}</strong>.
                Click it to activate your account.
              </p>
              <p className="mt-4 text-xs text-gray-400">
                Didn't get it? Check your spam folder, or{" "}
                <Link to="/verify-email" className="text-brand-accent font-semibold hover:underline">
                  request a new link
                </Link>.
              </p>
              <Link
                to="/login"
                className="mt-8 text-sm font-bold text-brand-deep hover:text-brand-accent hover:underline"
              >
                ← Back to login
              </Link>
            </div>
          ) : (
            /* ── Registration Form ── */
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-brand-deep">Create Account</h1>
                <p className="mt-2 text-sm text-gray-500">
                  Start your learning journey in seconds.
                </p>
              </div>

              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      placeholder="Your Name"
                      required
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm font-medium text-brand-deep placeholder:text-gray-400 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 outline-none transition-all"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Your email address"
                      required
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm font-medium text-brand-deep placeholder:text-gray-400 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 outline-none transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 8 characters"
                      required
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-11 text-sm font-medium text-brand-deep placeholder:text-gray-400 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 outline-none transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-brand-deep transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat password"
                      required
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-11 text-sm font-medium text-brand-deep placeholder:text-gray-400 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 outline-none transition-all"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-brand-deep transition-colors">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  disabled={loading}
                  className="mt-2 group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-deep py-3.5 text-sm font-bold text-white shadow-lg shadow-gray-900/10 transition-all hover:bg-brand-mid hover:shadow-gray-900/20 disabled:opacity-70 disabled:shadow-none"
                >
                  {loading ? (
                    <span className="animate-pulse">Creating Account...</span>
                  ) : (
                    <>Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-brand-accent hover:underline">
                  Log in instead
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}