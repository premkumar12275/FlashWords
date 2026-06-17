import React, { useState } from 'react';
import { Search, Hash } from 'lucide-react';
import { SearchResult } from '../hooks/useFlashcards';

interface GoToProps {
    total: number;
    onJumpToWord: (query: string) => SearchResult;
    onJumpToNumber: (n: number) => SearchResult;
}

export const GoTo: React.FC<GoToProps> = ({ total, onJumpToWord, onJumpToNumber }) => {
    const [word, setWord] = useState('');
    const [num, setNum] = useState('');
    const [error, setError] = useState('');

    const submitWord = (e: React.FormEvent) => {
        e.preventDefault();
        if (!word.trim()) return;
        const res = onJumpToWord(word);
        if (res.found) {
            setError('');
            setWord('');
        } else {
            setError(`No card matches "${word.trim()}"`);
        }
    };

    const submitNum = (e: React.FormEvent) => {
        e.preventDefault();
        if (!num.trim()) return;
        const n = parseInt(num, 10);
        const res = onJumpToNumber(n);
        if (res.found) {
            setError('');
            setNum('');
        } else {
            setError(`Enter a number between 1 and ${total}`);
        }
    };

    return (
        <div className="w-full mt-6">
            <div className="flex flex-col sm:flex-row gap-3">
                <form onSubmit={submitWord} className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        value={word}
                        onChange={(e) => { setWord(e.target.value); setError(''); }}
                        placeholder="Go to word (norsk or english)…"
                        aria-label="Go to word"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                </form>

                <form onSubmit={submitNum} className="relative sm:w-40">
                    <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        type="number"
                        min={1}
                        max={total}
                        value={num}
                        onChange={(e) => { setNum(e.target.value); setError(''); }}
                        placeholder={`1–${total}`}
                        aria-label="Go to card number"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                </form>
            </div>
            {error && <p className="mt-2 text-sm text-rose-500 text-center">{error}</p>}
        </div>
    );
};
