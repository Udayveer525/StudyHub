// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  MessageCircle,
  Award,
  Bookmark,
  ArrowRight,
  Activity,
  HelpCircle,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  Download,
  Shield,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

/**
 * UI COMPONENT: StatCard
 */
function StatCard({ label, value, hint, icon: Icon, colorClass }) {
  return (
    <div className="group relative overflow-hidden rounded-xl2 bg-surface-base p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-brand-deep/5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-gray-500">{label}</div>
          <div className="mt-2 text-3xl font-bold text-brand-deep">{value}</div>
        </div>
        <div className={`rounded-xl p-3 ${colorClass} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${colorClass.replace("bg-", "text-")}`} />
        </div>
      </div>
      {hint && (
        <div className="mt-3 flex items-center text-xs text-gray-400 font-medium">
          {hint}
        </div>
      )}
    </div>
  );
}

/**
 * UI COMPONENT: Section Header
 */
const SectionHeader = ({ title, linkText, linkTo, icon: Icon }) => (
  <div className="flex items-center justify-between mb-4 px-1">
    <h3 className="flex items-center gap-2 text-lg font-bold text-brand-deep">
      {Icon && <Icon className="w-5 h-5 text-brand-accent" />}
      {title}
    </h3>
    {linkTo && (
      <Link
        to={linkTo}
        className="text-sm font-semibold text-brand-mid hover:text-brand-accent transition-colors flex items-center gap-1"
      >
        {linkText} <ArrowRight className="w-4 h-4" />
      </Link>
    )}
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [allQuestions, setAllQuestions] = useState(null);
  const [userQuestions, setUserQuestions] = useState([]);

  // Changed from savedResourcesCount to the actual array
  const [savedResources, setSavedResources] = useState(null);

  const [answersGivenCount, setAnswersGivenCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answersLoading, setAnswersLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const fetchAll = async () => {
      try {
        const qRes = await fetch(
          `${API_BASE_URL}/api/questions?limit=200&offset=0`,
        );
        if (!qRes.ok) throw new Error("Failed to load questions");
        const questions = await qRes.json();
        setAllQuestions(questions || []);
        setUserQuestions(
          (questions || []).filter(
            (q) => Number(q.user_id) === Number(user.id),
          ),
        );
      } catch (err) {
        console.error("dashboard: fetchAll error", err);
        setError("Could not load activity.");
      } finally {
        setLoading(false);
      }
    };

    const fetchSaved = async () => {
      try {
        // Updated Endpoint & Added Authorization Header
        const r = await fetch(
          `${API_BASE_URL}/api/resources/saved/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (!r.ok) {
          setSavedResources([]);
          return;
        }
        const data = await r.json();
        setSavedResources(Array.isArray(data) ? data : []);
      } catch (err) {
        setSavedResources([]);
      }
    };

    fetchAll();
    fetchSaved();
  }, [user]);

  // Answer counting logic remains exactly the same...
  useEffect(() => {
    if (!user || !allQuestions) return;
    setAnswersLoading(true);
    setAnswersGivenCount(0);

    const questionIds = (allQuestions || []).slice(0, 40).map((q) => q.id);

    (async () => {
      try {
        let count = 0;
        for (let id of questionIds) {
          try {
            const r = await fetch(`${API_BASE_URL}/api/questions/${id}`);
            if (!r.ok) continue;
            const q = await r.json();
            if (!q.answers) continue;
            count += q.answers.filter(
              (a) => Number(a.user_id) === Number(user.id),
            ).length;
          } catch (e) {}
        }
        setAnswersGivenCount(count);
      } catch (err) {
        setAnswersGivenCount(null);
      } finally {
        setAnswersLoading(false);
      }
    })();
  }, [user, allQuestions]);

  const recentUserQuestions = useMemo(() => {
    return (userQuestions || []).slice(0, 5).map((q) => ({
      id: q.id,
      title: q.title,
      status: q.status,
      created_at: q.created_at,
      answer_count: q.answer_count ?? 0,
    }));
  }, [userQuestions]);

  const firstName = user?.name?.split(" ")[0] ?? "Student";
  const savedCount = savedResources ? savedResources.length : "—";
  const currentTitle = user?.current_title || null;
  const currentLevel = user?.current_level ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-gradientFrom to-background-gradientTo py-8 font-sans text-brand-deep">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 1. HERO HEADER */}
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-brand-deep">
              Hello, <span className="text-brand-accent">{firstName}</span>
            </h1>
            <p className="mt-2 text-lg text-brand-mid/80">
              Ready to continue your learning journey today?
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/questions"
              className="group flex items-center gap-2 rounded-xl border border-brand-mid/20 bg-white px-5 py-3 text-sm font-semibold text-brand-deep shadow-sm transition-all hover:border-brand-mid/50 hover:shadow-md"
            >
              <HelpCircle className="h-4 w-4 text-brand-accent" />
              Ask Question
            </Link>
            <Link
              to="/resources"
              className="flex items-center gap-2 rounded-xl bg-brand-deep px-5 py-3 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand-mid hover:shadow-lg"
            >
              <BookOpen className="h-4 w-4" />
              Browse Resources
            </Link>
          </div>
        </div>

        {/* 2. STATS GRID */}
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Questions Asked"
            value={userQuestions ? userQuestions.length : "—"}
            hint="Total contributions"
            icon={HelpCircle}
            colorClass="bg-brand-accent text-brand-accent"
          />
          <StatCard
            label="Answers Given"
            value={answersLoading ? "…" : (answersGivenCount ?? "—")}
            hint="Community help"
            icon={MessageCircle}
            colorClass="bg-emerald-500 text-emerald-500"
          />
          <StatCard
            label="Saved Resources"
            value={savedCount}
            hint="Your library"
            icon={Bookmark}
            colorClass="bg-brand-mid text-brand-mid"
          />
          <StatCard
            label="Current Title"
            value={currentTitle}
            hint={`Level ${currentLevel} Contributor`}
            icon={Shield}
            colorClass="bg-accent-orange text-accent-orange"
          />
        </div>

        {/* 3. MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* LEFT COLUMN (2/3 width) */}
          <div className="space-y-8 lg:col-span-2">
            {/* Recent Questions Card */}
            <div className="rounded-xl2 border border-white/50 bg-surface-base p-1 shadow-soft">
              <div className="p-5">
                <SectionHeader
                  title="Your Recent Questions"
                  linkText="View All"
                  linkTo="/questions"
                  icon={Activity}
                />

                <div className="mt-2 space-y-2">
                  {loading ? (
                    <div className="py-8 text-center text-gray-400">
                      Loading activity...
                    </div>
                  ) : error ? (
                    <div className="py-8 text-center text-red-500">{error}</div>
                  ) : recentUserQuestions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
                      <p className="text-gray-500">
                        You haven't asked anything yet.
                      </p>
                      <Link
                        to="/questions"
                        className="mt-2 inline-block text-sm font-semibold text-brand-accent hover:underline"
                      >
                        Start a discussion
                      </Link>
                    </div>
                  ) : (
                    recentUserQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="group flex items-center justify-between rounded-xl bg-surface-subtle p-4 transition-colors hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100"
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <Link to={`/questions/${q.id}`}>
                            <h4 className="truncate font-semibold text-brand-deep group-hover:text-brand-accent">
                              {q.title}
                            </h4>
                          </Link>
                          <p className="mt-1 text-xs text-gray-500">
                            Asked on{" "}
                            {new Date(q.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <div className="hidden sm:block">
                            <span className="block text-sm font-bold text-brand-deep">
                              {q.answer_count}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400">
                              Answers
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                              q.status === "open"
                                ? "bg-amber-50 text-amber-600 border-amber-100"
                                : "bg-emerald-50 text-emerald-600 border-emerald-100"
                            }`}
                          >
                            {q.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Saved Resources List View */}
            <div className="rounded-xl2 border border-white/50 bg-surface-base p-1 shadow-soft">
              <div className="p-5">
                <SectionHeader
                  title="Saved Materials"
                  linkText="Go to Library"
                  linkTo="/resources"
                  icon={Bookmark}
                />

                <div className="mt-2 space-y-3">
                  {savedResources === null ? (
                    <div className="py-8 text-center text-gray-400">
                      Loading library...
                    </div>
                  ) : savedResources.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
                      <p className="text-gray-600 font-medium">
                        Your library is empty.
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Bookmark notes and papers to access them quickly here.
                      </p>
                      <Link
                        to="/resources"
                        className="mt-3 inline-block text-sm font-semibold text-brand-accent hover:underline"
                      >
                        Browse Resources
                      </Link>
                    </div>
                  ) : (
                    savedResources.slice(0, 4).map((res) => {
                      const isLink =
                        res.type === "Links" ||
                        (!res.url?.endsWith(".pdf") &&
                          !res.url?.endsWith(".docx"));
                      return (
                        <div
                          key={res.id}
                          className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3 hover:border-brand-accent/30 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center gap-4 overflow-hidden">
                            <div
                              className={`flex shrink-0 items-center justify-center rounded-lg p-2.5 ${isLink ? "bg-blue-50 text-blue-500" : "bg-red-50 text-red-500"}`}
                            >
                              {isLink ? (
                                <LinkIcon className="h-5 w-5" />
                              ) : (
                                <FileText className="h-5 w-5" />
                              )}
                            </div>
                            <div className="min-w-0 pr-4">
                              <h4 className="truncate text-sm font-bold text-brand-deep group-hover:text-brand-accent">
                                {res.title}
                              </h4>
                              <p className="truncate text-xs text-gray-500">
                                {res.subject_name} • {res.type}
                              </p>
                            </div>
                          </div>
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 rounded-lg border border-gray-100 p-2 text-gray-400 transition-colors hover:bg-brand-deep hover:text-white"
                          >
                            {isLink ? (
                              <ExternalLink className="h-4 w-4" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </a>
                        </div>
                      );
                    })
                  )}
                  {savedResources?.length > 4 && (
                    <div className="pt-2 text-center">
                      <Link
                        to="/resources"
                        className="text-xs font-bold text-gray-500 hover:text-brand-accent"
                      >
                        View all {savedResources.length} saved items...
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (1/3 width) - Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* AI / Next Steps Card */}
            <div className="relative overflow-hidden rounded-xl2 bg-brand-deep text-white shadow-soft">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-accent opacity-20 blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-brand-mid opacity-20 blur-2xl"></div>

              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-white/10">
                    <Award className="h-5 w-5 text-accent-orange" />
                  </div>
                  <h3 className="font-bold text-lg">Next Steps</h3>
                </div>

                <ul className="space-y-3 text-sm text-blue-100">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-orange"></span>
                    <span>
                      Review high-weightage topics for current semester.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-orange"></span>
                    <span>
                      Practice PYQs for subjects you haven't saved yet.
                    </span>
                  </li>
                </ul>

                <button className="mt-6 w-full rounded-xl bg-white py-2.5 text-sm font-bold text-brand-deep transition-transform hover:scale-[1.02]">
                  View AI Study Plan
                </button>
              </div>
            </div>

            {/* Contribution Stats */}
            <div className="rounded-xl2 border border-gray-100 bg-white p-6 shadow-soft">
              <h3 className="mb-2 text-base font-bold text-brand-deep">
                Path to Promotion
              </h3>
              <p className="mb-4 text-sm text-gray-500">
                {answersLoading
                  ? "Calculating..."
                  : `You have contributed ${answersGivenCount || 0} answers.`}
              </p>

              {(() => {
                // Thresholds matching titleLevels.js: 0→1→5→10→20→35→50
                const THRESHOLDS = [0, 1, 5, 10, 20, 35, 50];
                const answers = answersGivenCount || 0;
                const nextThreshold = THRESHOLDS.find((t) => t > answers) ?? 50;
                const prevThreshold =
                  [...THRESHOLDS].reverse().find((t) => t <= answers) ?? 0;
                const progress =
                  nextThreshold === prevThreshold
                    ? 100
                    : Math.round(
                        ((answers - prevThreshold) /
                          (nextThreshold - prevThreshold)) *
                          100,
                      );
                return (
                  <>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full bg-accent-orange transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-bold">
                      <span className="text-brand-deep">
                        {currentTitle || "New Member"}
                      </span>
                      <span className="text-gray-400">
                        {answers < 50
                          ? `${answers} / ${nextThreshold} answers`
                          : "Max Level"}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="rounded-xl2 border border-brand-mid/10 bg-background-light p-4 text-xs text-brand-mid">
              <span className="font-bold">Pro Tip:</span> Your title upgrades
              automatically when your answers are marked as "Accepted" by other
              students!
            </div>

            <div className="rounded-xl2 border border-brand-mid/10 bg-background-light p-4 text-xs text-brand-mid">
              <span className="font-bold">Beta Tip:</span> This dashboard is
              evolving. Soon we will add syllabus-backed AI suggestions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
