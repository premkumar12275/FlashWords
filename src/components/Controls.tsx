import React from 'react';
import { ArrowLeft, ArrowRight, Shuffle } from 'lucide-react';
import clsx from 'clsx';

interface ControlsProps {
    onNext: () => void;
    onPrev: () => void;
    onShuffle: () => void;
    isShuffled: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ onNext, onPrev, onShuffle, isShuffled }) => {
    return (
        <div className="flex items-center gap-5 mt-8">
            <button
                onClick={onPrev}
                className="p-4 rounded-2xl bg-white text-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all active:scale-90"
                aria-label="Previous card"
            >
                <ArrowLeft size={24} />
            </button>

            <button
                onClick={onShuffle}
                className={clsx(
                    "p-3 rounded-2xl shadow-md transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 hover:-translate-y-0.5",
                    isShuffled
                        ? "bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-fuchsia-300/50 animate-wiggle"
                        : "bg-white text-gray-400 hover:text-fuchsia-500"
                )}
                aria-label="Toggle shuffle"
                title={isShuffled ? "Shuffle is on" : "Shuffle is off"}
            >
                <Shuffle size={20} />
            </button>

            <button
                onClick={onNext}
                className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-300/50 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all active:scale-90"
                aria-label="Next card"
            >
                <ArrowRight size={24} />
            </button>
        </div>
    );
};
