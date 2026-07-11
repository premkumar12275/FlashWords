import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface AuthScreenProps {
    onSignIn: (email: string, password: string) => Promise<string | null>;
    onSignUp: (email: string, password: string) => Promise<string | null>;
    onGuest: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSignIn, onSignUp, onGuest }) => {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (busy || !email.trim() || !password) return;
        setBusy(true);
        setError('');
        setInfo('');
        let result: string | null;
        try {
            result = mode === 'signin'
                ? await onSignIn(email.trim(), password)
                : await onSignUp(email.trim(), password);
        } catch {
            result = 'Something went wrong — please try again.';
        }
        setBusy(false);
        if (result === 'CONFIRM_EMAIL') {
            setInfo('Almost there — check your email and click the confirmation link, then sign in.');
            setMode('signin');
        } else if (result) {
            setError(result);
        }
        // on success the session change re-renders the app — nothing to do here
    };

    const inputClass = "w-full pl-11 pr-3 py-3 rounded-2xl bg-white/80 backdrop-blur-md border-2 border-transparent text-gray-800 placeholder-gray-400 shadow-md focus:outline-none focus:border-indigo-400 focus:bg-white transition-all";

    return (
        <div className="w-full max-w-sm rounded-3xl bg-white/80 backdrop-blur-md shadow-2xl border border-white/60 px-8 py-8 animate-pop-in">
            {/* mode tabs */}
            <div className="flex gap-2 mb-6">
                {(['signin', 'signup'] as const).map(m => (
                    <button
                        key={m}
                        onClick={() => { setMode(m); setError(''); setInfo(''); }}
                        className={clsx(
                            "flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400",
                            mode === m
                                ? "bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg"
                                : "bg-white/70 text-gray-500 shadow-sm hover:text-gray-700"
                        )}
                    >
                        {m === 'signin' ? <LogIn size={16} /> : <UserPlus size={16} />}
                        {m === 'signin' ? 'Sign in' : 'Sign up'}
                    </button>
                ))}
            </div>

            <form onSubmit={submit} className="space-y-3">
                <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
                        aria-label="Email"
                        autoComplete="email"
                        className={inputClass}
                    />
                </div>
                <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fuchsia-400 pointer-events-none" />
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder={mode === 'signup' ? 'Password (min. 6 characters)' : 'Password'}
                        aria-label="Password"
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                        className={inputClass}
                    />
                </div>

                {error && <p className="text-sm text-rose-500 font-medium text-center">{error}</p>}
                {info && <p className="text-sm text-emerald-600 font-medium text-center">{info}</p>}

                <button
                    type="submit"
                    disabled={busy || !email.trim() || !password}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white font-bold shadow-lg shadow-indigo-300/50 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                    {busy && <Loader2 size={18} className="animate-spin" />}
                    {mode === 'signin' ? 'Sign in & sync progress' : 'Create account'}
                </button>
            </form>

            <div className="mt-5 text-center">
                <button
                    onClick={onGuest}
                    className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                    Continue as guest →
                </button>
                <p className="mt-1 text-xs text-gray-400">
                    Guest progress stays in this browser only.
                </p>
            </div>
        </div>
    );
};
