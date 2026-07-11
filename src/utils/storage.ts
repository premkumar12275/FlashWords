// Tiny safe wrappers around localStorage — never throw (private mode, quota).
//
// Keys can be namespaced per signed-in user via setStorageNamespace(userId):
// 'flashwords:known:v1' is stored as 'u:<id>:flashwords:known:v1'. The study
// hooks keep using the plain keys and never know about accounts. An optional
// write listener lets the sync layer mirror every change to the cloud.

let namespace = '';
let writeListener: ((key: string) => void) | null = null;

// Ephemeral mode backs loadJSON/saveJSON with an in-memory map instead of
// localStorage: the app works normally, but nothing survives a reload.
// Used for guest sessions when accounts are available — sign in to save.
let ephemeral = false;
const memory = new Map<string, string>();

export const setStorageEphemeral = (on: boolean): void => {
    if (on === ephemeral) return; // idempotent — repeated calls must not wipe the session
    ephemeral = on;
    memory.clear(); // fresh slate on every enter/leave
};

export const isStorageEphemeral = (): boolean => ephemeral;

export const setStorageNamespace = (userId: string): void => {
    namespace = userId ? `u:${userId}:` : '';
};

export const getStorageNamespace = (): string => namespace;

// Returns an unsubscribe function. Only one listener at a time (the sync layer).
export const onStorageWrite = (listener: (key: string) => void): (() => void) => {
    writeListener = listener;
    return () => { writeListener = null; };
};

const nsKey = (key: string): string => `${namespace}${key}`;

export const loadJSON = <T,>(key: string, fallback: T): T => {
    try {
        const raw = ephemeral
            ? memory.get(nsKey(key)) ?? null
            : localStorage.getItem(nsKey(key));
        return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
        return fallback;
    }
};

export const saveJSON = (key: string, value: unknown): void => {
    try {
        if (ephemeral) {
            memory.set(nsKey(key), JSON.stringify(value));
        } else {
            localStorage.setItem(nsKey(key), JSON.stringify(value));
        }
    } catch {
        // ignore — persistence is best-effort
    }
    writeListener?.(key);
};

// --- raw helpers for the sync layer (explicit prefix, ignores namespace) ---

export const readRaw = (fullKey: string): string | null => {
    try {
        return localStorage.getItem(fullKey);
    } catch {
        return null;
    }
};

export const writeRaw = (fullKey: string, raw: string): void => {
    try {
        localStorage.setItem(fullKey, raw);
    } catch {
        // ignore
    }
};
