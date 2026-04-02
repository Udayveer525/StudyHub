// pages/ollie/OlliePage.jsx
// Main Ollie study hub — subject selector, topic map, chat, quiz
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen, MessageCircle, Zap, Calendar, ChevronDown,
  AlertCircle, Loader2, ArrowLeft, Trophy, Clock, Target,
  TrendingUp, AlertTriangle,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import TopicMap from "../../components/ollie/TopicMap";
import OllieChat from "../../components/ollie/OllieChat";
import QuizPlayer from "../../components/ollie/QuizPlayer";
import OllieAvatar from "../../components/ollie/OllieAvatar";

const TABS = [
  { id: "study",    label: "Study",    icon: MessageCircle },
  { id: "topics",   label: "Topics",   icon: BookOpen },
  { id: "schedule", label: "Schedule", icon: Calendar },
];

// ─── Timetable view ───────────────────────────────────────────────────────────
function TimetableView({ syllabusId, topics, coveredTopics, weakTopics }) {
  const [examDate,    setExamDate]    = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [plan,        setPlan]        = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [generated,   setGenerated]   = useState(false);

  const generate = async () => {
    if (!examDate) { setError("Please set your exam date first"); return; }
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/ollie/timetable/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ syllabusId, examDate, hoursPerDay }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPlan(data.plan || []);
      setGenerated(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!generated) {
    return (
      <div className="space-y-5 p-4">
        <div className="rounded-xl2 border border-white/50 bg-surface-base p-5 shadow-soft space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <OllieAvatar size={32} />
            <p className="text-sm font-bold text-brand-deep">
              Let me build your personalised study plan!
            </p>
          </div>
          <p className="text-xs text-gray-500">
            I'll skip what you've already covered and spend extra time on your weak spots.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
                Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => setExamDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-brand-deep focus:border-brand-accent focus:bg-white focus:ring-4 focus:ring-brand-accent/10 outline-none transition-all"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
                Hours/Day
              </label>
              <select
                value={hoursPerDay}
                onChange={e => setHoursPerDay(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-brand-deep focus:border-brand-accent focus:bg-white focus:ring-4 focus:ring-brand-accent/10 outline-none transition-all"
              >
                {[1,2,3,4,5,6].map(h => <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""}</option>)}
              </select>
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <button
            onClick={generate}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-deep py-3 text-sm font-bold text-white hover:bg-brand-mid disabled:opacity-60 transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {loading ? "Generating..." : "Generate My Plan 🦉"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-brand-deep">Your {plan.length}-day plan</p>
        <button
          onClick={() => setGenerated(false)}
          className="text-xs text-brand-accent hover:underline"
        >
          Regenerate
        </button>
      </div>
      {plan.map((day, i) => (
        <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">
              Day {day.day} · {day.date}
            </span>
          </div>
          {day.focus && (
            <p className="mb-2 text-xs text-brand-accent font-medium">{day.focus}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {day.topics.map((t, ti) => (
              <span key={ti} className="rounded-lg bg-brand-deep/5 px-2.5 py-1 text-xs font-medium text-brand-deep">
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Subject overview card (shown in the dashboard-style empty state) ──────────
function SubjectCard({ subject, syllabusInfo, isRecent, onClick }) {
  const topics   = syllabusInfo?.topics  || [];
  const covered  = syllabusInfo?.progress?.covered_topics || [];
  const weak     = syllabusInfo?.progress?.weak_topics    || [];
  const exists   = syllabusInfo?.exists ?? false;
  const percent  = topics.length > 0 ? Math.round((covered.length / topics.length) * 100) : 0;
  const lastSeen = syllabusInfo?.progress?.last_session_at;

  const statusColor =
    !exists         ? "border-gray-100 bg-white opacity-60"
    : percent === 100 ? "border-emerald-100 bg-emerald-50/40"
    : weak.length > 0  ? "border-amber-100 bg-amber-50/30"
    : covered.length > 0 ? "border-brand-accent/20 bg-brand-accent/5"
    :                    "border-gray-100 bg-white";

  const barColor =
    percent === 100  ? "bg-emerald-500"
    : weak.length > 0 ? "bg-amber-400"
    :                   "bg-brand-accent";

  return (
    <button
      onClick={() => exists && onClick(subject)}
      disabled={!exists}
      className={`w-full rounded-xl2 border p-4 text-left shadow-soft transition-all ${statusColor} ${
        exists ? "hover:shadow-md hover:-translate-y-0.5 active:translate-y-0" : "cursor-not-allowed"
      } ${isRecent ? "ring-2 ring-brand-accent ring-offset-1" : ""}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isRecent && (
              <span className="shrink-0 rounded-full bg-brand-accent px-2 py-0.5 text-[10px] font-bold text-white">
                Last studied
              </span>
            )}
            {percent === 100 && (
              <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                ✓ Complete
              </span>
            )}
            {!exists && (
              <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-400">
                No syllabus
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-bold text-brand-deep leading-snug truncate">{subject.name}</p>
          <p className="text-[11px] text-gray-400 font-medium">{subject.code}</p>
        </div>
        {exists && (
          <span className={`shrink-0 text-lg font-extrabold ${
            percent === 100 ? "text-emerald-600" : percent > 0 ? "text-brand-accent" : "text-gray-300"
          }`}>
            {percent}%
          </span>
        )}
      </div>

      {exists && (
        <>
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-400">
            <span>{covered.length}/{topics.length} topics</span>
            {weak.length > 0 && (
              <span className="text-amber-500 font-medium">
                {weak.length} weak
              </span>
            )}
            {lastSeen && covered.length > 0 && (
              <span className="ml-auto flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(lastSeen).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            )}
          </div>
        </>
      )}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OlliePage() {
  const { user } = useAuth();

  const [subjects,        setSubjects]        = useState([]);
  const [subjectSyllabi,  setSubjectSyllabi]  = useState({}); // { [subjectId]: syllabusData }
  const [syllabusLoading, setSyllabusLoading] = useState(false);
  const [selectedSub,     setSelectedSub]     = useState(null);
  const [syllabusData,    setSyllabusData]    = useState(null);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState(null);
  const [activeTab,       setActiveTab]       = useState("study");
  const [selectedTopic,   setSelectedTopic]   = useState(null);
  const [quizState,       setQuizState]       = useState(null);

  // Load subjects from profile, then batch-load all syllabi for the overview
  useEffect(() => {
    if (!user?.id) return;
    const token = localStorage.getItem("token");

    fetch(`${API_BASE_URL}/api/profile/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(async data => {
        if (!data.user?.semester_id) return;
        const subRes = await fetch(`${API_BASE_URL}/api/subjects?semesterId=${data.user.semester_id}`);
        const subs = await subRes.json();
        if (!Array.isArray(subs)) return;
        setSubjects(subs);

        // Batch-fetch syllabus info for all subjects in parallel
        setSyllabusLoading(true);
        const results = await Promise.allSettled(
          subs.map(s =>
            fetch(`${API_BASE_URL}/api/ollie/syllabus/${s.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then(r => r.json())
          )
        );
        const syllabi = {};
        subs.forEach((s, i) => {
          if (results[i].status === "fulfilled") syllabi[s.id] = results[i].value;
        });
        setSubjectSyllabi(syllabi);
        setSyllabusLoading(false);
      })
      .catch(() => setSyllabusLoading(false));
  }, [user]);

  const loadSyllabus = useCallback(async (subject) => {
    setSelectedSub(subject);
    setSelectedTopic(null);
    setQuizState(null);
    setError(null);

    // Use cached data from the batch load if available
    if (subjectSyllabi[subject.id]) {
      setSyllabusData(subjectSyllabi[subject.id]);
      return;
    }

    // Fallback fetch (e.g. if batch load hasn't finished or failed for this subject)
    setLoading(true);
    setSyllabusData(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/ollie/syllabus/${subject.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSyllabusData(data);
      setSubjectSyllabi(prev => ({ ...prev, [subject.id]: data }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [subjectSyllabi]);

  const handleQuizRequest = async (topic) => {
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/ollie/quiz/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ syllabusId: syllabusData.syllabusId, topic: topic.name, count: 5 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuizState({ questions: data.questions, topic: topic.name });
      setActiveTab("study");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuizComplete = async (score, total) => {
    if (!syllabusData) return;
    const passed = Math.round((score / total) * 100) >= 70;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/ollie/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          syllabusId: syllabusData.syllabusId,
          topic: quizState.topic,
          score, totalQuestions: total,
        }),
      });
      const data = await res.json();

      // Update local progress state
      const newCovered = data.coveredTopics || syllabusData.progress?.covered_topics || [];
      const newWeak    = data.weakTopics    || syllabusData.progress?.weak_topics    || [];

      const updatedProgress = { ...syllabusData.progress, covered_topics: newCovered, weak_topics: newWeak };
      setSyllabusData(prev => ({ ...prev, progress: updatedProgress }));
      // Keep the overview cache in sync so the subject cards reflect new progress
      if (selectedSub) {
        setSubjectSyllabi(prev => ({
          ...prev,
          [selectedSub.id]: { ...prev[selectedSub.id], progress: updatedProgress },
        }));
      }

      setQuizState(null);

      // If passed — move to the next uncovered topic instead of staying on the same one
      if (passed) {
        const allTopics = syllabusData.topics || [];
        const currentIdx = allTopics.findIndex(t => t.name === quizState.topic);
        // Find next topic that isn't covered yet (search from currentIdx+1, then wrap)
        const remaining = [
          ...allTopics.slice(currentIdx + 1),
          ...allTopics.slice(0, currentIdx),
        ].filter(t => !newCovered.includes(t.name));

        if (remaining.length > 0) {
          setSelectedTopic(remaining[0]);
        } else {
          // All topics covered!
          setSelectedTopic(null);
        }
      }
      // If not passed — stay on same topic so they can review and retry
    } catch (err) {
      setError(err.message);
      setQuizState(null);
    }
  };

  return (
    <div className="min-h-screen bg-background-light font-sans">
      {/* Header */}
      <div className="border-b border-white/50 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/dashboard" className="text-gray-400 hover:text-brand-deep">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <OllieAvatar size={36} />
          <div>
            <h1 className="text-lg font-extrabold text-brand-deep">Study with Ollie</h1>
            <p className="text-xs text-gray-400">Your AI-powered study companion</p>
          </div>

          {/* When a subject is active: show its name + a switch dropdown */}
          {subjects.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              {selectedSub && (
                <button
                  onClick={() => { setSelectedSub(null); setSyllabusData(null); setError(null); setQuizState(null); }}
                  className="text-xs font-medium text-gray-400 hover:text-brand-deep transition-colors"
                >
                  ← All subjects
                </button>
              )}
              <div className="relative">
                <select
                  value={selectedSub?.id || ""}
                  onChange={e => {
                    const sub = subjects.find(s => String(s.id) === e.target.value);
                    if (sub) loadSyllabus(sub);
                  }}
                  className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-brand-deep focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 outline-none max-w-[180px] truncate"
                >
                  <option value="">Switch subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Overview dashboard — shown before a subject is selected */}
        {!selectedSub && (() => {
          const allSyllabi  = Object.values(subjectSyllabi);
          const withSyllabus = allSyllabi.filter(s => s.exists);
          const totalTopics  = withSyllabus.reduce((a, s) => a + (s.topics?.length || 0), 0);
          const totalCovered = withSyllabus.reduce((a, s) => a + (s.progress?.covered_topics?.length || 0), 0);
          const totalWeak    = withSyllabus.reduce((a, s) => a + (s.progress?.weak_topics?.length || 0), 0);
          const overallPct   = totalTopics > 0 ? Math.round((totalCovered / totalTopics) * 100) : 0;
          const subjectsStarted = withSyllabus.filter(s => (s.progress?.covered_topics?.length || 0) > 0).length;

          // Most recently studied subject
          const recentEntry = Object.entries(subjectSyllabi)
            .filter(([, s]) => s.exists && s.progress?.last_session_at)
            .sort(([, a], [, b]) => new Date(b.progress.last_session_at) - new Date(a.progress.last_session_at))[0];
          const recentSubId = recentEntry ? Number(recentEntry[0]) : null;

          if (subjects.length === 0 && !syllabusLoading) {
            return (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <OllieAvatar size={80} animated />
                <h2 className="mt-6 text-2xl font-extrabold text-brand-deep">Hey {user?.name?.split(" ")[0]}!</h2>
                <p className="mt-2 max-w-md text-gray-500">
                  Complete your profile with your current semester and I'll load your subjects right here.
                </p>
                <Link
                  to={`/profile/${user?.id}`}
                  className="mt-6 rounded-xl bg-brand-deep px-6 py-3 text-sm font-bold text-white hover:bg-brand-mid transition-colors"
                >
                  Complete My Profile →
                </Link>
              </div>
            );
          }

          return (
            <div className="space-y-6">
              {/* Greeting + summary stats */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <OllieAvatar size={52} animated={!syllabusLoading} />
                  <div>
                    <h2 className="text-xl font-extrabold text-brand-deep">
                      Hey {user?.name?.split(" ")[0]}! 👋
                    </h2>
                    <p className="text-sm text-gray-500">
                      {syllabusLoading
                        ? "Loading your subjects..."
                        : withSyllabus.length === 0
                          ? "No syllabi uploaded yet. Ask your admin to add one."
                          : subjectsStarted === 0
                            ? "Pick a subject below to start your first session."
                            : `${subjectsStarted} subject${subjectsStarted > 1 ? "s" : ""} in progress — keep it up!`}
                    </p>
                  </div>
                </div>

                {/* Overall stats pills — only show when there's real data */}
                {!syllabusLoading && totalTopics > 0 && (
                  <div className="sm:ml-auto flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-soft">
                      <TrendingUp className="h-3.5 w-3.5 text-brand-accent" />
                      <span className="text-xs font-bold text-brand-deep">{overallPct}% overall</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                      <Trophy className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700">{totalCovered} covered</span>
                    </div>
                    {totalWeak > 0 && (
                      <div className="flex items-center gap-1.5 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs font-bold text-amber-700">{totalWeak} need work</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Weak topics callout — surfaces the most urgent thing to do */}
              {!syllabusLoading && totalWeak > 0 && (() => {
                const weakEntries = withSyllabus
                  .flatMap(s => (s.progress?.weak_topics || []).map(t => ({
                    topic: t,
                    subject: subjects.find(sub => subjectSyllabi[sub.id] === s),
                    syllabusInfo: s,
                  })))
                  .filter(e => e.subject)
                  .slice(0, 3);
                return (
                  <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-amber-600 shrink-0" />
                      <p className="text-sm font-bold text-amber-800">Topics that need more attention</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {weakEntries.map(({ topic, subject }) => (
                        <button
                          key={`${subject.id}-${topic}`}
                          onClick={() => {
                            const sylData = subjectSyllabi[subject.id];
                            setSelectedSub(subject);
                            setSyllabusData(sylData);
                            setSelectedTopic(sylData.topics?.find(t => t.name === topic) || null);
                            setActiveTab("study");
                          }}
                          className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-50 transition-colors"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          <span>{topic}</span>
                          <span className="text-amber-400">· {subject.code}</span>
                        </button>
                      ))}
                      {totalWeak > 3 && (
                        <span className="flex items-center px-2 text-xs text-amber-600 font-medium">
                          +{totalWeak - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Subject cards grid */}
              {syllabusLoading ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(Math.max(subjects.length, 3))].map((_, i) => (
                    <div key={i} className="h-32 rounded-xl2 border border-gray-100 bg-white animate-pulse shadow-soft" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {subjects.map(s => (
                    <SubjectCard
                      key={s.id}
                      subject={s}
                      syllabusInfo={subjectSyllabi[s.id]}
                      isRecent={s.id === recentSubId}
                      onClick={sub => {
                        setSelectedSub(sub);
                        setSyllabusData(subjectSyllabi[sub.id]);
                        setSelectedTopic(null);
                        setError(null);
                        setQuizState(null);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {/* No syllabus uploaded for this subject */}
        {selectedSub && !loading && syllabusData && !syllabusData.exists && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <OllieAvatar size={64} />
            <h3 className="mt-4 text-lg font-bold text-brand-deep">No syllabus yet for this subject</h3>
            <p className="mt-2 text-sm text-gray-500">
              Ask your admin to upload the syllabus PDF for <strong>{selectedSub.name}</strong>.
            </p>
            {user?.role === "admin" && (
              <Link
                to="/admin/syllabus"
                className="mt-6 rounded-xl bg-brand-deep px-6 py-3 text-sm font-bold text-white hover:bg-brand-mid"
              >
                Upload Syllabus →
              </Link>
            )}
          </div>
        )}

        {/* Main UI */}
        {selectedSub && !loading && syllabusData?.exists && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

            {/* LEFT: Topic map */}
            <div className="lg:col-span-2">
              <TopicMap
                topics={syllabusData.topics || []}
                coveredTopics={syllabusData.progress?.covered_topics || []}
                weakTopics={syllabusData.progress?.weak_topics || []}
                selectedTopic={selectedTopic}
                onTopicSelect={(t) => {
                  setSelectedTopic(t);
                  setQuizState(null);
                  setActiveTab("study");
                }}
              />
            </div>

            {/* RIGHT: Tabs */}
            <div className="lg:col-span-3">
              <div className="rounded-xl2 border border-white/50 bg-surface-base shadow-soft overflow-hidden" style={{ minHeight: 520 }}>
                {/* Tab bar */}
                <div className="flex border-b border-gray-100">
                  {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setQuizState(null); }}
                        className={`flex flex-1 items-center justify-center gap-2 py-3 text-xs font-bold transition-colors ${
                          activeTab === tab.id
                            ? "border-b-2 border-brand-accent text-brand-accent"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab content */}
                <div className="h-full" style={{ minHeight: 460 }}>
                  {/* All topics covered celebration */}
                  {activeTab === "study" && !quizState && selectedTopic === null &&
                   syllabusData?.topics?.length > 0 &&
                   (syllabusData?.progress?.covered_topics || []).length >= syllabusData.topics.length && (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                      <OllieAvatar size={64} animated />
                      <h3 className="mt-4 text-xl font-extrabold text-brand-deep">
                        🎉 Syllabus Complete!
                      </h3>
                      <p className="mt-2 text-sm text-gray-500 max-w-xs">
                        You've covered all topics! Use the Schedule tab to plan revision before your exam.
                      </p>
                    </div>
                  )}

                  {activeTab === "study" && (
                    quizState ? (
                      <div className="p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <p className="text-sm font-bold text-brand-deep">
                            Quiz: {quizState.topic}
                          </p>
                          <button onClick={() => setQuizState(null)} className="text-xs text-gray-400 hover:text-gray-600">
                            ← Back to chat
                          </button>
                        </div>
                        <QuizPlayer
                          questions={quizState.questions}
                          topic={quizState.topic}
                          onComplete={handleQuizComplete}
                          onRetry={() => handleQuizRequest(selectedTopic)}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col" style={{ height: 460 }}>
                        <OllieChat
                          syllabusId={syllabusData.syllabusId}
                          topic={selectedTopic}
                          mode="explain"
                          onQuizRequest={handleQuizRequest}
                        />
                      </div>
                    )
                  )}

                  {activeTab === "topics" && (
                    <div className="p-4 overflow-y-auto" style={{ maxHeight: 460 }}>
                      <TopicMap
                        topics={syllabusData.topics || []}
                        coveredTopics={syllabusData.progress?.covered_topics || []}
                        weakTopics={syllabusData.progress?.weak_topics || []}
                        selectedTopic={selectedTopic}
                        onTopicSelect={(t) => {
                          setSelectedTopic(t);
                          setActiveTab("study");
                        }}
                      />
                    </div>
                  )}

                  {activeTab === "schedule" && (
                    <div className="overflow-y-auto" style={{ maxHeight: 460 }}>
                      <TimetableView
                        syllabusId={syllabusData.syllabusId}
                        topics={syllabusData.topics || []}
                        coveredTopics={syllabusData.progress?.covered_topics || []}
                        weakTopics={syllabusData.progress?.weak_topics || []}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}