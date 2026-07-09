import React from 'react';
import { ArrowLeftRight, EyeOff, Eye } from 'lucide-react';
import clsx from 'clsx';
import { StudySettings } from '../hooks/useFlashcards';
import { categoryStyle } from '../utils/category';

interface StudyBarProps {
    settings: StudySettings;
    categories: string[];
    onChange: (patch: Partial<StudySettings>) => void;
}

export const StudyBar: React.FC<StudyBarProps> = ({ settings, categories, onChange }) => {
    const reversed = settings.direction === 'en-no';

    return (
        <div className="w-full flex flex-wrap items-center justify-center gap-2 mb-6">
            {/* Direction toggle */}
            <button
                onClick={() => onChange({ direction: reversed ? 'no-en' : 'en-no' })}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-md shadow-md text-sm font-bold text-gray-700 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
                title="Swap question and answer language"
            >
                <span>{reversed ? '🇬🇧' : '🇳🇴'}</span>
                <ArrowLeftRight size={16} className="text-indigo-500" />
                <span>{reversed ? '🇳🇴' : '🇬🇧'}</span>
            </button>

            {/* Category filter */}
            <select
                value={settings.category}
                onChange={(e) => onChange({ category: e.target.value })}
                aria-label="Filter by category"
                className="px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-md shadow-md text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 cursor-pointer"
            >
                <option value="all">🗂️ All categories</option>
                {categories.map(cat => {
                    const s = categoryStyle(cat);
                    return (
                        <option key={cat} value={cat}>
                            {s.emoji} {s.label}s
                        </option>
                    );
                })}
            </select>

            {/* Hide known toggle */}
            <button
                onClick={() => onChange({ hideKnown: !settings.hideKnown })}
                className={clsx(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-2xl shadow-md text-sm font-bold transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-400",
                    settings.hideKnown
                        ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white"
                        : "bg-white/80 backdrop-blur-md text-gray-700"
                )}
                title={settings.hideKnown ? "Showing only words you haven't learned yet" : "Show all words, including known ones"}
            >
                {settings.hideKnown ? <EyeOff size={16} /> : <Eye size={16} className="text-emerald-500" />}
                <span>{settings.hideKnown ? 'Hiding known' : 'Hide known'}</span>
            </button>
        </div>
    );
};
