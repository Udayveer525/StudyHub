// src/components/ReportButton.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Flag, Loader2, CheckCircle, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

const REASONS = [
  "Incorrect information",
  "Spam or irrelevant",
  "Offensive content",
  "Copyright violation",
  "Other",
];

// Rendered into document.body via portal — escapes all overflow:hidden parents
function ReportDropdown({ anchor, onClose, targetType, targetId }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  // Position the dropdown relative to the anchor button
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchor) return;

    const place = () => {
      const rect = anchor.getBoundingClientRect();
      const dropW = 220;
      const dropH = 240; // approximate
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;

      // Default: below and right-aligned to anchor
      let top = rect.bottom + window.scrollY + 6;
      let left = rect.right + window.scrollX - dropW;

      // Flip up if not enough space below
      if (rect.bottom + dropH > viewportH) {
        top = rect.top + window.scrollY - dropH - 6;
      }

      // Clamp to viewport horizontally
      if (left < 8) left = 8;
      if (left + dropW > viewportW - 8) left = viewportW - dropW - 8;

      setPos({ top, left });
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchor]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        anchor &&
        !anchor.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [anchor, onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleReport = async (reason) => {
    if (!user) {
      alert("Please log in to report content.");
      onClose();
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
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to report");
      setSubmitted(true);
      setTimeout(onClose, 1600);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        width: 220,
        zIndex: 9999,
      }}
      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
        <div>
          <p className="text-xs font-bold text-gray-700">Report Content</p>
          <p className="text-[10px] text-gray-400">Select a reason</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      {submitted ? (
        <div className="flex flex-col items-center gap-2 px-3 py-5">
          <CheckCircle className="h-6 w-6 text-emerald-500" />
          <p className="text-xs font-semibold text-emerald-600">
            Report submitted. Thanks!
          </p>
        </div>
      ) : (
        <div className="py-1">
          {REASONS.map((reason) => (
            <button
              key={reason}
              disabled={loading}
              onClick={() => handleReport(reason)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-3 w-3 shrink-0 animate-spin text-gray-400" />
              ) : (
                <Flag className="h-3 w-3 shrink-0 text-gray-300" />
              )}
              {reason}
            </button>
          ))}
          {error && (
            <p className="border-t border-gray-100 px-3 py-2 text-[10px] text-red-500">
              {error}
            </p>
          )}
        </div>
      )}
    </div>,
    document.body,
  );
}

export default function ReportButton({ targetType, targetId, className = "" }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        title="Report this content"
        className="flex items-center justify-center rounded-lg p-1.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500"
      >
        <Flag className="h-3.5 w-3.5" />
      </button>

      {open && (
        <ReportDropdown
          anchor={buttonRef.current}
          onClose={close}
          targetType={targetType}
          targetId={targetId}
        />
      )}
    </div>
  );
}
