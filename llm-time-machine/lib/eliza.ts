// ELIZA — Joseph Weizenbaum, 1966.
// Simplified Rogerian therapist using pattern matching.
// Bilingual: detects Turkish vs English by simple keyword presence and switches rules.

type ElizaRule = {
  pattern: RegExp;
  responses: string[];
};

// Word reflection ("I" → "you", "my" → "your", etc.)
const REFLECT_EN: Record<string, string> = {
  "i": "you",
  "me": "you",
  "my": "your",
  "mine": "yours",
  "am": "are",
  "i'm": "you are",
  "i've": "you have",
  "i'll": "you will",
  "you": "I",
  "your": "my",
  "yours": "mine",
  "are": "am",
  "were": "was",
  "myself": "yourself",
  "yourself": "myself",
};

const REFLECT_TR: Record<string, string> = {
  "ben": "sen",
  "beni": "seni",
  "bana": "sana",
  "benim": "senin",
  "benden": "senden",
  "bende": "sende",
  "sen": "ben",
  "seni": "beni",
  "sana": "bana",
  "senin": "benim",
  "senden": "benden",
  "sende": "bende",
};

function reflect(text: string, dict: Record<string, string>): string {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((w) => {
      const cleaned = w.replace(/[.,!?;:]$/, "");
      const punct = w.slice(cleaned.length);
      return (dict[cleaned] ?? cleaned) + punct;
    })
    .join(" ");
}

const RULES_EN: ElizaRule[] = [
  {
    pattern: /\bi (?:feel|am feeling|am) (.+)/i,
    responses: [
      "Why do you feel {0}?",
      "Tell me more about feeling {0}.",
      "How long have you felt {0}?",
      "Do you often feel {0}?",
    ],
  },
  {
    pattern: /\bi (?:think|believe|guess) (.+)/i,
    responses: [
      "Why do you think {0}?",
      "What makes you believe {0}?",
      "Do you really think so?",
    ],
  },
  {
    pattern: /\bi (?:want|need|wish) (.+)/i,
    responses: [
      "What would it mean if you had {0}?",
      "Why do you want {0}?",
      "What would happen if you got {0}?",
    ],
  },
  {
    pattern: /\bi (?:can't|cannot|can not) (.+)/i,
    responses: [
      "Why can't you {0}?",
      "Have you tried?",
      "What would happen if you could {0}?",
    ],
  },
  {
    pattern: /\b(?:my |the )?(?:mother|father|mom|dad|parents|sister|brother|wife|husband|family) (.+)/i,
    responses: [
      "Tell me more about your family.",
      "How does that make you feel?",
      "Why do you say that about them?",
    ],
  },
  {
    pattern: /\bi remember (.+)/i,
    responses: [
      "Do you often think of {0}?",
      "Why do you remember {0} just now?",
      "What else do you remember?",
    ],
  },
  {
    pattern: /\bi (?:dreamt|dreamed|had a dream) (.+)?/i,
    responses: [
      "What does that dream suggest to you?",
      "Do you dream often?",
      "Tell me more about your dream.",
    ],
  },
  {
    pattern: /\b(?:sad|depressed|unhappy|lonely|alone)\b/i,
    responses: [
      "I'm sorry to hear that. Tell me more.",
      "Why do you feel this way?",
      "What do you think is making you feel like this?",
    ],
  },
  {
    pattern: /\b(?:happy|glad|joyful|excited)\b/i,
    responses: [
      "What is making you feel that way?",
      "Tell me what brings you joy.",
    ],
  },
  {
    pattern: /\byes\b/i,
    responses: ["You seem certain. Why?", "Can you elaborate?", "I see."],
  },
  {
    pattern: /\bno\b/i,
    responses: ["Why not?", "Are you sure?", "Why do you say no?"],
  },
  {
    pattern: /\bhello|hi|hey\b/i,
    responses: ["Hello. What brings you here today?", "Hi. How are you feeling?"],
  },
  {
    pattern: /\?\s*$/,
    responses: [
      "Why do you ask?",
      "What do you think?",
      "Does that question interest you?",
    ],
  },
];

const RULES_TR: ElizaRule[] = [
  {
    pattern: /\b(?:hissediyorum|hissediyom)\b\s*(.*)/i,
    responses: [
      "Neden böyle hissediyorsun?",
      "Bana bu hissinden biraz daha bahset.",
      "Bu hissi ne kadar süredir taşıyorsun?",
    ],
  },
  {
    pattern: /\bben (.+) hissediyorum/i,
    responses: [
      "Neden {0} hissediyorsun?",
      "{0} hissetmek hakkında biraz daha konuş.",
    ],
  },
  {
    pattern: /\bben (.+)yim$/i,
    responses: ["Neden {0}sın?", "{0} olmak nasıl bir his?"],
  },
  {
    pattern: /\b(?:üzgün|mutsuz|yalnız|kötü|berbat)\b/i,
    responses: [
      "Bunu duyduğuma üzüldüm. Biraz daha anlatır mısın?",
      "Neden böyle hissediyorsun?",
      "Sence buna ne sebep oluyor?",
    ],
  },
  {
    pattern: /\b(?:mutlu|sevinçli|harika|güzel)\b/i,
    responses: [
      "Seni böyle hissettiren ne?",
      "Sana ne mutluluk veriyor anlat bakalım.",
    ],
  },
  {
    pattern: /\b(?:annem|babam|kardeşim|ablam|abim|eşim|ailem)\b/i,
    responses: [
      "Ailen hakkında biraz daha anlat.",
      "Bu seni nasıl hissettiriyor?",
      "Onlar hakkında neden böyle düşünüyorsun?",
    ],
  },
  {
    pattern: /\brüyamda (.+)/i,
    responses: [
      "Bu rüya sana ne çağrıştırıyor?",
      "Sık rüya görür müsün?",
      "Rüyandaki {0} hakkında biraz daha konuş.",
    ],
  },
  {
    pattern: /\b(?:istiyorum|isterim|isterdim)\b\s*(.*)/i,
    responses: [
      "Bunu elde edersen ne değişir?",
      "Neden bunu istiyorsun?",
    ],
  },
  {
    pattern: /\b(?:yapamıyorum|edemiyorum|yapamam)\b/i,
    responses: [
      "Neden yapamıyorsun?",
      "Denedin mi peki?",
      "Yapabilseydin ne olurdu?",
    ],
  },
  {
    pattern: /\bevet\b/i,
    responses: ["Çok eminsin. Neden?", "Açar mısın biraz?", "Anlıyorum."],
  },
  {
    pattern: /\bhayır\b/i,
    responses: ["Neden hayır?", "Emin misin?", "Neden böyle düşünüyorsun?"],
  },
  {
    pattern: /\b(?:merhaba|selam|sa)\b/i,
    responses: [
      "Merhaba. Bugün seni buraya ne getirdi?",
      "Selam. Nasıl hissediyorsun?",
    ],
  },
  {
    pattern: /\?\s*$/,
    responses: [
      "Neden bunu soruyorsun?",
      "Sen ne düşünüyorsun?",
      "Bu soru senin için önemli mi?",
    ],
  },
];

const FALLBACKS_EN = [
  "Please tell me more.",
  "Can you elaborate on that?",
  "How does that make you feel?",
  "Why do you say that?",
  "I see. Go on.",
  "What do you think that means?",
  "Let's explore that further.",
];

const FALLBACKS_TR = [
  "Lütfen biraz daha anlat.",
  "Bunu biraz açar mısın?",
  "Bu seni nasıl hissettiriyor?",
  "Bunu neden söylüyorsun?",
  "Anlıyorum. Devam et.",
  "Sence bu ne anlama geliyor?",
  "Bunu biraz daha konuşalım.",
];

function detectLang(text: string): "tr" | "en" {
  // Heuristic: presence of Turkish-specific characters or common TR words
  const turkishChars = /[çğıöşüÇĞİÖŞÜ]/;
  const turkishWords = /\b(ben|sen|nasıl|merhaba|evet|hayır|bir|var|yok|annem|babam|hissediyorum|üzgün|mutlu|istiyorum)\b/i;
  if (turkishChars.test(text) || turkishWords.test(text)) return "tr";
  return "en";
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function elizaRespond(userInput: string): string {
  const trimmed = userInput.trim();
  if (!trimmed) {
    return pickRandom(FALLBACKS_EN);
  }
  const lang = detectLang(trimmed);
  const rules = lang === "tr" ? RULES_TR : RULES_EN;
  const reflectDict = lang === "tr" ? REFLECT_TR : REFLECT_EN;
  const fallbacks = lang === "tr" ? FALLBACKS_TR : FALLBACKS_EN;

  for (const rule of rules) {
    const m = trimmed.match(rule.pattern);
    if (m) {
      let response = pickRandom(rule.responses);
      // Substitute {0} with reflected captured group if present
      if (response.includes("{0}") && m[1]) {
        const reflected = reflect(m[1], reflectDict).replace(/[.!?]+$/, "");
        response = response.replace("{0}", reflected);
      } else {
        response = response.replace("{0}", "");
      }
      return response;
    }
  }
  return pickRandom(fallbacks);
}
