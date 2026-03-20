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
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import AddToLibraryModal from "./AddToLibraryModal";

const STATUS_TABS = [
  { key: "pending", label: "Pending" },
  { key: "reviewed", label: "Reviewed" },
  { key: "dismissed", label: "Dismissed" },
  { key: "all", label: "All" },
];

const CATEGORY_LABELS = {
  "resource-contribution": "Resource",
  "bug-report": "Bug Report",
  "general": "General",
  "other": "Other",
};

const CATEGORY_COLORS = {
  "resource-contribution": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "bug-report": "text-red-400 bg-red-500/10 border-red-500/20",
  "general": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "other": "text-gray-400 bg-gray-500/10 border-gray-500/20",
};

function CategoryBadge({ category }) {
  const label = CATEGORY_LABELS[category] ?? category;
  const color = CATEGORY_COLORS[category] ?? CATEGORY_COLORS["other"];
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${color}`}
    >
      {label}
    </span>
  );
}

// Slide-in detail drawer for a single submission
function SubmissionDrawer({ submission, onClose, onDismiss, onApprove, dismissLoading }) {
  const isResourceContribution =
    submission?.category === "resource-contribution";

  if (!submission) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-gray-900 shadow-2xl overflow-y-auto">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 sticky top-0 bg-gray-900 z-10">
          <div>
            <h3 className="text-sm font-bold text-white">Submission #{submission.id}</h3>
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

        <div className="flex-1 space-y-5 p-5">
          {/* Submitter Info */}
          <div className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-3">
              Submitter
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <User className="h-3.5 w-3.5 text-gray-600" />
              {submission.name}
              {submission.user_name && submission.user_name !== submission.name && (
                <span className="text-xs text-gray-600">
                  (account: {submission.user_name})
                </span>
              )}
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

          {/* Message */}
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
                <Paperclip className="h-4 w-4" />
                View Attachment
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Admin Notes (if already reviewed) */}
          {submission.admin_notes && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-2">
                Admin Notes
              </p>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-sm text-amber-300">{submission.admin_notes}</p>
              </div>
            </div>
          )}

          {/* Status info for already reviewed */}
          {submission.status !== "pending" && (
            <div className="rounded-xl border border-white/8 bg-white/3 p-4 text-center">
              <p className="text-sm text-gray-500">
                This submission has been{" "}
                <span className="font-semibold text-gray-300">
                  {submission.status}
                </span>
                {submission.reviewed_at && (
                  <> on {new Date(submission.reviewed_at).toLocaleDateString()}</>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        {submission.status === "pending" && (
          <div className="sticky bottom-0 border-t border-white/8 bg-gray-900 p-4 flex gap-3">
            <button
              onClick={() => onDismiss(submission.id)}
              disabled={dismissLoading}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-gray-400 transition-colors hover:bg-white/10 hover:text-gray-200 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Dismiss
            </button>
            {isResourceContribution && (
              <button
                onClick={() => onApprove(submission)}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-500"
              >
                <BookOpen className="h-4 w-4" />
                Add to Library
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null); // opens AddToLibraryModal
  const [dismissLoading, setDismissLoading] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/admin/submissions?status=${status}&page=${page}&limit=15`,
        { headers: { Authorization: `Bearer ${token}` } }
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

  const handleDismiss = async (id) => {
    setDismissLoading(true);
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
          body: JSON.stringify({ admin_notes: "" }),
        }
      );
      if (!res.ok) throw new Error("Failed to dismiss");
      setSelectedSubmission(null);
      await fetchSubmissions();
    } catch (err) {
      setError(err.message);
    } finally {
      setDismissLoading(false);
    }
  };

  const handleApproveSuccess = async () => {
    setApproveTarget(null);
    setSelectedSubmission(null);
    await fetchSubmissions();
  };

  const statusBadge = (s) => {
    const map = {
      pending: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      reviewed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      dismissed: "text-gray-400 bg-gray-500/10 border-gray-500/20",
    };
    return map[s] || map.pending;
  };

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
          <div className="col-span-1 text-[10px] font-mono uppercase tracking-widest text-gray-600">ID</div>
          <div className="col-span-2 text-[10px] font-mono uppercase tracking-widest text-gray-600">From</div>
          <div className="col-span-2 text-[10px] font-mono uppercase tracking-widest text-gray-600">Category</div>
          <div className="col-span-4 text-[10px] font-mono uppercase tracking-widest text-gray-600">Message</div>
          <div className="col-span-1 text-[10px] font-mono uppercase tracking-widest text-gray-600">Status</div>
          <div className="col-span-2 text-[10px] font-mono uppercase tracking-widest text-gray-600">Actions</div>
        </div>

        {loading ? (
          <div className="space-y-px">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 w-full animate-pulse bg-gray-800/50" />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="h-8 w-8 text-gray-700 mb-3" />
            <p className="text-sm font-medium text-gray-500">Inbox is empty</p>
            <p className="text-xs text-gray-700 mt-1">
              {status === "pending" ? "No pending submissions." : `No ${status} submissions.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="grid grid-cols-12 items-start gap-3 px-4 py-4 transition-colors hover:bg-white/2 cursor-pointer"
                onClick={() => setSelectedSubmission(sub)}
              >
                <div className="col-span-1">
                  <span className="font-mono text-xs text-gray-600">#{sub.id}</span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-medium text-gray-300 truncate">{sub.name}</p>
                  <p className="text-[10px] text-gray-600 truncate">{sub.email}</p>
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
                  <p className="text-xs text-gray-400 line-clamp-2">{sub.message}</p>
                  <p className="mt-1 text-[10px] text-gray-700">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="col-span-1">
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize ${statusBadge(sub.status)}`}>
                    {sub.status}
                  </span>
                </div>
                <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                  {sub.status === "pending" ? (
                    <div className="flex flex-col gap-1.5">
                      {sub.category === "resource-contribution" && (
                        <button
                          onClick={() => setApproveTarget(sub)}
                          className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20"
                        >
                          <BookOpen className="h-3 w-3" />
                          Add to Library
                        </button>
                      )}
                      <button
                        onClick={() => handleDismiss(sub.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-gray-400 transition-colors hover:bg-white/10"
                      >
                        <X className="h-3 w-3" />
                        Dismiss
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

      {/* Detail Drawer */}
      {selectedSubmission && (
        <SubmissionDrawer
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onDismiss={handleDismiss}
          onApprove={(sub) => setApproveTarget(sub)}
          dismissLoading={dismissLoading}
        />
      )}

      {/* Add to Library Modal */}
      {approveTarget && (
        <AddToLibraryModal
          submission={approveTarget}
          onClose={() => setApproveTarget(null)}
          onSuccess={handleApproveSuccess}
        />
      )}
    </div>
  );
}