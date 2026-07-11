// Mirrors a user's progress between localStorage and the Supabase `progress`
// table (one jsonb row per user). Flow on login:
//   1. pullProgress: cloud row exists  -> hydrate namespaced localStorage from it
//                    no cloud row yet  -> migrate this browser's guest progress
//                                         into the account and push it up
//   2. onStorageWrite -> debounced pushProgress on every later change.
//
// The blob is { plainKey: rawJsonString }, so the app fully owns the shape.

import { SupabaseClient } from '@supabase/supabase-js';
import { readRaw, writeRaw } from './storage';

// Every key the app persists. New features must add their key here to sync.
export const PROGRESS_KEYS = [
    'flashwords:known:v1',
    'flashwords:settings:v1',
    'flashwords:lastCard:v1',
    'flashwords:leitner:v1',
    'flashwords:mode:v1',
] as const;

export type ProgressBlob = Record<string, string>;

// Read all progress keys under a prefix ('' = guest/legacy keys).
export const collectProgress = (prefix: string): ProgressBlob => {
    const blob: ProgressBlob = {};
    for (const key of PROGRESS_KEYS) {
        const raw = readRaw(`${prefix}${key}`);
        if (raw !== null) blob[key] = raw;
    }
    return blob;
};

// Write a blob into localStorage under a prefix. Unknown keys are ignored so
// a hostile/corrupt cloud row can't write arbitrary localStorage entries.
export const applyProgress = (prefix: string, blob: ProgressBlob): void => {
    for (const key of PROGRESS_KEYS) {
        const raw = blob[key];
        if (typeof raw === 'string') writeRaw(`${prefix}${key}`, raw);
    }
};

export const pushProgress = async (
    client: SupabaseClient, userId: string, prefix: string,
): Promise<string | null> => {
    try {
        const { error } = await client.from('progress').upsert({
            user_id: userId,
            data: collectProgress(prefix),
            updated_at: new Date().toISOString(),
        });
        return error ? error.message : null;
    } catch (e) {
        // Offline — local progress is intact; next successful push catches up.
        return e instanceof Error ? e.message : 'offline';
    }
};

// Returns true once local state is ready to use (cloud applied or migrated).
export const pullProgress = async (
    client: SupabaseClient, userId: string, prefix: string,
): Promise<boolean> => {
    let data: { data: unknown } | null;
    try {
        const result = await client
            .from('progress')
            .select('data')
            .eq('user_id', userId)
            .maybeSingle();
        if (result.error) throw new Error(result.error.message);
        data = result.data;
    } catch (e) {
        // Offline or table missing — fall back to whatever is cached locally.
        console.warn('FlashWords: could not load cloud progress:', e);
        return false;
    }

    if (data?.data && Object.keys(data.data).length > 0) {
        applyProgress(prefix, data.data as ProgressBlob);
        return true;
    }

    // First login on this account: adopt this browser's guest progress.
    const guest = collectProgress('');
    applyProgress(prefix, guest);
    await pushProgress(client, userId, prefix);
    return true;
};
