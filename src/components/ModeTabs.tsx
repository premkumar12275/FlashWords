import React from 'react';
import { BookOpen, Brain } from 'lucide-react';
import clsx from 'clsx';

export type Mode = 'browse' | 'review';

interface ModeTabsProps {
    mode: Mode;
    reviewBadge: number; // cards waiting in today's review queue
    onChange: (mode: Mode) => void;
}

export const ModeTabs: React.FC<ModeTabsProps> = ({ mode, reviewBadge, onChange }) => {
    const tab = (active: boolean) => clsx(
        "relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400",
        active
            ? "bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-300/50"
            : "bg-white/70 backdrop-blur-md text-gray-600 shadow-md hover:-translate-y-0.5"
    );

    return (
        <div className="flex items-center gap-3 mb-6">
            <button onClick={() => onChange('browse')} className={tab(mode === 'browse')}>
                <BookOpen size={17} /> Browse
            </button>
            <button onClick={() => onChange('review')} className={tab(mode === 'review')}>
                <Brain size={17} /> Review
                {reviewBadge > 0 && mode !== 'review' && (
                    <span className="absolute -top-2 -right-2 min-w-[1.4rem] h-[1.4rem] px-1 rounded-full bg-rose-500 text-white text-[11px] font-extrabold flex items-center justify-center shadow-md">
                        {reviewBadge > 99 ? '99+' : reviewBadge}
                    </span>
                )}
            </button>
        </div>
    );
};
