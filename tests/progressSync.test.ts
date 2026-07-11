import { describe, it, expect, beforeEach } from 'vitest';
import { collectProgress, applyProgress, PROGRESS_KEYS } from '../src/utils/progressSync';
import { setStorageNamespace, loadJSON, saveJSON, onStorageWrite, readRaw } from '../src/utils/storage';

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
