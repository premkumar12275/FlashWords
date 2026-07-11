// Tiny safe wrappers around localStorage — never throw (private mode, quota).
//
// Keys can be namespaced per signed-in user via setStorageNamespace(userId):
// 'flashwords:known:v1' is stored as 'u:<id>:flashwords:known:v1'. The study
// hooks keep using the plain keys and never know about accounts. An optional
// write listener lets the sync layer mirror every change to the cloud.

let namespace = '';
let writeListener: ((key: string) => void) | null = null;

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
        const raw = localStorage.getItem(nsKey(key));
        return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
        return fallback;
    }
};

export const saveJSON = (key: string, value: unknown): void => {
    try {
        localStorage.setItem(nsKey(key), JSON.stringify(value));
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
