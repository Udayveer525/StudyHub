// src/pages/admin/AddToLibraryModal.jsx
import React, { useEffect, useState } from "react";
import { X, BookOpen, Loader2, ExternalLink } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

const RESOURCE_TYPES = ["PYQ", "NOTES", "VIDEO", "EBOOK", "LINK"];

function SelectField({ label, value, onChange, disabled, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-gray-500">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 outline-none transition-colors focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {children}
      </select>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-gray-500">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 outline-none transition-colors focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/10"
      />
    </div>
  );
}

export default function AddToLibraryModal({ submission, onClose, onSuccess }) {
  // Form state
  const [title, setTitle] = useState(submission?.message?.slice(0, 80) ?? "");
  const [url, setUrl] = useState(
    submission?.attachment_path
      ? `${API_BASE_URL}/${submission.attachment_path}`
      : ""
  );
  const [resourceType, setResourceType] = useState("NOTES");
  const [year, setYear] = useState("");

  // Cascading selects
  const [institutions, setInstitutions] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [institutionId, setInstitutionId] = useState("");
  const [degreeId, setDegreeId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [adminNotes, setAdminNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load institutions & degrees on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    Promise.all([
      fetch(`${API_BASE_URL}/api/institutions`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/degrees`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([inst, deg]) => {
      setInstitutions(inst);
      setDegrees(deg);
    }).catch(() => {});
  }, []);

  // Load semesters when degree changes
  useEffect(() => {
    setSemesterId("");
    setSubjectId("");
    setSemesters([]);
    setSubjects([]);
    if (!degreeId) return;
    const token = localStorage.getItem("token");
    fetch(`${API_BASE_URL}/api/semesters?degreeId=${degreeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setSemesters)
      .catch(() => {});
  }, [degreeId]);

  // Load subjects when semester changes
  useEffect(() => {
    setSubjectId("");
    setSubjects([]);
    if (!semesterId) return;
    const token = localStorage.getItem("token");
    fetch(`${API_BASE_URL}/api/subjects?semesterId=${semesterId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setSubjects)
      .catch(() => {});
  }, [semesterId]);

  const handleSubmit = async () => {
    if (!title.trim()) return setError("Title is required");
    if (!url.trim()) return setError("URL is required");
    if (!subjectId) return setError("Please select a subject");
    if (!resourceType) return setError("Resource type is required");

    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/admin/submissions/${submission.id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            url: url.trim(),
            subjectId,
            resourceType,
            year: year || null,
            admin_notes: adminNotes.trim() || null,
          }),
        }
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to approve");
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/20">
              <BookOpen className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Add to Library</h2>
              <p className="text-[11px] text-gray-500">
                From: {submission.name} · {submission.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/10 hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[75vh]">
          {/* Submission Context */}
          <div className="border-b border-white/8 bg-white/2 px-6 py-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-2">
              Original Submission
            </p>
            <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
              {submission.message}
            </p>
            {submission.attachment_path && (
              <a
                href={`${API_BASE_URL}/${submission.attachment_path}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-brand-accent hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                View Attachment
              </a>
            )}
          </div>

          {/* Form */}
          <div className="space-y-5 p-6">
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Resource Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <InputField
                  label="Resource Title *"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. DBMS Notes Semester 5"
                />
              </div>
              <div className="col-span-2">
                <InputField
                  label="URL / Link *"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <SelectField
                label="Resource Type *"
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </SelectField>
              <InputField
                label="Year (optional)"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2023"
              />
            </div>

            {/* Course Mapping */}
            <div>
              <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-gray-600">
                Course Mapping *
              </p>
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Institution"
                  value={institutionId}
                  onChange={(e) => setInstitutionId(e.target.value)}
                >
                  <option value="">Select University</option>
                  {institutions.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Degree"
                  value={degreeId}
                  onChange={(e) => setDegreeId(e.target.value)}
                  disabled={!institutionId}
                >
                  <option value="">Select Degree</option>
                  {degrees.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Semester"
                  value={semesterId}
                  onChange={(e) => setSemesterId(e.target.value)}
                  disabled={!degreeId}
                >
                  <option value="">Select Semester</option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>
                      Semester {s.number}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Subject *"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  disabled={!semesterId}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </SelectField>
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-gray-500">
                Admin Notes (optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes about this submission..."
                rows={2}
                className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 outline-none transition-colors focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/10 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-white/8 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:border-white/20 hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}
            {submitting ? "Adding..." : "Add to Library"}
          </button>
        </div>
      </div>
    </div>
  );
}