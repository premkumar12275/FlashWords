import { describe, it, expect, beforeEach } from 'vitest';
import { collectProgress, applyProgress, PROGRESS_KEYS } from '../src/utils/progressSync';
import {
    setStorageNamespace, setStorageEphemeral, loadJSON, saveJSON, onStorageWrite, readRaw,
} from '../src/utils/storage';

// Minimal localStorage shim for the Node test environment.
const store = new Map<string, string>();
(globalThis as Record<string, unknown>).localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
};

beforeEach(() => {
    store.clear();
    setStorageNamespace('');
    setStorageEphemeral(false);
});

describe('ephemeral (guest) storage', () => {
    it('works fully in memory without touching localStorage', () => {
        setStorageEphemeral(true);
        saveJSON('flashwords:known:v1', ['hus']);
        expect(loadJSON('flashwords:known:v1', [])).toEqual(['hus']); // app works
        expect(store.size).toBe(0);                                    // nothing persisted
    });

    it('starts with a fresh slate even if localStorage has old progress', () => {
        saveJSON('flashwords:known:v1', ['old-word']); // persisted earlier
        setStorageEphemeral(true);
        expect(loadJSON('flashwords:known:v1', [])).toEqual([]);
    });

    it('leaving guest mode clears the memory and restores persistence', () => {
        setStorageEphemeral(true);
        saveJSON('flashwords:known:v1', ['temp']);
        setStorageEphemeral(false);
        expect(loadJSON('flashwords:known:v1', [])).toEqual([]); // guest data gone
        saveJSON('flashwords:known:v1', ['kept']);
        expect(store.get('flashwords:known:v1')).toBe('["kept"]');
    });

    it('re-entering guest mode does not leak the previous guest session', () => {
        setStorageEphemeral(true);
        saveJSON('flashwords:mode:v1', 'review');
        setStorageEphemeral(false);
        setStorageEphemeral(true);
        expect(loadJSON('flashwords:mode:v1', 'browse')).toBe('browse');
    });

    it('repeated enable is a no-op and survives a StrictMode mount cycle', () => {
        // React StrictMode: initializer(true) -> effect(true) -> cleanup(false) -> effect(true)
        setStorageEphemeral(true);
        setStorageEphemeral(true); // must NOT wipe the session
        saveJSON('flashwords:known:v1', ['mid-render-write']);
        setStorageEphemeral(true);
        expect(loadJSON('flashwords:known:v1', [])).toEqual(['mid-render-write']);
        setStorageEphemeral(false);
        setStorageEphemeral(true);
        // ended up ephemeral: writes still don't reach localStorage
        saveJSON('flashwords:leitner:v1', { x: 1 });
        expect(store.has('flashwords:leitner:v1')).toBe(false);
    });

    it('still notifies the write listener (harmless — sync is off for guests)', () => {
        const written: string[] = [];
        const unsub = onStorageWrite(k => written.push(k));
        setStorageEphemeral(true);
        saveJSON('flashwords:mode:v1', 'review');
        unsub();
        expect(written).toEqual(['flashwords:mode:v1']);
    });
});

describe('storage namespacing', () => {
    it('unnamespaced keys are stored as-is', () => {
        saveJSON('flashwords:known:v1', ['a']);
        expect(store.has('flashwords:known:v1')).toBe(true);
        expect(loadJSON('flashwords:known:v1', [])).toEqual(['a']);
    });

    it('namespaced keys are isolated per user', () => {
        saveJSON('flashwords:known:v1', ['guest-word']);
        setStorageNamespace('user-123');
        expect(loadJSON('flashwords:known:v1', [])).toEqual([]); // fresh for this user
        saveJSON('flashwords:known:v1', ['user-word']);
        expect(store.get('u:user-123:flashwords:known:v1')).toBe('["user-word"]');
        setStorageNamespace('');
        expect(loadJSON('flashwords:known:v1', [])).toEqual(['guest-word']); // untouched
    });

    it('notifies the write listener with the plain key', () => {
        const written: string[] = [];
        const unsub = onStorageWrite(k => written.push(k));
        setStorageNamespace('user-123');
        saveJSON('flashwords:mode:v1', 'review');
        unsub();
        saveJSON('flashwords:mode:v1', 'browse'); // after unsubscribe
        expect(written).toEqual(['flashwords:mode:v1']);
    });
});

describe('progress blobs', () => {
    it('collect picks up exactly the progress keys under a prefix', () => {
        store.set('u:alice:flashwords:known:v1', '["hus"]');
        store.set('u:alice:flashwords:mode:v1', '"review"');
        store.set('u:alice:unrelated', 'x');
        store.set('flashwords:known:v1', '["guest"]'); // different prefix
        const blob = collectProgress('u:alice:');
        expect(blob).toEqual({
            'flashwords:known:v1': '["hus"]',
            'flashwords:mode:v1': '"review"',
        });
    });

    it('apply writes only known progress keys, ignoring junk', () => {
        applyProgress('u:bob:', {
            'flashwords:leitner:v1': '{"id1":{"box":2,"due":"2026-07-12"}}',
            'evil-key': 'nope',
        });
        expect(store.get('u:bob:flashwords:leitner:v1')).toBe('{"id1":{"box":2,"due":"2026-07-12"}}');
        expect(store.has('u:bob:evil-key')).toBe(false);
        expect(store.has('evil-key')).toBe(false);
    });

    it('collect→apply round-trips a full user profile', () => {
        for (const key of PROGRESS_KEYS) store.set(`u:a:${key}`, `"${key}-value"`);
        applyProgress('u:b:', collectProgress('u:a:'));
        for (const key of PROGRESS_KEYS) {
            expect(readRaw(`u:b:${key}`)).toBe(`"${key}-value"`);
        }
    });
});
