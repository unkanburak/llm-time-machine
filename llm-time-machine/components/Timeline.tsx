"use client";

import { LLMModel } from "@/lib/models";

interface TimelineProps {
  models: LLMModel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function Timeline({ models, selectedId, onSelect }: TimelineProps) {
  return (
    <div className="relative w-full">
      {/* connecting line */}
      <div
        className="absolute left-0 right-0 top-[42px] h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent"
        aria-hidden
      />
      <div className="timeline-scroll flex gap-3 overflow-x-auto pb-4 px-1">
        {models.map((m) => {
          const isSelected = m.id === selectedId;
          const isInfoOnly = m.mode === "info-only";
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={[
                "relative flex-shrink-0 w-[150px] snap-start rounded-xl border p-3 text-left transition-all",
                "hover:border-amber-500/50 hover:bg-zinc-900",
                isSelected
                  ? "border-amber-500 bg-zinc-900 shadow-lg shadow-amber-500/10"
                  : "border-zinc-800 bg-zinc-950/40",
                isInfoOnly ? "opacity-80" : "",
              ].join(" ")}
            >
              {/* dot on the timeline */}
              <div className="flex justify-center mb-2 relative">
                <div
                  className={[
                    "w-9 h-9 rounded-full flex items-center justify-center text-lg z-10",
                    isSelected
                      ? "bg-amber-500/20 ring-2 ring-amber-500"
                      : "bg-zinc-900 ring-1 ring-zinc-700",
                  ].join(" ")}
                >
                  <span aria-hidden>{m.emoji}</span>
                </div>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">
                {m.year}
              </div>
              <div className="text-sm font-semibold text-zinc-100 leading-tight mt-0.5">
                {m.name}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1 truncate">
                {m.params === "—" ? m.architecture.split(" ")[0] : m.params}
              </div>
              {isInfoOnly && (
                <div className="absolute top-2 right-2 text-[9px] uppercase tracking-wider text-zinc-500 bg-zinc-800/80 px-1.5 py-0.5 rounded">
                  info
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
