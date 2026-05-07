"use client";

import { Lang, t } from "@/lib/i18n";

interface EraBadgeProps {
  lang: Lang;
  authentic?: boolean; // ELIZA = true (real implementation), others = false (LLM-simulated)
}

export default function EraBadge({ lang, authentic = false }: EraBadgeProps) {
  if (authentic) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
        <span className="w-1 h-1 rounded-full bg-emerald-400" />
        {t("authentic", lang)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
      <span className="w-1 h-1 rounded-full bg-amber-400" />
      {t("eraSimulation", lang)}
    </span>
  );
}
