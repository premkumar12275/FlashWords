// Visual identity per part of speech. Class strings are written out in full so
// Tailwind's purge step can detect them (no dynamic class construction).

export interface CategoryStyle {
    label: string;
    emoji: string;
    badge: string;        // small pill on the card
    frontGlow: string;    // tint behind the word on the front
    back: string;         // gradient for the flipped (answer) side
    accentText: string;   // colored text/icon accents
}

const STYLES: Record<string, CategoryStyle> = {
    noun: {
        label: "Noun", emoji: "📦",
        badge: "bg-sky-100 text-sky-700",
        frontGlow: "from-sky-200/60",
        back: "from-sky-500 to-blue-600",
        accentText: "text-sky-100",
    },
    verb: {
        label: "Verb", emoji: "⚡",
        badge: "bg-emerald-100 text-emerald-700",
        frontGlow: "from-emerald-200/60",
        back: "from-emerald-500 to-green-600",
        accentText: "text-emerald-100",
    },
    adjective: {
        label: "Adjective", emoji: "🎨",
        badge: "bg-amber-100 text-amber-700",
        frontGlow: "from-amber-200/60",
        back: "from-amber-500 to-orange-600",
        accentText: "text-amber-100",
    },
    phrase: {
        label: "Phrase", emoji: "💬",
        badge: "bg-fuchsia-100 text-fuchsia-700",
        frontGlow: "from-fuchsia-200/60",
        back: "from-fuchsia-500 to-purple-600",
        accentText: "text-fuchsia-100",
    },
    pronoun: {
        label: "Pronoun", emoji: "🙋",
        badge: "bg-rose-100 text-rose-700",
        frontGlow: "from-rose-200/60",
        back: "from-rose-500 to-pink-600",
        accentText: "text-rose-100",
    },
    adverb: {
        label: "Adverb", emoji: "🌀",
        badge: "bg-teal-100 text-teal-700",
        frontGlow: "from-teal-200/60",
        back: "from-teal-500 to-cyan-600",
        accentText: "text-teal-100",
    },
    preposition: {
        label: "Preposition", emoji: "🧭",
        badge: "bg-indigo-100 text-indigo-700",
        frontGlow: "from-indigo-200/60",
        back: "from-indigo-500 to-blue-600",
        accentText: "text-indigo-100",
    },
    conjunction: {
        label: "Conjunction", emoji: "🔗",
        badge: "bg-lime-100 text-lime-700",
        frontGlow: "from-lime-200/60",
        back: "from-lime-500 to-green-600",
        accentText: "text-lime-100",
    },
    question: {
        label: "Question word", emoji: "❓",
        badge: "bg-red-100 text-red-700",
        frontGlow: "from-red-200/60",
        back: "from-red-500 to-rose-600",
        accentText: "text-red-100",
    },
    number: {
        label: "Number", emoji: "🔢",
        badge: "bg-violet-100 text-violet-700",
        frontGlow: "from-violet-200/60",
        back: "from-violet-500 to-indigo-600",
        accentText: "text-violet-100",
    },
};

const FALLBACK: CategoryStyle = {
    label: "Word", emoji: "🇳🇴",
    badge: "bg-gray-100 text-gray-700",
    frontGlow: "from-gray-200/60",
    back: "from-gray-600 to-gray-800",
    accentText: "text-gray-100",
};

export const categoryStyle = (partOfSpeech: string): CategoryStyle =>
    STYLES[partOfSpeech] ?? FALLBACK;

// Gender chip colors (for nouns).
export const genderStyle: Record<string, string> = {
    en: "bg-blue-100 text-blue-700",
    ei: "bg-pink-100 text-pink-700",
    et: "bg-green-100 text-green-700",
};
