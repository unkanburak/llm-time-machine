export type Lang = "tr" | "en";

export const STRINGS = {
  appTitle: { tr: "LLM Zaman Makinesi", en: "LLM Time Machine" },
  tagline: {
    tr: "1966 → 2026, sohbet ederek öğren",
    en: "1966 → 2026, learn by chatting",
  },
  subtagline: {
    tr: "Her dönemden bir LLM ile konuş, mimarisini gör, prompt mantığının nasıl değiştiğini hisset.",
    en: "Chat with an LLM from each era, see its architecture, feel how prompt logic evolved.",
  },
  pickModel: { tr: "Bir model seç", en: "Pick a model" },
  selectFromTimeline: {
    tr: "Yukarıdaki zaman çizgisinden bir LLM seç ve sohbete başla.",
    en: "Pick an LLM from the timeline above to start chatting.",
  },
  inputPlaceholder: {
    tr: "Mesajını yaz... (Enter ile gönder, Shift+Enter ile yeni satır)",
    en: "Type your message... (Enter to send, Shift+Enter for newline)",
  },
  send: { tr: "Gönder", en: "Send" },
  thinking: { tr: "düşünüyor", en: "thinking" },
  eraSimulation: { tr: "Dönem Simülasyonu", en: "Era Simulation" },
  authentic: { tr: "Otantik", en: "Authentic" },
  parameters: { tr: "Parametre", en: "Parameters" },
  architecture: { tr: "Mimari", en: "Architecture" },
  trainingData: { tr: "Eğitim Verisi", en: "Training Data" },
  keyInnovation: { tr: "Anahtar Yenilik", en: "Key Innovation" },
  organization: { tr: "Kurum", en: "Organization" },
  paper: { tr: "Makale / Kaynak", en: "Paper / Source" },
  year: { tr: "Yıl", en: "Year" },
  noChat: {
    tr: "Bu modelle sohbet edilemez",
    en: "This model can't be chatted with",
  },
  suggestedPrompts: {
    tr: "Önerilen sorular",
    en: "Suggested prompts",
  },
  technical: {
    tr: "Teknik",
    en: "Technical",
  },
  social: {
    tr: "Eğlenceli",
    en: "Fun",
  },
  technicalHint: {
    tr: "Bu modelin prompt mantığını test eder",
    en: "Test this model's prompt logic",
  },
  socialHint: {
    tr: "Günlük kullanım, sohbet / eğlence",
    en: "Everyday chat / fun prompts",
  },
  whyNoChat: {
    tr: "Neden sohbet yok?",
    en: "Why no chat?",
  },
  legacy: {
    tr: "Bıraktığı miras",
    en: "Lasting legacy",
  },
  examples: {
    tr: "Örnekler",
    en: "Examples",
  },
  compareMode: { tr: "Karşılaştır", en: "Compare" },
  compareModeTitle: {
    tr: "Karşılaştırma Modu",
    en: "Compare Mode",
  },
  compareModeDesc: {
    tr: "Aynı soruyu birden fazla döneme sor, cevapları yan yana gör.",
    en: "Ask the same question to multiple eras, see answers side by side.",
  },
  selectModelsToCompare: {
    tr: "Karşılaştırılacak modelleri seç (2-4)",
    en: "Select models to compare (2-4)",
  },
  yourPrompt: { tr: "Sorun", en: "Your prompt" },
  runComparison: { tr: "Karşılaştır", en: "Run comparison" },
  errorTitle: { tr: "Bir şeyler ters gitti", en: "Something went wrong" },
  errorMessage: {
    tr: "API'ye ulaşılamadı. Anahtarını ve internet bağlantını kontrol et.",
    en: "Couldn't reach the API. Check your key and internet connection.",
  },
  retry: { tr: "Tekrar dene", en: "Retry" },
  close: { tr: "Kapat", en: "Close" },
  clearChat: { tr: "Sohbeti temizle", en: "Clear chat" },
  modelInfo: { tr: "Model Bilgisi", en: "Model Info" },
  noChatAvailable: {
    tr: "Bu model için sohbet etkin değil",
    en: "Chat is not enabled for this model",
  },
  pickAtLeastTwo: {
    tr: "En az 2 model seç",
    en: "Pick at least 2 models",
  },
  jurySafe: {
    tr: "Demoda eski modellerin sınırlarını jüriye göstermek için harika sorular seçilmiştir.",
    en: "Demo prompts are chosen to highlight era-specific quirks.",
  },
  cutoffWarning: {
    tr: "Bilgi kesim tarihi:",
    en: "Knowledge cutoff:",
  },
};

export function t(key: keyof typeof STRINGS, lang: Lang): string {
  return STRINGS[key][lang];
}
