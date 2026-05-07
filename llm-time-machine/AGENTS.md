# LLM Time Machine — Project Conventions

- Stack: Next.js 14 App Router + TypeScript + TailwindCSS 3 + Anthropic SDK.
- Single LLM under the hood: `claude-haiku-4-5`. Different "historical models" are
  era-calibrated personas via system prompts in `lib/models.ts`.
- ELIZA is real rule-based pattern matching in `lib/eliza.ts`, not LLM-based.
- API key from `.env.local`, used only in `/app/api/chat/route.ts`.
- All UI state is client-side (useState). No DB, no auth, no localStorage.
- Bilingual TR/EN via `lib/i18n.ts`.
