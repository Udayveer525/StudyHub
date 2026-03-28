// src/components/NotificationBell.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Bell, MessageCircle, CheckCircle, X } from "lucide-react";
import { API_BASE_URL } from "../config/api";

const POLL_INTERVAL = 60 * 1000; // check every 60 seconds
const STORAGE_KEY   = "sh_notif_last_checked";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open,          setOpen]          = useState(false);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const ref = useRef(null);

  // Load & persist "last checked" time in localStorage
  const getLastChecked = () => localStorage.getItem(STORAGE_KEY) || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const markAllRead   = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setUnreadCount(0);
  };

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const since = getLastChecked();
      const res   = await fetch(`${API_BASE_URL}/api/notifications?since=${encodeURIComponent(since)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.count || 0);
    } catch {
      // Silent — notifications are non-critical
    }
  }, []);

  // Poll on mount and every POLL_INTERVAL
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    setOpen(v => !v);
    if (!open) markAllRead(); // mark as read when opening
  };

  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 1)  return "just now";
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand-deep"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-bold text-brand-deep">Notifications</h3>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="h-8 w-8 text-gray-200 mb-2" />
                <p className="text-sm font-medium text-gray-400">All caught up!</p>
                <p className="text-xs text-gray-300 mt-1">No new activity in the last 24h</p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <Link
                  key={`${n.type}-${n.answer_id}-${i}`}
                  to={`/questions/${n.question_id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 border-b border-gray-50 px-4 py-3 transition-colors hover:bg-gray-50 last:border-0"
                >
                  {/* Icon */}
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    n.type === "new_answer"
                      ? "bg-brand-accent/10 text-brand-accent"
                      : "bg-emerald-100 text-emerald-600"
                  }`}>
                    {n.type === "new_answer"
                      ? <MessageCircle className="h-3.5 w-3.5" />
                      : <CheckCircle   className="h-3.5 w-3.5" />
                    }
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-snug">
                      {n.type === "new_answer"
                        ? <><strong className="text-brand-deep">{n.answerer_name}</strong> answered your question</>
                        : <>Your answer was <strong className="text-emerald-600">accepted</strong></>
                      }
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400 truncate">{n.question_title}</p>
                    <p className="mt-0.5 text-[10px] text-gray-300">{formatTime(n.created_at)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}