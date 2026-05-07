"use client";

import { useState } from "react";
import { MODELS, getModelById } from "@/lib/models";
import { Lang, t } from "@/lib/i18n";
import Timeline from "@/components/Timeline";
import ChatPanel from "@/components/ChatPanel";
import InfoPanel from "@/components/InfoPanel";
import CompareMode from "@/components/CompareMode";

export default function Home() {
  const [lang, setLang] = useState<Lang>("tr");
  const [selectedId, setSelectedId] = useState<string | null>("eliza");
  const [compareOpen, setCompareOpen] = useState(false);

  const selected = selectedId ? getModelById(selectedId) : null;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 bg-grid">
      {/* Top bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⏱</div>
            <div>
              <h1 className="text-base font-bold font-mono tracking-tight">
                {t("appTitle", lang)}
              </h1>
              <p className="text-[11px] text-zinc-500 leading-tight">
                {t("tagline", lang)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 hover:border-amber-500/50 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <span>⚖</span>
              <span className="hidden sm:inline">{t("compareMode", lang)}</span>
            </button>
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden text-xs font-mono">
              <button
                onClick={() => setLang("tr")}
                className={[
                  "px-2.5 py-1.5 transition-colors",
                  lang === "tr"
                    ? "bg-amber-500/20 text-amber-300"
                    : "text-zinc-500 hover:text-zinc-300",
                ].join(" ")}
              >
                TR
              </button>
              <button
                onClick={() => setLang("en")}
                className={[
                  "px-2.5 py-1.5 transition-colors",
                  lang === "en"
                    ? "bg-amber-500/20 text-amber-300"
                    : "text-zinc-500 hover:text-zinc-300",
                ].join(" ")}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-5 py-5 flex flex-col gap-5">
        {/* Tagline / hero */}
        {!selected && (
          <div className="text-center py-8">
            <p className="text-zinc-400 max-w-2xl mx-auto">
              {t("subtagline", lang)}
            </p>
          </div>
        )}

        {/* Timeline */}
        <Timeline
          models={MODELS}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
        />

        {/* Split: Chat + Info */}
        {selected ? (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 min-h-[600px]">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
              <ChatPanel model={selected} lang={lang} />
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
              <InfoPanel model={selected} lang={lang} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            {t("selectFromTimeline", lang)}
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-900/60 mt-6">
        <div className="max-w-[1400px] mx-auto px-5 py-3 text-[11px] text-zinc-600 font-mono flex items-center justify-between">
          <span>LLM Time Machine · Teknofest 2026</span>
          <span className="text-zinc-700">claude-haiku-4-5 · era-simulated personas</span>
        </div>
      </footer>

      <CompareMode
        lang={lang}
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        models={MODELS}
      />
    </div>
  );
}
