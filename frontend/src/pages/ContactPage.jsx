// src/pages/ContactPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Bug,
  FileUp,
  HelpCircle,
  Paperclip,
  Send,
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  Building2,
  GraduationCap,
  CalendarDays,
  BookOpen,
  Link as LinkIcon,
  FileText,
  Video,
  FileQuestion,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

const CATEGORIES = [
  {
    id: "resource",
    label: "Share a Resource",
    icon: FileUp,
    desc: "Upload notes, PYQs, or links",
  },
  {
    id: "bug",
    label: "Report a Bug",
    icon: Bug,
    desc: "Found a glitch? Let us know",
  },
  {
    id: "query",
    label: "General Query",
    icon: HelpCircle,
    desc: "Questions about StudyHub",
  },
];

const RESOURCE_TYPES = [
  { key: "PYQ", label: "PYQ", icon: FileQuestion },
  { key: "NOTES", label: "Notes", icon: FileText },
  { key: "VIDEO", label: "Video", icon: Video },
  { key: "EBOOK", label: "E-Book", icon: BookOpen },
  { key: "LINK", label: "Link", icon: LinkIcon },
];

// ─── Shared input styles ──────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium transition-colors focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-accent/10";
const labelCls = "text-xs font-bold uppercase tracking-wide text-gray-500";

// ─── Cascading Academic Selector (self-contained) ─────────────────────────────
function AcademicFields({ value, onChange }) {
  const [institutions, setInstitutions] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Load institutions + degrees on mount
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/institutions`).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/degrees`).then((r) => r.json()),
    ])
      .then(([inst, deg]) => {
        setInstitutions(inst);
        setDegrees(deg);
      })
      .catch(() => {});
  }, []);

  // Load semesters when degree changes
  useEffect(() => {
    onChange({ ...value, semesterId: "", subjectId: "" });
    setSemesters([]);
    setSubjects([]);
    if (!value.degreeId) return;
    fetch(`${API_BASE_URL}/api/semesters?degreeId=${value.degreeId}`)
      .then((r) => r.json())
      .then(setSemesters)
      .catch(() => {});
  }, [value.degreeId]);

  // Load subjects when semester changes
  useEffect(() => {
    onChange({ ...value, subjectId: "" });
    setSubjects([]);
    if (!value.semesterId) return;
    fetch(`${API_BASE_URL}/api/subjects?semesterId=${value.semesterId}`)
      .then((r) => r.json())
      .then(setSubjects)
      .catch(() => {});
  }, [value.semesterId]);

  const Select = ({
    label,
    fieldKey,
    options,
    disabled,
    placeholder,
    renderOption,
  }) => (
    <div className={`transition-opacity ${disabled ? "opacity-40" : ""}`}>
      <label className={`mb-1.5 block ${labelCls}`}>{label}</label>
      <div className="relative">
        <select
          disabled={disabled}
          value={value[fieldKey] || ""}
          onChange={(e) => onChange({ ...value, [fieldKey]: e.target.value })}
          className={`${inputCls} appearance-none pr-9 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {renderOption ? renderOption(opt) : opt.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <p className={`mb-3 ${labelCls}`}>
          Course Mapping <span className="text-red-400">*</span>
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="University"
            fieldKey="institutionId"
            options={institutions}
            placeholder="Select University"
          />
          <Select
            label="Degree"
            fieldKey="degreeId"
            options={degrees}
            disabled={!value.institutionId}
            placeholder="Select Degree"
          />
          <Select
            label="Semester"
            fieldKey="semesterId"
            options={semesters}
            disabled={!value.degreeId}
            placeholder="Select Semester"
            renderOption={(s) => `Semester ${s.number}`}
          />
          <Select
            label="Subject"
            fieldKey="subjectId"
            options={subjects}
            disabled={!value.semesterId}
            placeholder="Select Subject"
            renderOption={(s) => `${s.code} — ${s.name}`}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ContactPage() {
  const { user } = useAuth();

  const [category, setCategory] = useState("resource");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);

  // Resource-specific state
  const [resourceType, setResourceType] = useState("NOTES");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceYear, setResourceYear] = useState("");
  const [academic, setAcademic] = useState({
    institutionId: "",
    degreeId: "",
    semesterId: "",
    subjectId: "",
  });

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Validation before submit
  function validate() {
    if (category === "resource") {
      if (!academic.subjectId)
        return "Please select a subject for this resource.";
      if (!resourceUrl.trim() && !file)
        return "Please provide a URL or attach a file.";
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setStatus("error");
      setErrorMessage(validationError);
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("category", category);
      formData.append(
        "message",
        message || (category === "resource" ? "Resource submission" : ""),
      );
      if (file) formData.append("attachment", file);

      // Resource-specific fields
      if (category === "resource") {
        formData.append("subject_id", academic.subjectId);
        formData.append("resource_type", resourceType);
        formData.append("resource_url", resourceUrl.trim());
        if (resourceYear) formData.append("resource_year", resourceYear);
      }

      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to send. Please try again.");

      setStatus("success");
      setMessage("");
      setFile(null);
      setResourceUrl("");
      setResourceYear("");
      setAcademic({
        institutionId: "",
        degreeId: "",
        semesterId: "",
        subjectId: "",
      });
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-background-light py-12 font-sans text-brand-deep">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* LEFT: Category picker */}
          <div className="lg:col-span-1">
            <h1 className="text-4xl font-extrabold text-brand-deep mb-4">
              Get in touch
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Share resources, report bugs, or just say hi — we're all ears.
            </p>

            <div className="space-y-3">
              <h3 className={`mb-3 ${labelCls}`}>How can we help?</h3>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      setStatus("idle");
                      setErrorMessage("");
                    }}
                    className={`flex w-full items-start gap-4 rounded-xl p-4 text-left transition-all ${
                      isActive
                        ? "bg-white shadow-md ring-2 ring-brand-accent"
                        : "bg-gray-50 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`rounded-lg p-2.5 ${isActive ? "bg-brand-accent text-white" : "bg-white text-gray-500 shadow-sm"}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4
                        className={`font-bold ${isActive ? "text-brand-deep" : "text-gray-700"}`}
                      >
                        {cat.label}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="h-5 w-5 text-brand-accent" />
                <h4 className="font-bold text-brand-deep">Community First</h4>
              </div>
              <p className="text-sm text-gray-600">
                StudyHub is maintained by students. We review submissions within
                24–48 hours.
              </p>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="lg:col-span-2">
            <div className="rounded-xl2 border border-gray-100 bg-white p-8 shadow-soft md:p-10">
              {status === "success" ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-brand-deep">
                    {category === "resource"
                      ? "Resource Submitted!"
                      : "Message Received!"}
                  </h2>
                  <p className="mt-3 max-w-md text-gray-600">
                    {category === "resource"
                      ? "Thanks for contributing! Our team will review and add it to the library shortly."
                      : "Your message has been logged. We'll get back to you within 24–48 hours."}
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-8 rounded-xl border border-gray-200 px-6 py-3 font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Submit another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {status === "error" && (
                    <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
                      {errorMessage}
                    </div>
                  )}

                  {/* Name + Email — always shown */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className={labelCls}>Your Name</label>
                      <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputCls}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>Email Address</label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputCls}
                        placeholder="john@university.edu"
                      />
                    </div>
                  </div>

                  {/* ── RESOURCE CATEGORY ── */}
                  {category === "resource" && (
                    <>
                      {/* Academic selector */}
                      <AcademicFields value={academic} onChange={setAcademic} />

                      {/* Resource type pills */}
                      <div>
                        <label className={`mb-2 block ${labelCls}`}>
                          Resource Type <span className="text-red-400">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {RESOURCE_TYPES.map(({ key, label, icon: Icon }) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setResourceType(key)}
                              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all ${
                                resourceType === key
                                  ? "border-brand-accent bg-brand-accent text-white shadow-md"
                                  : "border-gray-200 bg-white text-gray-600 hover:border-brand-accent/50"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* URL */}
                      <div className="space-y-1.5">
                        <label className={labelCls}>Resource URL</label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                          <input
                            type="url"
                            value={resourceUrl}
                            onChange={(e) => setResourceUrl(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className={`${inputCls} pl-10`}
                          />
                        </div>
                        <p className="text-xs text-gray-400">
                          Paste a Google Drive, YouTube, or direct download
                          link.
                        </p>
                      </div>

                      {/* Year (optional) */}
                      <div className="space-y-1.5">
                        <label className={labelCls}>
                          Year{" "}
                          <span className="text-gray-400 normal-case font-normal">
                            (optional — for PYQs)
                          </span>
                        </label>
                        <input
                          type="number"
                          value={resourceYear}
                          onChange={(e) => setResourceYear(e.target.value)}
                          placeholder="e.g. 2023"
                          min="2000"
                          max="2099"
                          className={`${inputCls} w-40`}
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-1.5">
                        <label className={labelCls}>
                          Description{" "}
                          <span className="text-gray-400 normal-case font-normal">
                            (optional)
                          </span>
                        </label>
                        <textarea
                          rows={3}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Any context about this resource — topics covered, quality, etc."
                          className={`${inputCls} resize-y`}
                        />
                      </div>

                      {/* File attachment */}
                      <div className="space-y-1.5">
                        <label className={labelCls}>
                          Attach File{" "}
                          <span className="text-gray-400 normal-case font-normal">
                            (optional — if no URL)
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          />
                          <div
                            className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-7 text-sm font-bold transition-colors ${
                              file
                                ? "border-brand-accent bg-brand-accent/5 text-brand-accent"
                                : "border-gray-300 bg-gray-50 text-gray-500 hover:border-brand-accent hover:bg-white"
                            }`}
                          >
                            {file ? (
                              <>
                                <CheckCircle className="h-5 w-5" />
                                {file.name}
                              </>
                            ) : (
                              <>
                                <Paperclip className="h-5 w-5" />
                                Drag and drop or click to upload
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">
                          Max 10MB · PDF, DOCX, Images
                        </p>
                      </div>
                    </>
                  )}

                  {/* ── BUG / QUERY CATEGORY ── */}
                  {category !== "resource" && (
                    <>
                      <div className="space-y-1.5">
                        <label className={labelCls}>
                          {category === "bug" ? "Bug Details" : "Your Message"}
                        </label>
                        <textarea
                          required
                          rows={6}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className={`${inputCls} resize-y`}
                          placeholder={
                            category === "bug"
                              ? "Describe the bug and how to reproduce it..."
                              : "How can we help you today?"
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={labelCls}>
                          Attachment{" "}
                          <span className="text-gray-400 normal-case font-normal">
                            (optional)
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          />
                          <div
                            className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-7 text-sm font-bold transition-colors ${
                              file
                                ? "border-brand-accent bg-brand-accent/5 text-brand-accent"
                                : "border-gray-300 bg-gray-50 text-gray-500 hover:border-brand-accent hover:bg-white"
                            }`}
                          >
                            {file ? (
                              <>
                                <CheckCircle className="h-5 w-5" />
                                {file.name}
                              </>
                            ) : (
                              <>
                                <Paperclip className="h-5 w-5" />
                                Drag and drop or click to upload
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">
                          Max 10MB · PDF, DOCX, Images
                        </p>
                      </div>
                    </>
                  )}

                  {/* Submit */}
                  <div className="border-t border-gray-100 pt-5">
                    <button
                      disabled={status === "loading"}
                      className="group flex items-center gap-2 rounded-xl bg-brand-deep px-10 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-brand-mid hover:shadow-xl disabled:opacity-70 w-full justify-center sm:w-auto"
                    >
                      {status === "loading"
                        ? "Sending..."
                        : category === "resource"
                          ? "Submit Resource"
                          : "Submit"}
                      {status !== "loading" && (
                        <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
