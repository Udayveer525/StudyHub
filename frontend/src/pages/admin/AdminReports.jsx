// src/pages/admin/AdminReports.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Flag,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  User,
  RefreshCw,
  CheckCircle,
  Clock,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

const STATUS_TABS = [
  { key: "pending", label: "Pending" },
  { key: "resolved", label: "Resolved" },
  { key: "dismissed", label: "Dismissed" },
  { key: "all", label: "All" },
];

const TYPE_COLORS = {
  question: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  answer: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  resource: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

function ContentPreview({ report }) {
  const { target_type, contentPreview } = report;

  if (!contentPreview) {
    return (
      <span className="text-xs text-gray-600 italic">
        [Content deleted or unavailable]
      </span>
    );
  }

  if (target_type === "question") {
    return (
      <div>
        <p className="text-sm font-medium text-gray-200 line-clamp-1">
          {contentPreview.title}
        </p>
        {contentPreview.description && (
          <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
            {contentPreview.description}
          </p>
        )}
        <p className="mt-1 text-[11px] text-gray-600">
          by {contentPreview.author_name}
        </p>
      </div>
    );
  }

  if (target_type === "answer") {
    return (
      <div>
        <p className="text-sm text-gray-300 line-clamp-2">
          {contentPreview.content}
        </p>
        <p className="mt-1 text-[11px] text-gray-600">
          by {contentPreview.author_name} · on question #{contentPreview.question_id}
        </p>
      </div>
    );
  }

  if (target_type === "resource") {
    return (
      <div className="flex items-center gap-2">
        <div>
          <p className="text-sm font-medium text-gray-200">
            {contentPreview.title}
          </p>
          <p className="mt-0.5 text-[11px] text-gray-600">
            {contentPreview.type} · {contentPreview.subject_name}
          </p>
        </div>
        {contentPreview.url && (
          <a
            href={contentPreview.url}
            target="_blank"
            rel="noreferrer"
            className="ml-auto shrink-0 text-gray-600 hover:text-gray-300"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    );
  }

  return null;
}

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // report id being actioned
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/admin/reports?status=${status}&page=${page}&limit=15`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      setReports(data.reports);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Reset to page 1 on status change
  useEffect(() => {
    setPage(1);
  }, [status]);

  const handleAction = async (reportId, action) => {
    setActionLoading(reportId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/admin/reports/${reportId}/${action}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Action failed");
      // Re-fetch to get fresh data
      await fetchReports();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (s) => {
    const map = {
      pending: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      resolved: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      dismissed: "text-gray-400 bg-gray-500/10 border-gray-500/20",
    };
    return map[s] || map.pending;
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            User-flagged content requiring review
          </p>
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:border-white/20 hover:text-gray-200"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Status Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-white/8 bg-gray-900 p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatus(tab.key)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              status === tab.key
                ? "bg-white/10 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/8 bg-gray-900">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-3 border-b border-white/8 bg-white/3 px-4 py-3">
          <div className="col-span-1 text-[10px] font-mono uppercase tracking-widest text-gray-600">
            ID
          </div>
          <div className="col-span-2 text-[10px] font-mono uppercase tracking-widest text-gray-600">
            Type
          </div>
          <div className="col-span-4 text-[10px] font-mono uppercase tracking-widest text-gray-600">
            Content
          </div>
          <div className="col-span-2 text-[10px] font-mono uppercase tracking-widest text-gray-600">
            Reason
          </div>
          <div className="col-span-1 text-[10px] font-mono uppercase tracking-widest text-gray-600">
            Status
          </div>
          <div className="col-span-2 text-[10px] font-mono uppercase tracking-widest text-gray-600">
            Actions
          </div>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="space-y-px">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 w-full animate-pulse bg-gray-800/50"
              />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Flag className="h-8 w-8 text-gray-700 mb-3" />
            <p className="text-sm font-medium text-gray-500">No reports found</p>
            <p className="text-xs text-gray-700 mt-1">
              {status === "pending"
                ? "All clear — no pending reports."
                : `No ${status} reports.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {reports.map((report) => (
              <div
                key={report.id}
                className="grid grid-cols-12 items-start gap-3 px-4 py-4 transition-colors hover:bg-white/2"
              >
                {/* ID */}
                <div className="col-span-1">
                  <span className="font-mono text-xs text-gray-600">
                    #{report.id}
                  </span>
                </div>

                {/* Type */}
                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize ${TYPE_COLORS[report.target_type] ?? ""}`}
                  >
                    {report.target_type}
                  </span>
                  <p className="mt-1 text-[10px] text-gray-600">
                    ID: {report.target_id}
                  </p>
                </div>

                {/* Content Preview */}
                <div className="col-span-4">
                  <ContentPreview report={report} />
                </div>

                {/* Reason */}
                <div className="col-span-2">
                  <p className="text-xs text-gray-400">{report.reason}</p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-600">
                    <User className="h-3 w-3" />
                    {report.reporter_name ?? "Anonymous"}
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize ${statusBadge(report.status)}`}
                  >
                    {report.status}
                  </span>
                  <p className="mt-1 text-[10px] text-gray-700">
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="col-span-2">
                  {report.status === "pending" ? (
                    <div className="flex flex-col gap-1.5">
                      <button
                        disabled={actionLoading === report.id}
                        onClick={() => handleAction(report.id, "resolve")}
                        className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove Content
                      </button>
                      <button
                        disabled={actionLoading === report.id}
                        onClick={() => handleAction(report.id, "dismiss")}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-gray-400 transition-colors hover:bg-white/10 disabled:opacity-50"
                      >
                        <X className="h-3 w-3" />
                        Dismiss
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      {report.status === "resolved" ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                      <span className="capitalize">{report.status}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-gray-600">
          {total} total · page {page} of {totalPages || 1}
        </p>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}