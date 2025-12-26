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
        <div className="flex items-center gap-6 mt-8">
            <button
                onClick={onPrev}
                className="p-4 rounded-full bg-white text-gray-700 shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all active:scale-95"
                aria-label="Previous card"
            >
                <ArrowLeft size={24} />
            </button>

            <button
                onClick={onShuffle}
                className={clsx(
                    "p-3 rounded-full shadow-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500",
                    isShuffled ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200" : "bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                )}
                aria-label="Toggle shuffle"
                title="Toggle shuffle"
            >
                <Shuffle size={20} />
            </button>

            <button
                onClick={onNext}
                className="p-4 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all active:scale-95"
                aria-label="Next card"
            >
                <ArrowRight size={24} />
            </button>
        </div>
    );
};
