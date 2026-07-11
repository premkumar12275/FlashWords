import React, { useEffect } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { Flashcard as FlashcardType } from '../types';
import { Flashcard } from './Flashcard';
import { Direction } from '../hooks/useFlashcards';
import { ReviewStats } from '../hooks/useReview';

interface ReviewSessionProps {
    card: FlashcardType | undefined;
    direction: Direction;
    remaining: number;
    sessionSize: number;
    isFlipped: boolean;
    onFlip: () => void;
    onGrade: (correct: boolean) => void;
    done: boolean;
    stats: ReviewStats;
    distribution: number[]; // [new, box1..box5]
    onLearnMore: () => void;
}

const BOX_LABELS = ['New', 'Box 1', 'Box 2', 'Box 3', 'Box 4', 'Box 5'];
const BOX_COLORS = [
    'bg-gray-300',
    'bg-rose-400',
    'bg-amber-400',
    'bg-yellow-400',
    'bg-lime-400',
    'bg-emerald-500',
];

const BoxBars: React.FC<{ distribution: number[] }> = ({ distribution }) => {
    const max = Math.max(1, ...distribution);
    return (
        <div className="flex items-end justify-center gap-3 h-24 mt-2">
            {distribution.map((count, i) => (
                <div key={i} className="flex flex-col items-center gap-1 w-10">
                    <span className="text-xs font-bold text-gray-600">{count}</span>
                    <div
                        className={`w-full rounded-t-lg ${BOX_COLORS[i]} transition-all`}
                        style={{ height: `${Math.max(4, (count / max) * 60)}px` }}
                    />
                    <span className="text-[10px] font-bold text-gray-400">{BOX_LABELS[i]}</span>
                </div>
            ))}
        </div>
    );
};

export const ReviewSession: React.FC<ReviewSessionProps> = ({
    card, direction, remaining, sessionSize, isFlipped, onFlip, onGrade,
    done, stats, distribution, onLearnMore,
}) => {
    // Review keys: Space/Enter flips; after the reveal, 1 = again, 2 = got it.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (!done && card) onFlip();
            } else if (isFlipped && (e.key === '1')) {
                onGrade(false);
            } else if (isFlipped && (e.key === '2')) {
                onGrade(true);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [done, card, isFlipped, onFlip, onGrade]);

    if (done) {
        const nothingLeftToLearn = distribution[0] === 0;
        const reviewedAny = stats.correct + stats.again > 0;
        return (
            <div className="w-full max-w-sm rounded-3xl bg-white/80 backdrop-blur-md shadow-2xl border border-white/60 flex flex-col items-center text-center px-8 py-8 animate-pop-in">
                <div className="text-6xl mb-3">🎉</div>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-1">
                    {reviewedAny ? 'Ferdig for i dag!' : 'Alt er gjort!'}
                </h2>
                <p className="text-gray-500 text-sm mb-4">
                    {reviewedAny
                        ? <>You got <span className="font-bold text-emerald-600">{stats.correct}</span> right
                            {stats.again > 0 && <> and retried <span className="font-bold text-rose-500">{stats.again}</span></>}.</>
                        : 'No cards are due right now — come back tomorrow.'}
                </p>

                <BoxBars distribution={distribution} />

                <button
                    onClick={onLearnMore}
                    disabled={nothingLeftToLearn}
                    className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white font-bold shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-40 disabled:hover:translate-y-0"
                >
                    <Sparkles size={18} />
                    {nothingLeftToLearn ? 'All 1000+ words started!' : 'Learn 15 new words'}
                </button>
            </div>
        );
    }

    if (!card) return null;

    return (
        <>
            {/* session progress */}
            <div className="w-full max-w-sm flex items-center justify-between mb-4 px-1">
                <span className="text-sm font-bold text-gray-600 bg-white/70 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                    🧠 {remaining} left
                </span>
                <div className="flex-1 mx-3 h-2 rounded-full bg-white/60 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-300"
                        style={{ width: `${sessionSize === 0 ? 0 : ((sessionSize - remaining) / sessionSize) * 100}%` }}
                    />
                </div>
                <span className="text-sm font-bold text-emerald-600 bg-white/70 backdrop-blur-md px-3 py-1 rounded-full shadow-sm" title="correct this session">
                    ✓ {stats.correct}
                </span>
            </div>

            <div className="w-full flex justify-center">
                <Flashcard
                    card={card}
                    direction={direction}
                    isFlipped={isFlipped}
                    onFlip={onFlip}
                />
            </div>

            {/* grading */}
            <div className="mt-8 h-16 flex items-center justify-center gap-4">
                {isFlipped ? (
                    <>
                        <button
                            onClick={() => onGrade(false)}
                            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 text-white font-bold shadow-lg shadow-rose-300/50 hover:-translate-y-0.5 transition-all active:scale-95 animate-pop-in"
                            title="I didn't know it — see it again soon (1)"
                        >
                            <X size={20} /> Again
                        </button>
                        <button
                            onClick={() => onGrade(true)}
                            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white font-bold shadow-lg shadow-emerald-300/50 hover:-translate-y-0.5 transition-all active:scale-95 animate-pop-in"
                            title="I knew it — move it up a box (2)"
                        >
                            <Check size={20} /> Got it
                        </button>
                    </>
                ) : (
                    <p className="text-sm text-gray-400 font-medium">
                        Think of the answer, then tap the card to check yourself
                    </p>
                )}
            </div>
        </>
    );
};
