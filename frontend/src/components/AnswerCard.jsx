// src/components/AnswerCard.jsx
import React from "react";
import { ThumbsUp, ThumbsDown, Check, User, Clock, Shield } from "lucide-react";
import ReportButton from "./ReportButton";
import { Link } from "react-router-dom";

export default function AnswerCard({
  answer,
  canVote,
  canAccept,
  onVote,
  onAccept,
}) {
  const isAccepted = answer.is_accepted;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl2 border transition-all ${
        isAccepted
          ? "border-emerald-200 bg-emerald-50/30 ring-1 ring-emerald-100"
          : "border-gray-100 bg-white shadow-sm hover:shadow-md"
      }`}
    >
      {isAccepted && (
        <div className="absolute right-0 top-0 rounded-bl-xl bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-sm flex items-center gap-1">
          <Check className="h-3 w-3" /> Accepted Answer
        </div>
      )}

      <div className="flex gap-4 p-5">
        {/* Vote Column */}
        <div className="flex flex-col items-center gap-1">
          {canVote && (
            <button
              onClick={() => onVote(answer.id, 1)}
              className="rounded-lg p-1 text-gray-400 hover:bg-brand-accent/10 hover:text-brand-accent transition-colors"
              title="Upvote"
            >
              <ThumbsUp className="h-5 w-5" />
            </button>
          )}
          <span
            className={`text-lg font-bold ${answer.vote_score > 0 ? "text-brand-accent" : "text-gray-600"}`}
          >
            {answer.vote_score ?? 0}
          </span>
          {canVote && (
            <button
              onClick={() => onVote(answer.id, -1)}
              className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Downvote"
            >
              <ThumbsDown className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          {/* Author Header */}
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
            <div className="flex items-center gap-2 font-semibold text-brand-deep">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-deep text-[10px] text-white">
                <Link
                  to={`/profile/${answer.user_id}`}
                  title="View your profile"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-deep text-[10px] text-white"
                >
                  {answer.author_name ? answer.author_name.charAt(0) : "U"}
                </Link>
              </div>
              {answer.author_name}
              {answer.current_title && (
                <div className="flex items-center gap-1 rounded-full bg-accent-orange/10 px-2.5 py-0.5 border border-accent-orange/20 text-[10px] font-bold uppercase tracking-wider text-accent-orange shadow-sm">
                  <Shield className="h-3 w-3" />
                  {answer.current_title}
                </div>
              )}
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {new Date(answer.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Body */}
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {answer.content}
          </div>

          {/* Footer Actions */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2">
              {/* Report Button */}
              <ReportButton targetType="answer" targetId={answer.id} />
            </div>
            {canAccept && !isAccepted && (
              <button
                onClick={() => onAccept(answer.id)}
                className="group/btn flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 transition-all hover:bg-emerald-500 hover:text-white"
              >
                <Check className="h-3 w-3 transition-transform group-hover/btn:scale-110" />
                Mark as Solution
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
