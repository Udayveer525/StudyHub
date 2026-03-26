// src/pages/admin/AdminSubmissions.jsx
import React, { useCallback, useEffect, useState } from "react";
import {
  Inbox,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BookOpen,
  X,
  Paperclip,
  ExternalLink,
  CheckCircle,
  Clock,
  User,
  Mail,
  Tag,
  Hash,
  Calendar,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

const STATUS_TABS = [
  { key: "pending", label: "Pending" },
  { key: "reviewed", label: "Reviewed" },
  { key: "dismissed", label: "Dismissed" },
  { key: "all", label: "All" },
];

const CATEGORY_COLORS = {
  resource: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  bug: "text-red-400 bg-red-500/10 border-red-500/20",
  query: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

function CategoryBadge({ category }) {
  const labels = { resource: "Resource", bug: "Bug Report", query: "General" };
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize ${CATEGORY_COLORS[category] ?? CATEGORY_COLORS.query}`}
    >
      {labels[category] ?? category}
    </span>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────
function SubmissionDrawer({
  submission,
  onClose,
  onApprove,
  onDismiss,
  actionLoading,
}) {
  if (!submission) return null;
  const isResource = submission.category === "resource";
  const isPending = submission.status === "pending";

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 sticky top-0 bg-gray-900 z-10">
          <div>
            <h3 className="text-sm font-bold text-white">
              Submission #{submission.id}
            </h3>
            <p className="text-[11px] text-gray-500">
              {new Date(submission.created_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-white/10 hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto space-y-5 p-5">
          {/* Submitter */}
          <div className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-3">
              Submitter
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <User className="h-3.5 w-3.5 text-gray-600" /> {submission.name}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Mail className="h-3.5 w-3.5 text-gray-600" />
              <a
                href={`mailto:${submission.email}`}
                className="hover:text-brand-accent hover:underline"
              >
                {submission.email}
              </a>
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-2">
              Category
            </p>
            <CategoryBadge category={submission.category} />
          </div>

          {/* Resource metadata — shown only for resource submissions */}
          {isResource && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 mb-1">
                Resource Details
              </p>

              {submission.resource_type && (
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-3.5 w-3.5 text-gray-600" />
                  <span className="text-gray-400">Type:</span>
                  <span className="font-semibold text-gray-200">
                    {submission.resource_type}
                  </span>
                </div>
              )}
              {submission.subject_name && (
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-3.5 w-3.5 text-gray-600" />
                  <span className="text-gray-400">Subject:</span>
                  <span className="font-semibold text-gray-200">
                    {submission.subject_name}
                  </span>
                </div>
              )}
              {submission.resource_year && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-gray-600" />
                  <span className="text-gray-400">Year:</span>
                  <span className="font-semibold text-gray-200">
                    {submission.resource_year}
                  </span>
                </div>
              )}
              {submission.resource_url && (
                <a
                  href={submission.resource_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-brand-accent hover:underline mt-1"
                >
                  <ExternalLink className="h-3 w-3" /> View Resource URL
                </a>
              )}
            </div>
          )}

          {/* Message */}
          {submission.message && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-2">
                Message
              </p>
              <div className="rounded-xl border border-white/8 bg-white/3 p-4">
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {submission.message}
                </p>
              </div>
            </div>
          )}

          {/* Attachment */}
          {submission.attachment_path && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-2">
                Attachment
              </p>
              <a
                href={`${API_BASE_URL}/${submission.attachment_path}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-brand-accent/20 bg-brand-accent/5 px-3 py-2 text-sm text-brand-accent hover:bg-brand-accent/10 transition-colors"
              >
                <Paperclip className="h-4 w-4" /> View Attachment{" "}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Admin notes if already reviewed */}
          {submission.admin_notes && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-2">
                Admin Notes
              </p>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-sm text-amber-300">
                  {submission.admin_notes}
                </p>
              </div>
            </div>
          )}

          {/* Already reviewed status */}
          {!isPending && (
            <div className="rounded-xl border border-white/8 bg-white/3 p-4 text-center">
              <p className="text-sm text-gray-500 capitalize">
                {submission.status}
                {submission.reviewed_at && (
                  <>
                    {" "}
                    on {new Date(submission.reviewed_at).toLocaleDateString()}
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        {isPending && (
          <div className="sticky bottom-0 border-t border-white/8 bg-gray-900 p-4 flex gap-3">
            <button
              onClick={() => onDismiss(submission.id)}
              disabled={!!actionLoading}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-gray-400 hover:bg-white/10 hover:text-gray-200 disabled:opacity-50 transition-colors"
            >
              <X className="h-4 w-4" /> Dismiss
            </button>

            {isResource && (
              <button
                onClick={() => onApprove(submission.id)}
                disabled={!!actionLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
              >
                {actionLoading === submission.id ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <BookOpen className="h-4 w-4" />
                )}
                Add to Library
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/admin/submissions?status=${status}&page=${page}&limit=15`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Failed to fetch submissions");
      const data = await res.json();
      setSubmissions(data.submissions);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);
  useEffect(() => {
    setPage(1);
  }, [status]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/admin/submissions/${id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        },
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      setSelected(null);
      await fetchSubmissions();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (id) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/admin/submissions/${id}/dismiss`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        },
      );
      if (!res.ok) throw new Error("Failed to dismiss");
      setSelected(null);
      await fetchSubmissions();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (s) =>
    ({
      pending: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      reviewed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      dismissed: "text-gray-400 bg-gray-500/10 border-gray-500/20",
    })[s] || "";

  // Also fetch subject name for the drawer — join it in listSubmissions query
  // (the backend already returns subject_name if we update the query, see note below)

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Submissions</h1>
          <p className="mt-1 text-sm text-gray-500">Contact form inbox</p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-xs font-medium text-gray-400 hover:border-white/20 hover:text-gray-200 transition-colors"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />{" "}
          Refresh
        </button>
      </div>

      {/* Tabs */}
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
        {/* Header row */}
        <div className="grid grid-cols-12 gap-3 border-b border-white/8 bg-white/3 px-4 py-3">
          {["ID", "From", "Category", "Message", "Status", "Actions"].map(
            (h, i) => (
              <div
                key={h}
                className={`text-[10px] font-mono uppercase tracking-widest text-gray-600 ${
                  i === 0
                    ? "col-span-1"
                    : i === 1
                      ? "col-span-2"
                      : i === 2
                        ? "col-span-2"
                        : i === 3
                          ? "col-span-4"
                          : i === 4
                            ? "col-span-1"
                            : "col-span-2"
                }`}
              >
                {h}
              </div>
            ),
          )}
        </div>

        {loading ? (
          <div className="space-y-px">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 w-full animate-pulse bg-gray-800/50"
              />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="h-8 w-8 text-gray-700 mb-3" />
            <p className="text-sm font-medium text-gray-500">
              {status === "pending"
                ? "Inbox is empty."
                : `No ${status} submissions.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="grid grid-cols-12 items-start gap-3 px-4 py-4 transition-colors hover:bg-white/2 cursor-pointer"
                onClick={() => setSelected(sub)}
              >
                <div className="col-span-1">
                  <span className="font-mono text-xs text-gray-600">
                    #{sub.id}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-medium text-gray-300 truncate">
                    {sub.name}
                  </p>
                  <p className="text-[10px] text-gray-600 truncate">
                    {sub.email}
                  </p>
                </div>
                <div className="col-span-2">
                  <CategoryBadge category={sub.category} />
                  {sub.attachment_path && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-600">
                      <Paperclip className="h-3 w-3" /> Attachment
                    </div>
                  )}
                </div>
                <div className="col-span-4">
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {sub.message}
                  </p>
                  <p className="mt-1 text-[10px] text-gray-700">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize ${statusBadge(sub.status)}`}
                  >
                    {sub.status}
                  </span>
                </div>
                <div
                  className="col-span-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {sub.status === "pending" ? (
                    <div className="flex flex-col gap-1.5">
                      {sub.category === "resource" && (
                        <button
                          disabled={actionLoading === sub.id}
                          onClick={() => handleApprove(sub.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
                        >
                          <BookOpen className="h-3 w-3" />
                          {actionLoading === sub.id
                            ? "Adding..."
                            : "Add to Library"}
                        </button>
                      )}
                      <button
                        disabled={actionLoading === sub.id}
                        onClick={() => handleDismiss(sub.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-gray-400 hover:bg-white/10 disabled:opacity-50 transition-colors"
                      >
                        <X className="h-3 w-3" /> Dismiss
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      {sub.status === "reviewed" ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                      <span className="capitalize">{sub.status}</span>
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
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-400 hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-400 hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <SubmissionDrawer
          submission={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onDismiss={handleDismiss}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
}
