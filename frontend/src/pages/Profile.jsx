// src/pages/Profile.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Shield,
  HelpCircle,
  MessageCircle,
  Bookmark,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Save,
  X,
  Building2,
  GraduationCap,
  CalendarDays,
  Phone,
  FileText,
  Award,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import TitleRoadmap from "../components/TitleRoadmap";

// ─── Shared input style ───────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-brand-deep placeholder:text-gray-400 focus:border-brand-accent focus:bg-white focus:ring-4 focus:ring-brand-accent/10 outline-none transition-all";

// ─── Avatar (initials) ────────────────────────────────────────────────────────
function Avatar({ name, size = "lg" }) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const sizeMap = {
    lg: "h-20 w-20 text-2xl",
    md: "h-12 w-12 text-base",
    sm: "h-8  w-8  text-xs",
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-brand-deep font-extrabold text-white ring-4 ring-white shadow-lg ${sizeMap[size]}`}
    >
      {initials}
    </div>
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────
function StatTile({ icon: Icon, label, value, color }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 bg-surface-base border border-brand-deep/5 p-5 shadow-soft text-center">
      <div
        className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-extrabold text-brand-deep">
        {value ?? "—"}
      </div>
      <div className="mt-1 text-xs font-medium text-gray-500">{label}</div>
    </div>
  );
}

// ─── Profile Edit Form ────────────────────────────────────────────────────────
function EditProfileForm({ user, profile, onSave, onCancel }) {
  const [bio, setBio] = useState(profile?.bio || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [institutionId, setInstitutionId] = useState(
    profile?.institution_id || "",
  );
  const [degreeId, setDegreeId] = useState(profile?.degree_id || "");
  const [semesterId, setSemesterId] = useState(profile?.semester_id || "");

  const [institutions, setInstitutions] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    setSemesterId("");
    setSemesters([]);
    if (!degreeId) return;
    fetch(`${API_BASE_URL}/api/semesters?degreeId=${degreeId}`)
      .then((r) => r.json())
      .then(setSemesters)
      .catch(() => {});
  }, [degreeId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/profile/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio,
          phone,
          institution_id: institutionId || null,
          degree_id: degreeId || null,
          semester_id: semesterId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const SelectField = ({
    label,
    icon: Icon,
    value,
    onChange,
    options,
    disabled,
    placeholder,
    renderOption,
  }) => (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
        {label}
      </label>
      <div className={`relative ${disabled ? "opacity-40" : ""}`}>
        {Icon && (
          <Icon className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`${inputCls} appearance-none ${Icon ? "pl-10" : ""} ${disabled ? "cursor-not-allowed" : ""}`}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {renderOption ? renderOption(opt) : opt.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // Completion score
  const filled = [bio, phone, institutionId, degreeId, semesterId].filter(
    Boolean,
  ).length;
  const total = 5;

  return (
    <div className="rounded-xl2 border border-brand-accent/20 bg-white p-6 shadow-soft space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-brand-deep">Edit Profile</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {filled}/{total} fields complete
            <span className="ml-2 inline-block h-1.5 w-20 rounded-full bg-gray-100 align-middle">
              <span
                className="block h-full rounded-full bg-brand-accent transition-all"
                style={{ width: `${(filled / total) * 100}%` }}
              />
            </span>
          </p>
        </div>
        <button
          onClick={onCancel}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Bio */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={200}
          placeholder="Tell your peers a bit about yourself..."
          className={`${inputCls} resize-none`}
        />
        <p className="mt-1 text-right text-[10px] text-gray-400">
          {bio.length}/200
        </p>
      </div>

      {/* Phone */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
          Phone (Indian, 10 digits)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-sm font-bold text-gray-400 select-none">
            +91
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="9876543210"
            maxLength={10}
            className={`${inputCls} pl-12`}
          />
        </div>
      </div>

      {/* Institution, Degree, Semester */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SelectField
          label="University"
          icon={Building2}
          value={institutionId}
          onChange={setInstitutionId}
          options={institutions}
          placeholder="Select"
        />
        <SelectField
          label="Degree"
          icon={GraduationCap}
          value={degreeId}
          onChange={setDegreeId}
          options={degrees}
          disabled={!institutionId}
          placeholder="Select"
        />
        <SelectField
          label="Semester"
          icon={CalendarDays}
          value={semesterId}
          onChange={setSemesterId}
          options={semesters}
          disabled={!degreeId}
          placeholder="Select"
          renderOption={(s) => `Semester ${s.number}`}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          onClick={onCancel}
          className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-2 text-sm font-bold text-white shadow-soft hover:bg-blue-600 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function Profile() {
  const { id } = useParams();
  const { user: me } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(false);

  const isOwner = me && data && me.id === data.user.id;

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/profile/${id}?page=${page}&limit=10`,
      );
      if (!res.ok) throw new Error("User not found");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, page]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  // Reset page when profile id changes
  useEffect(() => {
    setPage(1);
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h2 className="text-xl font-bold text-brand-deep">
            Profile not found
          </h2>
          <Link
            to="/"
            className="mt-4 inline-block text-sm text-brand-accent hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    );

  const { user, stats, achievements, questions } = data;
  const titleColor =
    {
      Helper: "text-emerald-600 bg-emerald-50 border-emerald-200",
      Contributor: "text-blue-600 bg-blue-50 border-blue-200",
      "Knowledge Ally": "text-violet-600 bg-violet-50 border-violet-200",
      "Subject Guide": "text-amber-600 bg-amber-50 border-amber-200",
      "Trusted Mentor": "text-red-600 bg-red-50 border-red-200",
      "Apex Scholar": "text-orange-600 bg-orange-50 border-orange-200",
    }[user.current_title] || "text-gray-600 bg-gray-50 border-gray-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-gradientFrom to-background-gradientTo py-10 font-sans">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ── Hero Card ── */}
        <div className="rounded-xl2 bg-surface-base border border-brand-deep/5 shadow-soft overflow-hidden">
          {/* Banner strip */}
          <div className="h-24 bg-gradient-to-r from-brand-deep via-brand-mid to-brand-accent" />

          <div className="px-6 pb-6">
            {/* Avatar + actions */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <Avatar name={user.name} size="lg" />
              {isOwner && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="h-4 w-4" /> Edit Profile
                </button>
              )}
            </div>

            {/* Name + title */}
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-extrabold text-brand-deep">
                {user.name}
              </h1>
              {user.current_title && (
                <span
                  className={`flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-bold ${titleColor}`}
                >
                  <Shield className="h-3 w-3" />
                  {user.current_title}
                </span>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-sm text-gray-600 leading-relaxed mb-3 max-w-xl">
                {user.bio}
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Member since{" "}
                {new Date(user.created_at).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              {user.institution_name && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {user.institution_name}
                </div>
              )}
              {user.degree_name && (
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {user.degree_name}
                  {user.semester_number &&
                    ` · Semester ${user.semester_number}`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Edit form (owner only, inline) ── */}
        {isOwner && editing && (
          <EditProfileForm
            user={user}
            profile={user}
            onCancel={() => setEditing(false)}
            onSave={() => {
              setEditing(false);
              fetchProfile();
            }}
          />
        )}

        {/* ── Complete profile prompt (owner, not editing, incomplete) ── */}
        {isOwner && !editing && !user.bio && !user.institution_name && (
          <div className="rounded-xl2 border border-brand-accent/20 bg-brand-accent/5 p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-brand-deep">
                Personalize StudyHub for you
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Add your university, course, and bio so peers know who you are.
              </p>
            </div>
            <button
              onClick={() => setEditing(true)}
              className="shrink-0 rounded-xl bg-brand-accent px-4 py-2 text-sm font-bold text-white hover:bg-blue-600 transition-colors"
            >
              Complete Profile
            </button>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile
            icon={HelpCircle}
            label="Questions Asked"
            value={stats.questions_asked}
            color="bg-brand-accent/10 text-brand-accent"
          />
          <StatTile
            icon={MessageCircle}
            label="Answers Given"
            value={stats.answers_given}
            color="bg-emerald-100 text-emerald-600"
          />
          <StatTile
            icon={CheckCircle}
            label="Answers Accepted"
            value={stats.answers_accepted}
            color="bg-violet-100 text-violet-600"
          />
          <StatTile
            icon={Bookmark}
            label="Resources Saved"
            value={stats.resources_saved}
            color="bg-amber-100 text-amber-600"
          />
        </div>

        {/* ── Title Roadmap ── */}
        <TitleRoadmap
          currentLevel={user.current_level ?? 0}
          acceptedCount={stats.answers_accepted}
        />

        {/* ── Achievements ── */}
        {achievements.length > 0 && (
          <div className="rounded-xl2 border border-white/50 bg-surface-base p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-5">
              <Award className="h-5 w-5 text-accent-orange" />
              <h3 className="text-lg font-bold text-brand-deep">
                Achievements
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {achievements.map((ach) => {
                const colors = {
                  1: {
                    bg: "bg-emerald-50",
                    border: "border-emerald-200",
                    text: "text-emerald-700",
                    dot: "#10B981",
                  },
                  2: {
                    bg: "bg-blue-50",
                    border: "border-blue-200",
                    text: "text-blue-700",
                    dot: "#3B82F6",
                  },
                  3: {
                    bg: "bg-violet-50",
                    border: "border-violet-200",
                    text: "text-violet-700",
                    dot: "#8B5CF6",
                  },
                  4: {
                    bg: "bg-amber-50",
                    border: "border-amber-200",
                    text: "text-amber-700",
                    dot: "#F59E0B",
                  },
                  5: {
                    bg: "bg-red-50",
                    border: "border-red-200",
                    text: "text-red-700",
                    dot: "#EF4444",
                  },
                  6: {
                    bg: "bg-orange-50",
                    border: "border-orange-200",
                    text: "text-orange-700",
                    dot: "#F97316",
                  },
                }[ach.level] || {
                  bg: "bg-gray-50",
                  border: "border-gray-200",
                  text: "text-gray-700",
                  dot: "#94A3B8",
                };

                return (
                  <div
                    key={ach.level}
                    className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 ${colors.bg} ${colors.border}`}
                  >
                    <Shield className={`h-4 w-4 ${colors.text}`} />
                    <div>
                      <p className={`text-sm font-bold ${colors.text}`}>
                        {ach.title}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(ach.earned_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Questions ── */}
        <div className="rounded-xl2 border border-white/50 bg-surface-base p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-5">
            <HelpCircle className="h-5 w-5 text-brand-accent" />
            <h3 className="text-lg font-bold text-brand-deep">
              Questions Asked
              <span className="ml-2 text-sm font-medium text-gray-400">
                ({questions.total})
              </span>
            </h3>
          </div>

          {questions.items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
              <p className="text-sm text-gray-500">No questions yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {questions.items.map((q) => (
                <Link
                  key={q.id}
                  to={`/questions/${q.id}`}
                  className="group flex items-center justify-between rounded-xl bg-surface-subtle p-4 transition-all hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-semibold text-brand-deep group-hover:text-brand-accent truncate">
                      {q.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {q.subject_code && (
                        <span className="font-medium">{q.subject_code} · </span>
                      )}
                      {new Date(q.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {q.answer_count}
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        q.status === "resolved"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : q.status === "answered"
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {questions.totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500">
                Page {questions.page} of {questions.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-deep hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button
                  disabled={page >= questions.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-deep hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
