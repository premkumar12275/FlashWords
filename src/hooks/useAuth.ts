import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Session state + email/password auth. When Supabase isn't configured
// (no .env), `configured` is false and the app runs in guest mode.
export const useAuth = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(isSupabaseConfigured);

    useEffect(() => {
        if (!supabase) return;
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });
        const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s);
        });
        return () => sub.subscription.unsubscribe();
    }, []);

    // Network failures make supabase-js THROW (not return an error), so
    // every call is wrapped. All three return an error message or null.
    const OFFLINE_MSG = 'Could not reach the server — check your connection and the Supabase URL.';

    const signIn = useCallback(async (email: string, password: string) => {
        if (!supabase) return 'Supabase is not configured.';
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            return error ? error.message : null;
        } catch {
            return OFFLINE_MSG;
        }
    }, []);

    const signUp = useCallback(async (email: string, password: string) => {
        if (!supabase) return 'Supabase is not configured.';
        try {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) return error.message;
            // With email confirmation enabled there's no session yet.
            if (!data.session) return 'CONFIRM_EMAIL';
            return null;
        } catch {
            return OFFLINE_MSG;
        }
    }, []);

    const signOut = useCallback(async () => {
        if (!supabase) return;
        try {
            await supabase.auth.signOut();
        } catch {
            // best effort — local session is cleared regardless
        }
    }, []);

    return { configured: isSupabaseConfigured, session, loading, signIn, signUp, signOut };
};
