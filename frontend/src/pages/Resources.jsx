// src/pages/Resources.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Video,
  Link as LinkIcon,
  BookOpen,
  FileQuestion,
  Download,
  ExternalLink,
  Search,
  Share2,
  AlertCircle,
  Bookmark, // Added Bookmark icon
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
import AcademicSelector from "../components/AcademicSelector";
import { useAuth } from "../context/AuthContext";
import ReportButton from "../components/ReportButton";

// Resource Type Configuration
const RESOURCE_TYPES = [
  { key: "PYQ", label: "PYQs", icon: FileQuestion },
  { key: "NOTES", label: "Notes", icon: FileText },
  { key: "VIDEO", label: "Videos", icon: Video },
  { key: "EBOOK", label: "Books", icon: BookOpen },
  { key: "LINK", label: "Links", icon: LinkIcon },
];

export default function Resources() {
  const [selection, setSelection] = useState({
    institutionId: "",
    degreeId: "",
    semesterId: "",
    subjectId: "",
  });

  const [resources, setResources] = useState([]);
  const [selectedType, setSelectedType] = useState("PYQ");
  const [loading, setLoading] = useState(false);

  // Fetch Resources when Subject or Type changes
  useEffect(() => {
    if (!selection.subjectId) {
      setResources([]);
      return;
    }

    setLoading(true);

    (async () => {
      try {
        // We pass the token so the backend can attach 'is_saved' status to the resources
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        console.log(
          `Fetching resources for subject ${selection.subjectId} with type ${selectedType} for user ${token ? headers : "guest"}`,
        );
        console.log(headers);
        console.log(
          `API URL: ${API_BASE_URL}/api/resources?subjectId=${selection.subjectId}&type=${selectedType}`,
        );
        const res = await fetch(
          `${API_BASE_URL}/api/resources?subjectId=${selection.subjectId}&type=${selectedType}`,
          { headers },
        );

        if (!res.ok) throw new Error("API not ready");

        const data = await res.json();
        setResources(Array.isArray(data) ? data : []);
      } catch (err) {
        setResources([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selection.subjectId, selectedType]);

  const canShowContent = Boolean(selection.subjectId);

  return (
    <div className="min-h-screen bg-background-light py-8 font-sans text-brand-deep">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-deep">
              Study Library
            </h1>
            <p className="mt-2 text-brand-mid/80">
              Access curated notes, past papers, and lectures for your specific
              course.
            </p>
          </div>
          <Link
            to="/contact"
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-brand-deep shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Contribute Resource
          </Link>
        </div>

        {/* SELECTOR CARD */}
        <div className="mb-8 overflow-hidden rounded-xl2 border border-white/60 bg-white shadow-soft">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-3">
            <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Filter Materials
            </h2>
          </div>
          <div className="p-6">
            <AcademicSelector onChange={setSelection} />
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* TABS SIDEBAR (Desktop) / TOPBAR (Mobile) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-2">
              <h3 className="mb-3 px-2 text-xs font-bold uppercase text-gray-400">
                Resource Type
              </h3>
              <div className="flex flex-row gap-2 overflow-x-auto pb-2 lg:flex-col lg:pb-0">
                {RESOURCE_TYPES.map((t) => {
                  const Icon = t.icon;
                  const isActive = selectedType === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setSelectedType(t.key)}
                      disabled={!canShowContent}
                      className={`flex min-w-[120px] items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all
                          ${
                            isActive
                              ? "bg-brand-deep text-white shadow-md"
                              : "bg-white text-gray-500 hover:bg-gray-50 hover:text-brand-deep"
                          }
                          ${!canShowContent && "opacity-50 cursor-not-allowed"}
                        `}
                    >
                      <Icon
                        className={`h-5 w-5 ${isActive ? "text-brand-accent" : "text-gray-400"}`}
                      />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RESOURCE GRID */}
          <div className="lg:col-span-3">
            {!canShowContent ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl2 border border-dashed border-gray-300 bg-white/50 text-center">
                <div className="mb-4 rounded-full bg-brand-deep/5 p-4">
                  <Search className="h-8 w-8 text-brand-mid/50" />
                </div>
                <h3 className="text-lg font-bold text-brand-deep">
                  Select a subject first
                </h3>
                <p className="max-w-xs text-sm text-gray-500">
                  Choose your university, degree, and semester above to unlock
                  the library.
                </p>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-32 w-full animate-pulse rounded-xl2 bg-white/60"
                  ></div>
                ))}
              </div>
            ) : resources.length === 0 ? (
              <div className="rounded-xl2 border border-orange-100 bg-orange-50/50 p-8 text-center">
                <AlertCircle className="mx-auto h-10 w-10 text-orange-300 mb-3" />
                <h3 className="text-lg font-bold text-brand-deep">
                  No {selectedType} found
                </h3>
                <p className="text-sm text-gray-600">
                  We don't have materials for this section yet.
                </p>
                <Link
                  to="/contact"
                  className="mt-4 inline-block text-sm font-bold text-brand-accent hover:underline"
                >
                  Upload notes & earn karma points →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {resources.map((r, idx) => (
                  <ResourceCard key={r.id || idx} resource={r} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Sub-component: Resource Card
 * Displays individual file details and handles saving
 */
function ResourceCard({ resource }) {
  const { user } = useAuth();
  // Assume backend sends resource.is_saved. Default to false if missing.
  const [isSaved, setIsSaved] = useState(resource.is_saved || false);
  const isLink =
    !resource.url?.endsWith(".pdf") && !resource.url?.endsWith(".docx");

  const handleToggleSave = async () => {
    if (!user) {
      alert("Please log in to save resources.");
      return;
    }

    // Optimistic UI toggle
    const previousState = isSaved;
    setIsSaved(!isSaved);

    try {
      // Calling the route you set up in savedResource.routes.js
      const res = await fetch(
        `${API_BASE_URL}/api/resources/${resource.id}/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      console.log("Save API response status:", res);
      if (!res.ok) throw new Error("Failed to save");

      const data = await res.json();
      console.log("Save response:", data);
      // Sync with the actual backend state
      setIsSaved(data.saved);
    } catch (err) {
      console.error(err);
      // Revert if API fails
      setIsSaved(previousState);
    }
  };

  return (
    <div className="group flex flex-col justify-between rounded-xl2 border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div>
        <div className="mb-3 flex items-start justify-between">
          <div
            className={`rounded-lg p-2 ${isLink ? "bg-blue-50 text-blue-500" : "bg-red-50 text-red-500"}`}
          >
            {isLink ? (
              <LinkIcon className="h-5 w-5" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
          </div>

          <div className="flex items-center gap-2">
            {resource.year && (
              <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">
                {resource.year}
              </span>
            )}

            {/* The Save / Bookmark Button */}
            <button
              onClick={handleToggleSave}
              className={`rounded-lg p-1.5 transition-colors hover:bg-gray-100 ${
                isSaved
                  ? "text-brand-accent"
                  : "text-gray-300 hover:text-gray-500"
              }`}
              title={isSaved ? "Remove from saved" : "Save resource"}
            >
              <Bookmark
                className="h-5 w-5"
                fill={isSaved ? "currentColor" : "none"}
              />
            </button>

            {/* Report Button */}
            <ReportButton targetType="resource" targetId={resource.id} />
          </div>
        </div>

        <h4 className="line-clamp-2 text-base font-bold text-brand-deep group-hover:text-brand-accent">
          {resource.title}
        </h4>

        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
          <span>
            {resource.difficulty
              ? `Difficulty: ${resource.difficulty}/5`
              : "General"}
          </span>
          <span>•</span>
          <span>English</span>
        </div>
      </div>

      <div className="mt-5 border-t border-gray-100 pt-4">
        {resource.url ? (
          <a
            href={resource.url}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-50 py-2 text-sm font-bold text-brand-mid transition-colors hover:bg-brand-deep hover:text-white"
          >
            {isLink ? "Open Link" : "Download"}
            {isLink ? (
              <ExternalLink className="h-3 w-3" />
            ) : (
              <Download className="h-3 w-3" />
            )}
          </a>
        ) : (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-gray-100 py-2 text-sm font-bold text-gray-400"
          >
            Link Unavailable
          </button>
        )}
      </div>
    </div>
  );
}
