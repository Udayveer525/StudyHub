// src/components/QuestionCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Clock, User, CheckCircle, AlertCircle } from "lucide-react";

export default function QuestionCard({ q }) {
  const isResolved = q.status === "resolved";

  return (
    <Link 
      to={`/questions/${q.id}`}
      className="group block relative overflow-hidden rounded-xl2 border border-transparent bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand-accent/10"
    >
      {/* Status Stripe (Left Border visual) */}
      <div className={`absolute left-0 top-0 h-full w-1 ${isResolved ? "bg-emerald-500" : "bg-brand-accent"}`} />

      <div className="flex items-start justify-between gap-4 pl-2">
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Author & Date Row */}
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 border border-gray-100">
              <User className="h-3 w-3 text-brand-mid" />
              <span className="font-medium text-brand-deep truncate max-w-[100px]">
                {q.author_name || "Anonymous"}
              </span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{new Date(q.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold leading-snug text-brand-deep transition-colors group-hover:text-brand-accent">
            {q.title}
          </h3>

          {/* Tags / Metadata */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-gray-600">
             {q.subject_code && (
               <span className="rounded-md bg-brand-deep/5 px-2 py-1 text-brand-deep">
                 {q.subject_code}
               </span>
             )}
             {q.semester_number && (
               <span className="rounded-md bg-gray-100 px-2 py-1">
                 Sem {q.semester_number}
               </span>
             )}
             <span className="rounded-md bg-gray-100 px-2 py-1">
                {q.degree_name || "General"}
             </span>
          </div>

          {/* Description Preview */}
          {q.description && (
            <p className="mt-3 line-clamp-2 text-sm text-gray-500">
              {q.description}
            </p>
          )}
        </div>

        {/* Right Side Stats */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          {/* Answer Count Badge */}
          <div className={`flex flex-col items-center justify-center rounded-xl p-2 min-w-[60px] border ${
            q.answer_count > 0 
              ? "bg-brand-accent/10 border-brand-accent/20 text-brand-accent" 
              : "bg-gray-50 border-gray-100 text-gray-400"
          }`}>
            <MessageCircle className="h-5 w-5 mb-1" />
            <span className="text-xs font-bold">{q.answer_count}</span>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
            isResolved 
              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
              : "bg-orange-50 text-accent-orange border-orange-100"
          }`}>
            {isResolved ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {q.status}
          </div>
        </div>
      </div>
    </Link>
  );
}