"use client";

import { useEffect, useRef, useState } from "react";
import { LLMModel } from "@/lib/models";
import { elizaRespond } from "@/lib/eliza";
import { Lang, t } from "@/lib/i18n";
import EraBadge from "./EraBadge";

type Msg = { role: "user" | "assistant"; content: string };

interface ChatPanelProps {
  model: LLMModel;
  lang: Lang;
}

export default function ChatPanel({ model, lang }: ChatPanelProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset chat when model changes
  useEffect(() => {
    setMessages([]);
    setInput("");
    setError(null);
    setStreaming(false);
  }, [model.id]);

  // Auto-scroll to bottom on new content
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  if (model.mode === "info-only") {
    return <InfoOnlyView model={model} lang={lang} />;
  }

  async function send(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || streaming) return;

    const newMessages: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setError(null);
    setStreaming(true);

    // ELIZA: client-side, no API call needed
    if (model.mode === "eliza") {
      // Slight delay for feel
      const reply = elizaRespond(text);
      let acc = "";
      const chunks = reply.split(/(\s+)/);
      // Add empty assistant message and stream tokens
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      for (const c of chunks) {
        await new Promise((r) => setTimeout(r, 30));
        acc += c;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
      setStreaming(false);
      return;
    }

    // LLM: streaming fetch
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId: model.id, messages: newMessages }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: "Network error" }));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }
      if (!res.body) throw new Error("No response body");

      // Add placeholder assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        acc += chunk;
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      // Remove the empty assistant placeholder if any
      setMessages((prev) => {
        if (prev.length && prev[prev.length - 1].role === "assistant" && prev[prev.length - 1].content === "") {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const isAuthentic = model.mode === "eliza";
  const showSuggestions = messages.length === 0 && !streaming;

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-900 ring-1 ring-zinc-800 flex items-center justify-center text-lg">
            {model.emoji}
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">{model.name}</div>
            <div className="text-[11px] text-zinc-500 font-mono">
              {model.year} · {model.org.split(" — ")[0]}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded transition-colors"
            >
              {t("clearChat", lang)}
            </button>
          )}
          <EraBadge lang={lang} authentic={isAuthentic} />
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {showSuggestions && model.suggestedPrompts.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            <PromptGroup
              label={t("technical", lang)}
              hint={t("technicalHint", lang)}
              accent="amber"
              prompts={model.suggestedPrompts.filter((p) => p.category === "technical")}
              lang={lang}
              onPick={send}
            />
            <PromptGroup
              label={t("social", lang)}
              hint={t("socialHint", lang)}
              accent="zinc"
              prompts={model.suggestedPrompts.filter((p) => p.category === "social")}
              lang={lang}
              onPick={send}
            />
          </div>
        )}

        {messages.map((m, i) => (
          <Message key={i} msg={m} model={model} lang={lang} />
        ))}

        {streaming && messages[messages.length - 1]?.role === "user" && (
          <div className="animate-fade-in">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5 font-mono">
              {model.name}
            </div>
            <div className="text-zinc-400 inline-flex items-center gap-1">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 space-y-2 animate-fade-in">
            <div className="text-sm font-semibold text-red-300">
              {t("errorTitle", lang)}
            </div>
            <div className="text-xs text-red-200/80">{error}</div>
            <button
              onClick={() => {
                setError(null);
                const lastUser = [...messages].reverse().find((m) => m.role === "user");
                if (lastUser) send(lastUser.content);
              }}
              className="text-xs text-red-300 hover:text-red-200 underline mt-1"
            >
              {t("retry", lang)}
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800/80 p-3 bg-zinc-950">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("inputPlaceholder", lang)}
            rows={1}
            className="flex-1 resize-none bg-zinc-900 text-zinc-100 rounded-lg border border-zinc-800 focus:border-amber-500/60 focus:outline-none px-3 py-2 text-sm placeholder:text-zinc-600 max-h-32"
            style={{ minHeight: "40px" }}
            disabled={streaming}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || streaming}
            className="px-4 py-2 rounded-lg bg-amber-500 text-zinc-950 font-medium hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {t("send", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

function Message({
  msg,
  model,
  lang,
}: {
  msg: Msg;
  model: LLMModel;
  lang: Lang;
}) {
  const isUser = msg.role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-amber-500/15 border border-amber-500/20 text-zinc-100 px-4 py-2.5 text-sm whitespace-pre-wrap">
          {msg.content}
        </div>
      </div>
    );
  }
  return (
    <div className="animate-fade-in">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5 font-mono flex items-center gap-2">
        <span>{model.name}</span>
      </div>
      <div className="text-zinc-200 text-sm whitespace-pre-wrap leading-relaxed">
        {msg.content}
      </div>
      {msg.content && (
        <div className="mt-1.5">
          <EraBadge lang={lang} authentic={model.mode === "eliza"} />
        </div>
      )}
    </div>
  );
}

function PromptGroup({
  label,
  hint,
  accent,
  prompts,
  lang,
  onPick,
}: {
  label: string;
  hint: string;
  accent: "amber" | "zinc";
  prompts: { en: string; tr: string }[];
  lang: Lang;
  onPick: (text: string) => void;
}) {
  if (prompts.length === 0) return null;
  const accentClasses =
    accent === "amber"
      ? "text-amber-400/90"
      : "text-zinc-400";
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <div className={`text-[11px] uppercase tracking-widest font-mono ${accentClasses}`}>
          {label}
        </div>
        <div className="text-[10px] text-zinc-600">{hint}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {prompts.map((p, i) => {
          const text = lang === "tr" ? p.tr : p.en;
          return (
            <button
              key={i}
              onClick={() => onPick(text)}
              className="text-sm text-zinc-300 bg-zinc-900 hover:bg-zinc-800 hover:text-amber-300 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-amber-500/40 transition-colors text-left max-w-md whitespace-pre-line"
            >
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InfoOnlyView({ model, lang }: { model: LLMModel; lang: Lang }) {
  const noChat = model.noChatReason
    ? lang === "tr"
      ? model.noChatReason.tr
      : model.noChatReason.en
    : t("noChatAvailable", lang);
  const innovation = lang === "tr" ? model.keyInnovationTr : model.keyInnovation;
  const hl = model.infoHighlights;

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-900 ring-1 ring-zinc-800 flex items-center justify-center text-lg">
            {model.emoji}
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">{model.name}</div>
            <div className="text-[11px] text-zinc-500 font-mono">
              {model.year} · {model.org.split(" — ")[0]}
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-blue-300/80 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
          <span className="w-1 h-1 rounded-full bg-blue-400" />
          info
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Hero quote */}
        {hl && (
          <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-5">
            <div className="text-[10px] uppercase tracking-widest text-amber-400/80 font-mono mb-2">
              {t("keyInnovation", lang)}
            </div>
            <div className="text-xl md:text-2xl font-semibold text-amber-100 leading-snug">
              {lang === "tr" ? hl.hero.tr : hl.hero.en}
            </div>
            {hl.heroSubtitle && (
              <div className="text-sm text-zinc-400 mt-3 leading-relaxed">
                {lang === "tr" ? hl.heroSubtitle.tr : hl.heroSubtitle.en}
              </div>
            )}
          </div>
        )}

        {/* Examples */}
        {hl?.examples && hl.examples.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
              {t("examples", lang)}
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {hl.examples.map((ex, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2.5 text-sm text-zinc-300 font-mono leading-relaxed"
                >
                  {lang === "tr" ? ex.tr : ex.en}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Why no chat */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1.5">
            {t("whyNoChat", lang)}
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">{noChat}</p>
        </div>

        {/* Legacy */}
        {hl && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="text-[10px] uppercase tracking-widest text-emerald-400/80 font-mono mb-1.5">
              {t("legacy", lang)}
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed">
              {lang === "tr" ? hl.legacy.tr : hl.legacy.en}
            </p>
          </div>
        )}

        {/* Fallback when no infoHighlights */}
        {!hl && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="text-base text-zinc-200 leading-relaxed">{innovation}</div>
          </div>
        )}

        {/* Paper CTA */}
        <a
          href={model.paperUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-amber-500/40 p-3 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                {t("paper", lang)}
              </div>
              <div className="text-sm text-zinc-300 group-hover:text-amber-300 mt-0.5 break-all">
                {model.paperUrl.replace(/^https?:\/\//, "").slice(0, 60)}
                {model.paperUrl.length > 60 ? "..." : ""}
              </div>
            </div>
            <span className="text-zinc-600 group-hover:text-amber-400">→</span>
          </div>
        </a>
      </div>
    </div>
  );
}
