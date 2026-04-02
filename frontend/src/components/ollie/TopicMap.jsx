// components/ollie/TopicMap.jsx
// Visual grid of all syllabus topics showing covered/weak/pending status
import React from "react";
import { CheckCircle, AlertCircle, Circle, Zap } from "lucide-react";

function TopicChip({ topic, status, onClick, isSelected }) {
  const styles = {
    covered: "border-emerald-200 bg-emerald-50 text-emerald-700",
    weak:    "border-amber-200 bg-amber-50 text-amber-700",
    pending: "border-gray-200 bg-white text-gray-600 hover:border-brand-accent/40 hover:bg-brand-accent/5",
  };

  const icons = {
    covered: <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />,
    weak:    <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />,
    pending: <Circle className="h-3.5 w-3.5 text-gray-300 shrink-0" />,
  };

  return (
    <button
      onClick={() => onClick(topic)}
      className={`group flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all ${styles[status]} ${
        isSelected ? "ring-2 ring-brand-accent ring-offset-1" : ""
      }`}
    >
      {icons[status]}
      <span className="leading-snug">{topic.name}</span>
      <span className="ml-auto shrink-0 rounded-md bg-black/5 px-1.5 py-0.5 text-[10px] font-bold">
        U{topic.unit}
      </span>
    </button>
  );
}

export default function TopicMap({ topics, coveredTopics, weakTopics, selectedTopic, onTopicSelect }) {
  const getStatus = (topic) => {
    if (coveredTopics.includes(topic.name)) return "covered";
    if (weakTopics.includes(topic.name))    return "weak";
    return "pending";
  };

  const total    = topics.length;
  const covered  = topics.filter(t => coveredTopics.includes(t.name)).length;
  const weak     = topics.filter(t => weakTopics.includes(t.name)).length;
  const percent  = total > 0 ? Math.round((covered / total) * 100) : 0;

  // Group by unit
  const byUnit = topics.reduce((acc, t) => {
    const u = t.unit || 1;
    if (!acc[u]) acc[u] = [];
    acc[u].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="rounded-xl2 border border-white/50 bg-surface-base p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-brand-accent" />
            <span className="text-sm font-bold text-brand-deep">Syllabus Progress</span>
          </div>
          <span className="text-sm font-bold text-brand-accent">{percent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-accent to-emerald-500 transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />
            {covered} covered
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />
            {weak} needs work
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-gray-300 inline-block" />
            {total - covered - weak} pending
          </span>
        </div>
      </div>

      {/* Topics by unit */}
      {Object.entries(byUnit).map(([unit, unitTopics]) => (
        <div key={unit}>
          <h4 className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Unit {unit}
          </h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {unitTopics.map(topic => (
              <TopicChip
                key={topic.name}
                topic={topic}
                status={getStatus(topic)}
                onClick={onTopicSelect}
                isSelected={selectedTopic?.name === topic.name}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}