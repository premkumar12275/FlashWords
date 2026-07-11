import React, { useEffect, useState, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { LogOut, LogIn, Loader2, CloudOff } from 'lucide-react';
import { StudyApp } from './StudyApp';
import { AuthScreen } from './components/AuthScreen';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import { setStorageNamespace, setStorageEphemeral, onStorageWrite, readRaw, writeRaw } from './utils/storage';
import { pullProgress, pushProgress } from './utils/progressSync';

// Device-level preference (deliberately not part of synced progress).
const AUTH_PREF_KEY = 'flashwords:authpref:v1';

const Spinner: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-3 text-xl text-gray-500 font-medium">
    <Loader2 size={22} className="animate-spin" /> {label}
  </div>
);

// Sets the storage namespace for the signed-in user, hydrates local progress
// from the cloud (or migrates guest progress on first login), then mirrors
// every later write back up, debounced.
const AccountSync: React.FC<{ session: Session; children: React.ReactNode }> = ({ session, children }) => {
  const [ready, setReady] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const userId = session.user.id;
    const prefix = `u:${userId}:`;
    let cancelled = false;

    setStorageEphemeral(false);
    setStorageNamespace(userId);
    (async () => {
      if (supabase) await pullProgress(supabase, userId, prefix);
      if (!cancelled) setReady(true);
    })();

    const unsubscribe = onStorageWrite(() => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (supabase) pushProgress(supabase, userId, prefix);
      }, 1200);
    });

    return () => {
      cancelled = true;
      unsubscribe();
      clearTimeout(timer.current);
      setStorageNamespace('');
    };
  }, [session.user.id]);

  if (!ready) return <Spinner label="Syncing your progress..." />;
  return <>{children}</>;
};

// Guest sessions (accounts available, user chose not to sign in) run on
// in-memory storage: the whole app works, nothing survives a reload.
// useState (not useEffect) so the flag is set before children's hooks
// read storage during their first render. The effect body must RE-ENABLE
// the flag: StrictMode's simulated unmount runs the cleanup, and without
// re-enabling, guest mode would silently fall back to persistent storage.
const GuestSession: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useState(() => setStorageEphemeral(true));
  useEffect(() => {
    setStorageEphemeral(true);
    return () => setStorageEphemeral(false);
  }, []);
  return <>{children}</>;
};

function App() {
  const { configured, session, loading, signIn, signUp, signOut } = useAuth();
  const [guest, setGuest] = useState(() => readRaw(AUTH_PREF_KEY) === 'guest');

  const chooseGuest = () => {
    writeRaw(AUTH_PREF_KEY, 'guest');
    setGuest(true);
  };
  const leaveGuest = () => {
    writeRaw(AUTH_PREF_KEY, '');
    setGuest(false);
  };
  const handleSignOut = () => {
    writeRaw(AUTH_PREF_KEY, '');
    setGuest(false);
    signOut();
  };

  const showAuth = configured && !session && !guest && !loading;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-rose-50 to-amber-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-300/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-10 right-0 w-96 h-96 bg-fuchsia-300/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-amber-300/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-emerald-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      {/* account chip */}
      {session ? (
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-white/70 backdrop-blur-md pl-4 pr-2 py-1.5 rounded-full text-sm font-bold text-gray-700 shadow-md border border-white/60">
          <span className="max-w-[10rem] truncate" title={session.user.email ?? ''}>
            👤 {session.user.email}
          </span>
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      ) : guest && configured ? (
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-white/70 backdrop-blur-md pl-4 pr-2 py-1.5 rounded-full text-sm font-bold text-gray-600 shadow-md border border-white/60">
          <span title="You can use everything, but progress is lost when you leave">
            👻 Guest — progress not saved
          </span>
          <button
            onClick={leaveGuest}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white text-xs font-bold shadow hover:-translate-y-0.5 transition-all"
            title="Sign in to keep your progress"
          >
            <LogIn size={13} /> Sign in
          </button>
        </div>
      ) : !configured ? (
        <div
          className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-gray-400 shadow-sm border border-white/60"
          title="Add Supabase keys to .env to enable accounts and cloud sync"
        >
          <CloudOff size={14} /> Local only
        </div>
      ) : null}

      <header className="mb-6 text-center z-10">
        <div className="text-4xl mb-2 animate-float">🇳🇴</div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-2">
          <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-amber-500 bg-clip-text text-transparent">Norsk Flashcards</span>
        </h1>
        <p className="text-lg text-gray-600 font-medium">Lær norsk, ett kort om gangen ✨</p>
      </header>

      <main className="z-10 w-full max-w-md flex flex-col items-center">
        {loading ? (
          <Spinner label="Checking your session..." />
        ) : showAuth ? (
          <AuthScreen onSignIn={signIn} onSignUp={signUp} onGuest={chooseGuest} />
        ) : session ? (
          <AccountSync session={session}>
            <StudyApp key={session.user.id} />
          </AccountSync>
        ) : configured ? (
          <GuestSession>
            <StudyApp key="guest-ephemeral" />
          </GuestSession>
        ) : (
          <StudyApp key="local" />
        )}
      </main>
    </div>
  );
}

export default App;
