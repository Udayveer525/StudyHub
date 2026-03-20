// src/pages/admin/AdminOverview.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  MessageCircle,
  BookOpen,
  HelpCircle,
  Flag,
  Inbox,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <div className="rounded-xl border border-white/8 bg-gray-900 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-gray-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-white">
            {loading ? (
              <span className="inline-block h-8 w-16 animate-pulse rounded-md bg-gray-800" />
            ) : (
              (value ?? "—")
            )}
          </p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${color}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function AlertCard({ label, value, to, loading }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 transition-colors hover:border-amber-500/40 hover:bg-amber-500/10"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-amber-600">
            Needs Attention
          </p>
          <p className="text-sm font-semibold text-amber-300">{label}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold tabular-nums text-amber-400">
          {loading ? "…" : value}
        </span>
        <ArrowRight className="h-4 w-4 text-amber-600 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load stats");
        return r.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform health at a glance
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Alerts */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AlertCard
          label="Pending Reports"
          value={stats?.pendingReports}
          to="/admin/reports"
          loading={loading}
        />
        <AlertCard
          label="Pending Submissions"
          value={stats?.pendingSubmissions}
          to="/admin/submissions"
          loading={loading}
        />
      </div>

      {/* Stats Grid */}
      <div className="mb-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-600">
          Platform Stats
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers}
          loading={loading}
          color="border-blue-500/30 bg-blue-500/10 text-blue-400"
        />
        <StatCard
          icon={HelpCircle}
          label="Questions"
          value={stats?.totalQuestions}
          loading={loading}
          color="border-violet-500/30 bg-violet-500/10 text-violet-400"
        />
        <StatCard
          icon={MessageCircle}
          label="Answers"
          value={stats?.totalAnswers}
          loading={loading}
          color="border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
        />
        <StatCard
          icon={BookOpen}
          label="Resources"
          value={stats?.totalResources}
          loading={loading}
          color="border-orange-500/30 bg-orange-500/10 text-orange-400"
        />
      </div>

      {/* Quick Links */}
      <div className="mt-8">
        <div className="mb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-600">
            Quick Actions
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            to="/admin/reports?status=pending"
            className="group flex items-center justify-between rounded-xl border border-white/8 bg-gray-900 p-4 transition-colors hover:border-white/15 hover:bg-gray-800"
          >
            <div className="flex items-center gap-3">
              <Flag className="h-5 w-5 text-red-400" />
              <span className="text-sm font-medium text-gray-200">
                Review pending reports
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-600 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/admin/submissions?status=pending"
            className="group flex items-center justify-between rounded-xl border border-white/8 bg-gray-900 p-4 transition-colors hover:border-white/15 hover:bg-gray-800"
          >
            <div className="flex items-center gap-3">
              <Inbox className="h-5 w-5 text-brand-accent" />
              <span className="text-sm font-medium text-gray-200">
                Process new submissions
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-600 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}