"use client";

import { useState } from "react";
import { LLMModel, getChatableModels } from "@/lib/models";
import { elizaRespond } from "@/lib/eliza";
import { Lang, t } from "@/lib/i18n";
import EraBadge from "./EraBadge";

interface CompareModeProps {
  lang: Lang;
  open: boolean;
  onClose: () => void;
  models: LLMModel[];
}

interface CompareResult {
  modelId: string;
  text: string;
  loading: boolean;
  error?: string;
}

export default function CompareMode({ lang, open, onClose, models }: CompareModeProps) {
  const chatable = models.filter((m) => m.mode !== "info-only");
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    // Default selection: ELIZA, GPT-3, Frontier (high contrast evolution)
    const defaults = ["eliza", "gpt3", "frontier"];
    return defaults.filter((id) => chatable.some((m) => m.id === id));
  });
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<CompareResult[]>([]);
  const [running, setRunning] = useState(false);

  if (!open) return null;

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 4
        ? prev
        : [...prev, id]
    );
  }

  async function run() {
    const text = prompt.trim();
    if (!text || selectedIds.length < 2 || running) return;
    setRunning(true);
    const initial: CompareResult[] = selectedIds.map((id) => ({
      modelId: id,
      text: "",
      loading: true,
    }));
    setResults(initial);

    await Promise.all(
      selectedIds.map(async (id) => {
        const model = chatable.find((m) => m.id === id);
        if (!model) return;

        // ELIZA — local
        if (model.mode === "eliza") {
          const reply = elizaRespond(text);
          // Token-stream feel
          const chunks = reply.split(/(\s+)/);
          let acc = "";
          for (const c of chunks) {
            await new Promise((r) => setTimeout(r, 25));
            acc += c;
            setResults((prev) =>
              prev.map((r) =>
                r.modelId === id ? { ...r, text: acc, loading: true } : r
              )
            );
          }
          setResults((prev) =>
            prev.map((r) => (r.modelId === id ? { ...r, loading: false } : r))
          );
          return;
        }

        // LLM — server stream
        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              modelId: id,
              messages: [{ role: "user", content: text }],
            }),
          });
          if (!res.ok) {
            const errBody = await res.json().catch(() => ({ error: "Network error" }));
            throw new Error(errBody.error || `HTTP ${res.status}`);
          }
          if (!res.body) throw new Error("No response body");

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let acc = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            acc += decoder.decode(value, { stream: true });
            setResults((prev) =>
              prev.map((r) =>
                r.modelId === id ? { ...r, text: acc, loading: true } : r
              )
            );
          }
          setResults((prev) =>
            prev.map((r) => (r.modelId === id ? { ...r, loading: false } : r))
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Error";
          setResults((prev) =>
            prev.map((r) =>
              r.modelId === id ? { ...r, error: msg, loading: false } : r
            )
          );
        }
      })
    );

    setRunning(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-amber-400">⏱</span>
              {t("compareModeTitle", lang)}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {t("compareModeDesc", lang)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-900"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Model picker */}
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono">
              {t("selectModelsToCompare", lang)}{" "}
              <span className="text-zinc-600">({selectedIds.length}/4)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {chatable.map((m) => {
                const sel = selectedIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggle(m.id)}
                    className={[
                      "px-3 py-1.5 rounded-lg border text-sm transition-colors flex items-center gap-2",
                      sel
                        ? "bg-amber-500/15 border-amber-500/50 text-amber-200"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700",
                    ].join(" ")}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{m.year}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt input */}
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono">
              {t("yourPrompt", lang)}
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              placeholder={
                lang === "tr"
                  ? "Örn: Türkiye'nin başkenti neresi?"
                  : "e.g. What is the capital of France?"
              }
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-amber-500/60 focus:outline-none resize-none"
            />
            <button
              onClick={run}
              disabled={
                !prompt.trim() || selectedIds.length < 2 || running
              }
              className="px-4 py-2 rounded-lg bg-amber-500 text-zinc-950 font-medium hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {running
                ? lang === "tr"
                  ? "Çalışıyor..."
                  : "Running..."
                : t("runComparison", lang)}
            </button>
            {selectedIds.length < 2 && (
              <div className="text-[11px] text-zinc-500">
                {t("pickAtLeastTwo", lang)}
              </div>
            )}
          </div>

          {/* Results columns */}
          {results.length > 0 && (
            <div
              className={[
                "grid gap-4 mt-4",
                results.length === 2 ? "grid-cols-1 md:grid-cols-2" : "",
                results.length === 3 ? "grid-cols-1 md:grid-cols-3" : "",
                results.length === 4 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "",
              ].join(" ")}
            >
              {results.map((r) => {
                const m = chatable.find((x) => x.id === r.modelId)!;
                return (
                  <div
                    key={r.modelId}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex flex-col min-h-[200px]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{m.emoji}</span>
                        <div>
                          <div className="text-sm font-semibold">{m.name}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            {m.year}
                          </div>
                        </div>
                      </div>
                      <EraBadge lang={lang} authentic={m.mode === "eliza"} />
                    </div>
                    <div className="flex-1 text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                      {r.error ? (
                        <span className="text-red-300 text-xs">{r.error}</span>
                      ) : r.text ? (
                        r.text
                      ) : (
                        <span className="text-zinc-600 inline-flex items-center gap-1">
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                        </span>
                      )}
                      {r.loading && r.text && (
                        <span className="inline-block w-1.5 h-3.5 bg-amber-400/70 ml-0.5 align-middle animate-pulse" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
