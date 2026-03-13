// src/pages/AskQuestion.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  HelpCircle, 
  Search, 
  AlertTriangle, 
  Send, 
  Type, 
  FileText,
  ArrowLeft
} from "lucide-react";
import useDebounce from "../hooks/useDebounce"; // Assuming this exists as per your original code
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import AcademicSelector from "../components/AcademicSelector"; 

export default function AskQuestion() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // We manage the full academic state to pass to the filter
  const [academicState, setAcademicState] = useState({
    institutionId: "",
    degreeId: "",
    semesterId: "",
    subjectId: ""
  });
  
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedTitle = useDebounce(title, 500);

  // 1. Similar Questions Logic (Unchanged logic, updated visuals)
  useEffect(() => {
    if (!debouncedTitle || debouncedTitle.trim().length < 6) {
      setSimilar([]);
      return;
    }
    (async () => {
      try {
        const q = new URLSearchParams();
        q.set("search", debouncedTitle);
        q.set("limit", 5);
        const res = await fetch(`${API_BASE_URL}/api/questions?${q}`);
        if (!res.ok) throw new Error("no search");
        const data = await res.json();
        setSimilar(data || []);
      } catch (e) {
        setSimilar([]);
      }
    })();
  }, [debouncedTitle]);

  // 2. Submit Logic
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Please enter a clear title for your question.");
    if (!academicState.subjectId) return setError("Please select the specific subject.");

    // Soft duplicate check
    if (similar && similar.length > 0) {
      const confirmed = window.confirm("We found similar questions. Are you sure yours is different?");
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title,
          description,
          subjectId: academicState.subjectId, // Only need subjectId for backend usually
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create question");
      }

      const created = await res.json();
      navigate(`/questions/${created.id}`);
    } catch (err) {
      setError(err.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background-light py-8 font-sans text-brand-deep">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
           <Link to="/questions" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-accent transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Forum
           </Link>
           <h1 className="text-3xl font-extrabold text-brand-deep">Ask the Community</h1>
           <p className="mt-2 text-brand-mid/80">
             Get help with your coursework. Be specific to get the best answers.
           </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* LEFT COL: THE FORM (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="rounded-xl2 border border-white/60 bg-white shadow-soft p-6 sm:p-8">
              
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-red-700">
                   <AlertTriangle className="h-5 w-5 shrink-0" />
                   <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-8">
                {/* Section 1: Context */}
                <div>
                   <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-deep">
                     <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent text-xs text-white">1</span>
                     Select Topic
                   </h3>
                   <div className="rounded-xl bg-gray-50 p-5 border border-gray-100">
                      <AcademicSelector
                         value={academicState}
                         onChange={setAcademicState}
                      />
                   </div>
                </div>

                {/* Section 2: Details */}
                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-brand-deep">
                     <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent text-xs text-white">2</span>
                     Question Details
                   </h3>
                   
                   <div className="space-y-4">
                      {/* Title Input */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Title</label>
                        <div className="relative">
                          <Type className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                          <input 
                            value={title} 
                            onChange={(e)=>setTitle(e.target.value)} 
                            placeholder="e.g., 'What is the time complexity of a nested loop?'" 
                            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 font-medium text-brand-deep placeholder:text-gray-400 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 outline-none transition-all" 
                          />
                        </div>
                        <p className="text-xs text-gray-400">Keep it short and concise.</p>
                      </div>

                      {/* Description Input */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Description</label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                          <textarea 
                            rows={6} 
                            value={description} 
                            onChange={(e)=>setDescription(e.target.value)} 
                            placeholder="Provide details, code snippets, or context about what you've tried so far..." 
                            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 font-medium text-brand-deep placeholder:text-gray-400 focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 outline-none transition-all resize-y"
                          ></textarea>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-4">
                   <Link to="/questions" className="text-sm font-semibold text-gray-500 hover:text-brand-deep">Cancel</Link>
                   <button 
                     disabled={loading} 
                     className="flex items-center gap-2 rounded-xl bg-brand-accent px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:bg-blue-600 disabled:opacity-70 disabled:scale-100"
                   >
                     {loading ? (
                        <span className="animate-pulse">Publishing...</span>
                     ) : (
                        <>
                          <span>Post Question</span>
                          <Send className="h-4 w-4" />
                        </>
                     )}
                   </button>
                </div>
              </div>
            </form>
          </div>

          {/* RIGHT COL: SIDEBAR (1/3 width) */}
          <div className="space-y-6 lg:col-span-1">
             
             {/* Similar Questions Assistant */}
             <div className={`rounded-xl2 border p-6 transition-all duration-500 ${
                similar.length > 0 
                  ? "bg-amber-50 border-amber-200 shadow-sm" 
                  : "bg-white border-white/60 shadow-soft opacity-80"
             }`}>
                <div className="flex items-center gap-2 mb-4">
                   {similar.length > 0 ? (
                      <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
                         <AlertTriangle className="h-5 w-5" />
                      </div>
                   ) : (
                      <div className="p-1.5 bg-brand-deep/5 rounded-lg text-brand-deep">
                         <Search className="h-5 w-5" />
                      </div>
                   )}
                   <h3 className={`font-bold ${similar.length > 0 ? "text-amber-800" : "text-brand-deep"}`}>
                      {similar.length > 0 ? "Wait! Is this it?" : "Before you post..."}
                   </h3>
                </div>

                {similar.length > 0 ? (
                  <div className="space-y-3">
                     <p className="text-sm text-amber-700 leading-snug">
                       We found similar discussions. Check if your answer is already here:
                     </p>
                     <ul className="space-y-2">
                        {similar.map(s => (
                           <li key={s.id}>
                              <a href={`/questions/${s.id}`} target="_blank" rel="noopener noreferrer" className="block rounded-lg bg-white p-3 shadow-sm hover:ring-2 hover:ring-amber-300 transition-all">
                                 <div className="text-sm font-semibold text-brand-deep truncate">{s.title}</div>
                                 <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><HelpCircle className="h-3 w-3" /> {s.answer_count} answers</span>
                                    <span className={`px-1.5 py-0.5 rounded ${s.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100'}`}>{s.status}</span>
                                 </div>
                              </a>
                           </li>
                        ))}
                     </ul>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 space-y-3">
                     <p>We are searching for duplicates as you type.</p>
                     <p>
                       <span className="block font-semibold text-brand-deep mb-1">Tips for a good question:</span>
                       <ul className="list-disc pl-4 space-y-1">
                          <li>Summarize the problem in the title.</li>
                          <li>Mention the specific subject.</li>
                          <li>Explain what you have already tried.</li>
                       </ul>
                     </p>
                  </div>
                )}
             </div>

             {/* Mascot / Helper Image */}
             <div className="hidden lg:block relative overflow-hidden rounded-xl2 bg-brand-deep p-6 text-white shadow-soft">
                <div className="relative z-10">
                   <h4 className="font-bold text-lg mb-2">Need Help?</h4>
                   <p className="text-sm text-blue-100 mb-4">
                      Our community guidelines help ensure you get the fastest answer.
                   </p>
                   <button className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors">
                      Read Guidelines
                   </button>
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-brand-accent opacity-20 blur-2xl"></div>
             </div>

          </div>

        </div>
      </div>
    </div>
  );
}