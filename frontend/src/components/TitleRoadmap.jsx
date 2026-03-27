// src/components/TitleRoadmap.jsx
import React, { useState } from "react";
import { Shield, Lock } from "lucide-react";

const TITLE_LEVELS = [
  { level: 0, title: "New Member", threshold: 0,  color: "#94A3B8" },
  { level: 1, title: "Helper",     threshold: 1,  color: "#10B981" },
  { level: 2, title: "Contributor",threshold: 5,  color: "#3B82F6" },
  { level: 3, title: "Knowledge Ally", threshold: 10, color: "#8B5CF6" },
  { level: 4, title: "Subject Guide",  threshold: 20, color: "#F59E0B" },
  { level: 5, title: "Trusted Mentor", threshold: 35, color: "#EF4444" },
  { level: 6, title: "Apex Scholar",   threshold: 50, color: "#F97316" },
];

export default function TitleRoadmap({ currentLevel = 0, acceptedCount = 0 }) {
  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="rounded-xl2 border border-white/50 bg-surface-base p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-5">
        <Shield className="h-5 w-5 text-brand-accent" />
        <h3 className="text-lg font-bold text-brand-deep">Title Roadmap</h3>
      </div>

      {/* Desktop: horizontal track */}
      <div className="hidden sm:block relative">
        {/* Track line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 mx-5" />

        {/* Filled portion */}
        <div
          className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-emerald-400 to-brand-accent transition-all duration-700"
          style={{
            width: currentLevel === 0
              ? "0%"
              : `${Math.min(((currentLevel) / (TITLE_LEVELS.length - 1)) * 100, 100)}%`,
          }}
        />

        {/* Nodes */}
        <div className="relative flex justify-between">
          {TITLE_LEVELS.map((lvl) => {
            const isEarned  = currentLevel >= lvl.level;
            const isCurrent = currentLevel === lvl.level;
            const isNext    = currentLevel + 1 === lvl.level;

            return (
              <div
                key={lvl.level}
                className="flex flex-col items-center gap-2 cursor-pointer"
                onMouseEnter={() => setTooltip(lvl.level)}
                onMouseLeave={() => setTooltip(null)}
              >
                {/* Node circle */}
                <div
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isEarned
                      ? "shadow-lg scale-105"
                      : isNext
                      ? "border-dashed border-gray-300 bg-white"
                      : "border-gray-200 bg-gray-50"
                  } ${isCurrent ? "ring-4 ring-offset-2" : ""}`}
                  style={{
                    borderColor: isEarned ? lvl.color : undefined,
                    backgroundColor: isEarned ? lvl.color : undefined,
                    "--tw-ring-color": isCurrent ? `${lvl.color}40` : undefined,
                  }}
                >
                  {isEarned ? (
                    <Shield className="h-4 w-4 text-white" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-gray-300" />
                  )}

                  {/* Pulse ring on current */}
                  {isCurrent && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping opacity-30"
                      style={{ backgroundColor: lvl.color }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-center text-[10px] font-bold leading-tight max-w-[60px] ${
                    isEarned ? "text-brand-deep" : "text-gray-400"
                  }`}
                >
                  {lvl.title}
                </span>

                {/* Tooltip */}
                {tooltip === lvl.level && (
                  <div className="absolute top-14 z-20 w-36 rounded-xl border border-gray-100 bg-white p-3 shadow-xl text-center">
                    <p className="text-xs font-bold text-brand-deep">{lvl.title}</p>
                    {lvl.threshold === 0 ? (
                      <p className="text-[10px] text-gray-500 mt-1">Starting title</p>
                    ) : (
                      <p className="text-[10px] text-gray-500 mt-1">
                        {isEarned
                          ? "✓ Earned"
                          : `${lvl.threshold} accepted answers`}
                      </p>
                    )}
                    {!isEarned && lvl.threshold > 0 && (
                      <p className="text-[10px] text-brand-accent font-semibold mt-1">
                        {Math.max(0, lvl.threshold - acceptedCount)} more to go
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: vertical list */}
      <div className="sm:hidden space-y-3">
        {TITLE_LEVELS.map((lvl) => {
          const isEarned  = currentLevel >= lvl.level;
          const isCurrent = currentLevel === lvl.level;
          return (
            <div key={lvl.level} className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
              isCurrent ? "bg-brand-accent/5 border border-brand-accent/20" : ""
            }`}>
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isEarned ? lvl.color : "#F1F5F9",
                }}
              >
                {isEarned
                  ? <Shield className="h-4 w-4 text-white" />
                  : <Lock className="h-3.5 w-3.5 text-gray-300" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${isEarned ? "text-brand-deep" : "text-gray-400"}`}>
                  {lvl.title}
                  {isCurrent && <span className="ml-2 text-[10px] font-semibold text-brand-accent">CURRENT</span>}
                </p>
                <p className="text-[10px] text-gray-400">
                  {lvl.threshold === 0
                    ? "Starting title"
                    : isEarned
                    ? "Earned"
                    : `${lvl.threshold} accepted answers required`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <p className="mt-5 text-center text-xs text-gray-400">
        {currentLevel >= 6
          ? "🏆 Maximum title achieved!"
          : `${acceptedCount} accepted answer${acceptedCount !== 1 ? "s" : ""} so far`}
      </p>
    </div>
  );
}