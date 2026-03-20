// src/components/ReportButton.jsx
import React, { useState, useRef, useEffect } from "react";
import { Flag, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

const REASONS = [
  "Incorrect information",
  "Spam or irrelevant",
  "Offensive content",
  "Copyright violation",
  "Other",
];

export default function ReportButton({ targetType, targetId, className = "" }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleReport = async (reason) => {
    if (!user) {
      alert("Please log in to report content.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ target_type: targetType, target_id: targetId, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to report");
      setSubmitted(true);
      setTimeout(() => { setOpen(false); setSubmitted(false); }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        title="Report this content"
        className="flex items-center justify-center rounded-lg p-1.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500"
      >
        <Flag className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-gray-100 px-3 py-2.5">
            <p className="text-xs font-bold text-gray-700">Report Content</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Select a reason</p>
          </div>

          {submitted ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs font-semibold text-emerald-600">✓ Report submitted</p>
            </div>
          ) : (
            <div className="py-1">
              {REASONS.map((reason) => (
                <button
                  key={reason}
                  disabled={loading}
                  onClick={() => handleReport(reason)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-600 transition-colors hover:bg-gray-50 hover:text-red-600 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  {reason}
                </button>
              ))}
              {error && (
                <p className="px-3 pb-2 text-[10px] text-red-500">{error}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}