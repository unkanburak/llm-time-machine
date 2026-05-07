"use client";

import { LLMModel } from "@/lib/models";
import { Lang, t } from "@/lib/i18n";

interface InfoPanelProps {
  model: LLMModel;
  lang: Lang;
}

export default function InfoPanel({ model, lang }: InfoPanelProps) {
  const innovation = lang === "tr" ? model.keyInnovationTr : model.keyInnovation;
  const trainingData = lang === "tr" ? model.trainingDataTr : model.trainingData;

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 ring-1 ring-zinc-800 flex items-center justify-center text-2xl">
            {model.emoji}
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-amber-400/80 font-mono">
              {model.year}
            </div>
            <div className="text-xl font-semibold">{model.name}</div>
          </div>
        </div>
        <div className="text-xs text-zinc-400">{model.org}</div>
        <div className="pt-1">
          <div className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
            <div className="text-[10px] uppercase tracking-widest font-mono text-amber-300">
              {t("cutoffWarning", lang)}
            </div>
            <div className="text-sm font-semibold text-amber-100 font-mono">
              {model.knowledgeCutoffYear}
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-zinc-800" />

      {/* Key Innovation — featured */}
      <Section
        label={t("keyInnovation", lang)}
        accent
      >
        <p className="text-sm text-zinc-200 leading-relaxed">{innovation}</p>
      </Section>

      <Section label={t("parameters", lang)}>
        <code className="text-sm text-amber-300 font-mono">{model.params}</code>
      </Section>

      <Section label={t("architecture", lang)}>
        <p className="text-sm text-zinc-300">{model.architecture}</p>
      </Section>

      <Section label={t("trainingData", lang)}>
        <p className="text-sm text-zinc-300">{trainingData}</p>
      </Section>

      <Section label={t("paper", lang)}>
        <a
          href={model.paperUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-amber-400 hover:text-amber-300 underline underline-offset-2 break-all"
        >
          {model.paperUrl.replace(/^https?:\/\//, "").slice(0, 60)}
          {model.paperUrl.length > 60 ? "..." : ""}
        </a>
      </Section>

      {model.mode === "info-only" && model.noChatReason && (
        <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono mb-1.5">
            {t("noChat", lang)}
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {lang === "tr" ? model.noChatReason.tr : model.noChatReason.en}
          </p>
        </div>
      )}
    </div>
  );
}

function Section({
  label,
  children,
  accent,
}: {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div
        className={[
          "text-[10px] uppercase tracking-widest font-mono",
          accent ? "text-amber-400" : "text-zinc-500",
        ].join(" ")}
      >
        {label}
      </div>
      {children}
    </div>
  );
}
