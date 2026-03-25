// src/pages/VerifyEmail.jsx
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { API_BASE_URL } from "../config/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    fetch(`${API_BASE_URL}/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Verification failed");
        setStatus("success");
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message);
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light p-4 font-sans">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl text-center">
        
        {/* Loading */}
        {status === "loading" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent/10">
              <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
            </div>
            <h1 className="text-xl font-bold text-brand-deep">Verifying your email...</h1>
            <p className="mt-2 text-sm text-gray-500">Just a moment.</p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-brand-deep">Email Verified!</h1>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Your account is now active. Welcome to StudyHub!
            </p>
            <Link
              to="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-accent px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-600 hover:shadow-blue-500/40"
            >
              Sign In to Your Account
            </Link>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-brand-deep">Link Invalid</h1>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">{message}</p>
            <p className="mt-2 text-sm text-gray-400">
              The link may have expired or already been used.
            </p>
            <ResendForm />
          </>
        )}

      </div>
    </div>
  );
}

// Inline resend form shown on error
function ResendForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setSent(true); // Still show success to prevent enumeration
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
        <p className="text-sm font-semibold text-emerald-600">
          ✓ If that email is registered and unverified, a new link is on its way.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleResend} className="mt-8 space-y-3">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
        Resend verification email
      </p>
      <div className="relative">
        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm font-medium text-brand-deep outline-none focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 transition-all"
        />
      </div>
      <button
        disabled={loading}
        className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60"
      >
        {loading ? "Sending..." : "Resend Link"}
      </button>
    </form>
  );
}