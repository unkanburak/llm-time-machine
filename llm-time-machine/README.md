# LLM Time Machine

> 1966 → 2026, sohbet ederek öğren — chat with LLMs across history.

An interactive timeline where users **chat with historical LLM eras** to feel how
prompting, style, and limitations evolved. Built for **Teknofest / Cursor Hackathon**.

**Pitch (TR)**: 60 yıllık LLM evrimini, aynı soruyu farklı dönem “modellerine” sorarak canlı deneyimletir.  
**Pitch (EN)**: Experience 60 years of LLM evolution by asking the *same prompt* across eras and comparing responses.

## What it does

- **Timeline of 9 models** from ELIZA (1966) to frontier 2025-2026 LLMs.
- **Chat with each era**: ELIZA runs as authentic rule-based pattern matching;
  GPT-2/3/ChatGPT/GPT-4/Frontier are simulated by Claude Haiku 4.5 with
  era-calibrated system prompts (knowledge cutoffs, style, quirks, max-tokens).
- **Compare mode**: ask one prompt to 2-4 models and watch the responses stream
  side-by-side. The contrast tells the story.
- **Bilingual**: TR/EN toggle, top right.
- **Info panel**: parameters, architecture, training data, key innovation,
  paper link for every model.
- **Suggested prompts**: each chat-enabled model ships with **2 technical + 2 fun**
  one-click prompts to help the jury trigger era-specific behavior fast.

## Stack

- Next.js 14 (App Router) + TypeScript
- TailwindCSS 3
- Anthropic SDK (`claude-haiku-4-5` for all simulated personas)
- No database, no auth, all state client-side
- ELIZA implemented as real pattern matching in `lib/eliza.ts` (no LLM)

## Setup

Create a local env file:

```bash
cp .env.example .env.local
```

Then put your key in `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-...
```

Run the app:

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Quick demo (jury script, ~3 minutes)

Use the one-click suggested prompts inside each model chat. For maximum impact,
use **Compare Mode** for the last two.

1. **ELIZA** → (Fun) "Son zamanlarda endişelenmeyi durduramıyorum."
   - Talking point: *"1966: LLM yok. Sadece kurallar — ama hâlâ insan gibi hissettiriyor."*

2. **GPT-2** → (Technical) "Wikipedia tarzı giriş: Başlık: İstanbul..."
   - Talking point: *"2019: metin tamamlama var, sohbet yok; hızlıca dağılıyor."*

3. **ChatGPT (2022)** → (Fun) "2022 Dünya Kupası'nı kim kazandı?"
   - Talking point: *"Cutoff devreye giriyor. Kullanıcıyla konuşuyor ama bilgisi sınırlı."*

4. **Compare Mode (default: ELIZA + GPT‑3 + Frontier)** → "Fransa'nın başkenti neresi?"
   - Talking point: *"Aynı soru, 3 dönem, 3 farklı ‘zeka hissi’."*

5. **Compare Mode** → "2022'de ne oldu?"
   - Talking point: *"Kesim tarihini (knowledge cutoff) tek ekranda gösterir."*

## Demo Script (5-prompt jury walkthrough, ~3 minutes)

These prompts are chosen to make era differences vivid. Use Compare Mode for the
last two — they hit hardest side-by-side.

1. **Pick ELIZA → "I'm feeling sad today"**
   - Watch authentic 1966 Rogerian reflection. Emotional, rule-based, no LLM.
   - Talking point: *"60 yıl önceki bir psikoterapist taklidi — hâlâ insan gibi geliyor."*

2. **Pick GPT-2 → "Once upon a time"**
   - Sees coherent start, drifts mid-sentence, repeats phrases. Era-accurate chaos.
   - Talking point: *"2019: ölçek var ama anlam tutarsız."*

3. **Pick ChatGPT → "Who won the 2022 World Cup?"**
   - "My training data only goes up to September 2021..." — knowledge cutoff.
   - Bonus: "Explain quantum computing" → verbose, bullet-heavy, "Certainly!" opener.
   - Talking point: *"RLHF geldi, model artık konuşkan ama hâlâ sınırları var."*

4. **Compare Mode: ELIZA + GPT-2 + ChatGPT + Frontier → "What is the capital of France?"**
   - 4 dönemden 4 cevap aynı anda akar. ELIZA cevap veremez, GPT-2 doğru başlar
     dağılır, ChatGPT verbose, Frontier net ve kalibre.
   - Talking point: *"İşte 60 yılda olan bu."*

5. **Compare Mode: ChatGPT + GPT-4 + Frontier → "What is GPT-5?"**
   - ChatGPT bilmiyor (cutoff 2021), GPT-4 belirsiz (cutoff 2023), Frontier ne
     olduğunu açıklıyor. Bilgi sınırlarının evrimi tek ekranda.
   - Closing line: *"Promptlama bugün bir sanat, kuralları her nesilde değişti.
     Bu bir ışınlanma kapsülü — geçmişi yaşamadan bugünü doğru anlamak zor."*

## File structure

```
app/
  layout.tsx                 → root layout, dark mode
  page.tsx                   → main view (header + timeline + chat + info)
  globals.css                → tailwind + custom animations
  api/chat/route.ts          → POST /api/chat — Anthropic streaming proxy
components/
  Timeline.tsx               → horizontal scrollable model cards
  ChatPanel.tsx              → chat UI + streaming + 2 technical + 2 fun prompt chips
  InfoPanel.tsx              → right sidebar metadata + visible knowledge cutoff
  CompareMode.tsx            → modal, parallel streams to multiple models
  EraBadge.tsx               → "Era Simulation" / "Authentic" badge
lib/
  models.ts                  → 9 historical models + persona system prompts
  eliza.ts                   → real Rogerian pattern matching (TR + EN)
  personaPrompt.ts           → wraps persona instructions with hardening rules
  i18n.ts                    → TR/EN string table
```

## Persona engineering — the secret sauce

Each historical LLM (GPT-2 onward) is implemented as a `claude-haiku-4-5`
instance with a carefully tuned system prompt that enforces:

- **Knowledge cutoff** — explicitly refuse / hallucinate post-cutoff facts
- **Style** — completion-style for GPT-2/3, verbose+apologetic for ChatGPT,
  step-by-step for GPT-4, calibrated for Frontier
- **Capabilities** — no tools / no internet for older models
- **Max tokens** — lower for older models (GPT-2 = 100, ChatGPT = 450)
- **Temperature** — higher for chaos-prone older models, lower for precise newer
- **Character lock** — refuse to break role even when asked

ELIZA does NOT use the LLM — it's a real (simplified) implementation of
Weizenbaum's DOCTOR script in `lib/eliza.ts`, with bilingual rule sets.

## Notes

- API key in `.env.local` is git-ignored. **Revoke the demo key after the
  hackathon** — it's been pasted around.
- Compare Mode default selection is **ELIZA + GPT‑3 + Frontier** for a clean
  “rules → few-shot completion → modern frontier” evolution arc.
- The "Era Simulation" amber badge is intentional honesty — we tell the jury
  *up front* that older models are simulated by a modern one, so they trust
  the rest.
