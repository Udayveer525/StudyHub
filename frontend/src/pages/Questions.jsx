// src/pages/Questions.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import QuestionCard from "../components/QuestionCard"; // Ensure this card has rounded-xl and shadow-sm!
import AcademicFilter from "../components/AcademicFilter";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

const DEFAULT_LIMIT = 10;

export default function Questions() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Params
  const institutionId = searchParams.get("institutionId") || "";
  const degreeId = searchParams.get("degreeId") || "";
  const semesterId = searchParams.get("semesterId") || "";
  const subjectId = searchParams.get("subjectId") || "";
  const status = searchParams.get("status") || "";
  const qSearch = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // State
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(null);
  const [loading, setLoading] = useState(false);

  // Kept logic for AcademicFilter lists (passed via context or props usually, but keeping your structure)
  const [filterLists, setFilterLists] = useState({
    institutions: [],
    degrees: [],
    semesters: [],
    subjects: [],
  });

  // 1. Fetch Filter Lists
  useEffect(() => {
    (async () => {
      try {
        const [dRes, iRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/degrees`),
          fetch(`${API_BASE_URL}/api/institutions`).catch(() => null),
        ]);
        if (dRes.ok) {
          const degrees = await dRes.json();
          setFilterLists((f) => ({ ...f, degrees }));
        }
        if (iRes && iRes.ok) {
          const institutions = await iRes.json();
          setFilterLists((f) => ({ ...f, institutions }));
        }
      } catch (e) {
        /* Ignore */
      }
    })();
  }, []);

  // 2. Fetch Questions
  useEffect(() => {
    setLoading(true);
    const offset = (page - 1) * DEFAULT_LIMIT;
    const params = new URLSearchParams();
    if (degreeId) params.append("degreeId", degreeId);
    if (semesterId) params.append("semesterId", semesterId);
    if (subjectId) params.append("subjectId", subjectId);
    if (status) params.append("status", status);
    if (qSearch) params.append("search", qSearch);
    params.append("limit", DEFAULT_LIMIT);
    params.append("offset", offset);

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/questions?${params.toString()}`,
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setItems(data || []);
        const total = res.headers.get("x-total-count");
        setTotalCount(total ? Number(total) : null);
      } catch (err) {
        setItems([]);
        setTotalCount(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [degreeId, semesterId, subjectId, status, qSearch, page]);

  const totalPages = useMemo(() => {
    if (!totalCount) return null;
    return Math.max(1, Math.ceil(totalCount / DEFAULT_LIMIT));
  }, [totalCount]);

  function updateParam(key, value) {
    const p = new URLSearchParams(searchParams);
    if (value === "" || value === null) p.delete(key);
    else p.set(key, value);
    setSearchParams(p);
  }

  // Helper to clear filters
  const hasFilters =
    institutionId || degreeId || semesterId || subjectId || status || qSearch;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-gradientFrom to-background-gradientTo py-8 font-sans text-brand-deep">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-deep">
              Discussion Forum
            </h1>
            <p className="mt-2 text-brand-mid/80">
              Find answers, ask questions, and collaborate with peers.
            </p>
          </div>
          <div className="flex gap-3">
            {user ? (
              <Link
                to="/questions/ask"
                className="group flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-3 text-sm font-bold text-white shadow-soft transition-all hover:bg-blue-600 hover:shadow-lg"
              >
                <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                Ask Question
              </Link>
            ) : (
              <Link
                to="/login"
                className="rounded-xl border border-brand-mid/20 bg-white px-5 py-3 text-sm font-bold text-brand-deep hover:bg-gray-50"
              >
                Login to Ask
              </Link>
            )}
          </div>
        </header>

        {/* SEARCH & FILTERS CARD */}
        <div className="mb-8 overflow-hidden rounded-xl2 border border-white/60 bg-white/80 shadow-soft backdrop-blur-xl">
          <div className="border-b border-gray-100 bg-surface-subtle/50 px-6 py-4">
            <div className="flex items-center gap-2 text-sm font-bold text-brand-mid">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filter & Search</span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Main Academic Filter (Takes up more space) */}
              <div className="lg:col-span-12 xl:col-span-8">
                <AcademicFilter
                  value={{ institutionId, degreeId, semesterId, subjectId }}
                  onChange={(v) => {
                    const p = new URLSearchParams(searchParams);
                    const setOrDelete = (key, val) => {
                      if (
                        val === "" ||
                        val === null ||
                        typeof val === "undefined"
                      )
                        p.delete(key);
                      else p.set(key, val);
                    };
                    setOrDelete("institutionId", v.institutionId);
                    setOrDelete("degreeId", v.degreeId);
                    setOrDelete("semesterId", v.semesterId);
                    setOrDelete("subjectId", v.subjectId);
                    p.delete("page");
                    setSearchParams(p);
                  }}
                />
              </div>

              {/* Search & Status (Side controls) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-12 xl:col-span-4 xl:grid-cols-1">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    value={qSearch}
                    onChange={(e) => updateParam("search", e.target.value)}
                    placeholder="Search keywords..."
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
                  />
                </div>

                {/* Status Dropdown */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-8 text-sm font-medium outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
                    value={status}
                    onChange={(e) => updateParam("status", e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters / Reset */}
            {hasFilters && (
              <div className="mt-6 flex items-center justify-between border-t border-dashed border-gray-200 pt-4">
                <button
                  onClick={() => setSearchParams({})}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600"
                >
                  <XCircle className="h-4 w-4" />
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* QUESTIONS LIST */}
        <div className="space-y-4">
          {loading ? (
            // Skeleton Loader
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 w-full animate-pulse rounded-xl2 bg-white/50"
              ></div>
            ))
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-gray-300 bg-white/50 py-20 text-center">
              <div className="rounded-full bg-gray-100 p-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-brand-deep">
                No questions found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or search query.
              </p>
              <button
                onClick={() => setSearchParams({})}
                className="mt-4 text-sm font-semibold text-brand-accent hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            // Ensure QuestionCard handles its own 'card' styling, or wrap it here
            <div className="space-y-4">
              {items.map((q) => (
                // Passing a wrapper div just in case QuestionCard is unstyled
                <div
                  key={q.id}
                  className="transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <QuestionCard q={q} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PAGINATION */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => updateParam("page", String(Math.max(1, page - 1)))}
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-brand-deep shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <button
              disabled={
                (!totalPages && items.length < DEFAULT_LIMIT) ||
                (totalPages && page >= totalPages)
              }
              onClick={() => updateParam("page", String(page + 1))}
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-brand-deep shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
