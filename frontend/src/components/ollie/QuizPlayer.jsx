// components/ollie/QuizPlayer.jsx
// Interactive quiz component
import React, { useState } from "react";
import { CheckCircle, XCircle, ChevronRight, Award, RotateCcw } from "lucide-react";
import OllieAvatar from "./OllieAvatar";

export default function QuizPlayer({ questions: rawQuestions, topic, onComplete, onRetry }) {
  // Fix 4: Filter out malformed questions before rendering
  // A valid question must have: question text, 4 options (A/B/C/D), a correct key that exists in options
  const questions = (rawQuestions || []).filter(q => {
    if (!q?.question || !q?.options || !q?.correct) return false;
    const keys = Object.keys(q.options);
    if (keys.length < 2) return false;
    if (!q.options[q.correct]) return false; // correct answer must exist in options
    return true;
  });

  const [current,   setCurrent]   = useState(0);
  const [selected,  setSelected]  = useState(null);
  const [revealed,  setRevealed]  = useState(false);
  const [answers,   setAnswers]   = useState([]); // {correct: bool}[]
  const [finished,  setFinished]  = useState(false);

  const q = questions[current];
  const score = answers.filter(a => a.correct).length;
  const percent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  // All questions were malformed — ask to retry
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center space-y-3">
        <p className="text-sm font-medium text-gray-500">
          Quiz generation had an issue — some questions were incomplete.
        </p>
        <button onClick={onRetry}
          className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          Try Again
        </button>
      </div>
    );
  }

  const handleSelect = (option) => {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);
    setAnswers(prev => [...prev, { correct: option === q.correct }]);
  };

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setFinished(true);
      onComplete?.(score, questions.length);
    }
  };

  const optionStyle = (key) => {
    if (!revealed) {
      return selected === key
        ? "border-brand-accent bg-brand-accent/5 text-brand-deep"
        : "border-gray-200 bg-white text-gray-700 hover:border-brand-accent/40";
    }
    if (key === q.correct) return "border-emerald-300 bg-emerald-50 text-emerald-800";
    if (key === selected && key !== q.correct) return "border-red-200 bg-red-50 text-red-700";
    return "border-gray-100 bg-gray-50 text-gray-400";
  };

  if (finished) {
    const passed = percent >= 70;
    return (
      <div className="flex flex-col items-center py-8 text-center space-y-4">
        <OllieAvatar size={64} animated={passed} />
        <div>
          <div className={`text-4xl font-extrabold ${passed ? "text-emerald-600" : "text-amber-600"}`}>
            {percent}%
          </div>
          <p className="text-lg font-bold text-brand-deep mt-1">
            {score}/{questions.length} correct
          </p>
        </div>
        <p className={`rounded-xl border px-4 py-3 text-sm font-medium max-w-xs ${
          passed
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-amber-200 bg-amber-50 text-amber-700"
        }`}>
          {passed
            ? `Great work! "${topic}" is now marked as covered. 🦉`
            : percent >= 50
            ? `Almost! Review "${topic}" once more and try again. 🦉`
            : `Let's go over "${topic}" again before retrying. 🦉`}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" /> Try Again
          </button>
          {passed && (
            <button
              onClick={() => onComplete?.(score, questions.length)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-500"
            >
              <Award className="h-4 w-4" /> Continue
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-brand-accent transition-all"
            style={{ width: `${((current) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-gray-500">
          {current + 1}/{questions.length}
        </span>
      </div>

      {/* Question */}
      <div className="rounded-xl2 border border-gray-100 bg-white p-5 shadow-soft">
        <p className="text-base font-bold text-brand-deep leading-snug">{q.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {Object.entries(q.options).map(([key, value]) => (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            disabled={revealed}
            className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${optionStyle(key)}`}
          >
            <span className="shrink-0 font-bold">{key}.</span>
            <span>{value}</span>
            {revealed && key === q.correct && (
              <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            )}
            {revealed && key === selected && key !== q.correct && (
              <XCircle className="ml-auto h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            )}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {revealed && (
        <div className="flex gap-3 rounded-xl border border-brand-accent/20 bg-brand-accent/5 p-4">
          <OllieAvatar size={28} />
          <p className="text-sm text-gray-700 leading-relaxed">{q.explanation}</p>
        </div>
      )}

      {/* Next */}
      {revealed && (
        <button
          onClick={handleNext}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-deep py-3 text-sm font-bold text-white hover:bg-brand-mid transition-colors"
        >
          {current + 1 < questions.length ? "Next Question" : "See Results"}
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}