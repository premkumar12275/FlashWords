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
    const [hint, setHint] = useState('');

    const submitWord = (e: React.FormEvent) => {
        e.preventDefault();
        if (!word.trim()) return;
        const res = onJumpToWord(word);
        if (res.found) {
            setError('');
            setHint(res.matches > 1 ? `${res.matches} cards match "${word.trim()}" — showing the closest` : '');
            setWord('');
        } else {
            setHint('');
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
            setHint('');
            setNum('');
        } else {
            setHint('');
            setError(`Enter a number between 1 and ${total}`);
        }
    };

    return (
        <div className="w-full mt-6">
            <div className="flex flex-col sm:flex-row gap-3">
                <form onSubmit={submitWord} className="flex-1 relative">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
                    <input
                        type="text"
                        value={word}
                        onChange={(e) => { setWord(e.target.value); setError(''); setHint(''); }}
                        placeholder="Go to word (norsk or english)…"
                        aria-label="Go to word"
                        className="w-full pl-11 pr-3 py-3 rounded-2xl bg-white/80 backdrop-blur-md border-2 border-transparent text-gray-800 placeholder-gray-400 shadow-md focus:outline-none focus:border-indigo-400 focus:bg-white transition-all"
                    />
                </form>

                <form onSubmit={submitNum} className="relative sm:w-40">
                    <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fuchsia-400 pointer-events-none" />
                    <input
                        type="number"
                        min={1}
                        max={total}
                        value={num}
                        onChange={(e) => { setNum(e.target.value); setError(''); setHint(''); }}
                        placeholder={`1–${total}`}
                        aria-label="Go to card number"
                        className="w-full pl-10 pr-3 py-3 rounded-2xl bg-white/80 backdrop-blur-md border-2 border-transparent text-gray-800 placeholder-gray-400 shadow-md focus:outline-none focus:border-fuchsia-400 focus:bg-white transition-all"
                    />
                </form>
            </div>
            {error && <p className="mt-2 text-sm text-rose-500 text-center font-medium">{error}</p>}
            {hint && <p className="mt-2 text-sm text-indigo-500 text-center font-medium">{hint}</p>}
        </div>
    );
};
