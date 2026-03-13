// src/components/AnswerForm.jsx
import { useState } from "react";
import { Send, PenLine } from "lucide-react";

export default function AnswerForm({ onSubmit, disabled }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    await onSubmit(content);
    setContent("");
    setLoading(false);
  }

  if (disabled) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
        You must be logged in or not be the author to answer this question.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="group relative">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-deep">
        <PenLine className="h-4 w-4 text-brand-accent" />
        <span>Write your answer</span>
      </div>
      
      <div className="relative">
        <textarea
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your explanation clearly here..."
          className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-accent/10 transition-all"
        />
        
        {/* Floating Action Button for Submit */}
        <div className="absolute bottom-3 right-3">
          <button
            disabled={loading || !content.trim()}
            className="flex items-center gap-2 rounded-lg bg-brand-accent px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:bg-blue-600 hover:shadow-blue-500/40 disabled:scale-100 disabled:bg-gray-300 disabled:shadow-none"
          >
            {loading ? (
              <span className="animate-pulse">Posting...</span>
            ) : (
              <>
                <span>Post Answer</span>
                <Send className="h-3 w-3" />
              </>
            )}
          </button>
        </div>
      </div>
      
      <p className="mt-2 text-xs text-gray-400">
        Markdown styling is supported. Be polite and helpful.
      </p>
    </form>
  );
}