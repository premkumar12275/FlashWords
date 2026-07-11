// Leitner spaced-repetition core — pure functions, no React, no storage.
//
// Cards move through 5 boxes. A correct answer promotes a card one box and
// schedules it further into the future; a wrong answer sends it back to box 1,
// due immediately (so it comes around again in the same session). Cards the
// user has never reviewed are "new" and get introduced a few per day.

export type Box = 1 | 2 | 3 | 4 | 5;

export interface LeitnerEntry {
    box: Box;
    due: string; // local calendar date, 'YYYY-MM-DD'
}

// cardId -> entry. Cards absent from the record have never been reviewed.
export type LeitnerState = Record<string, LeitnerEntry>;

export const BOX_COUNT = 5;
export const DEFAULT_NEW_PER_SESSION = 15;

// Days until a card in this box comes up again after a correct answer.
export const BOX_INTERVALS: Record<Box, number> = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 14 };

export const toISODate = (d: Date): string => {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
};

export const todayISO = (): string => toISODate(new Date());

export const addDays = (iso: string, days: number): string => {
    const [y, m, d] = iso.split('-').map(Number);
    return toISODate(new Date(y, m - 1, d + days));
};

// ISO date strings compare correctly as plain strings.
export const isDue = (entry: LeitnerEntry, today: string): boolean => entry.due <= today;

// Grade one answer. `entry` is undefined for a never-reviewed card, which
// counts as box 1 — so a first-try correct answer moves it to box 2.
export const grade = (entry: LeitnerEntry | undefined, correct: boolean, today: string): LeitnerEntry => {
    if (!correct) return { box: 1, due: today };
    const nextBox = Math.min(BOX_COUNT, (entry?.box ?? 1) + 1) as Box;
    return { box: nextBox, due: addDays(today, BOX_INTERVALS[nextBox]) };
};

export interface QueueInfo {
    queue: string[];   // due cards (oldest first), then new cards in deck order
    dueCount: number;
    newCount: number;
}

// Today's review queue. `excludeIds` are cards the user marked as known —
// they've graduated out of review entirely.
export const buildQueue = (
    cardIds: string[],
    state: LeitnerState,
    excludeIds: Set<string>,
    today: string,
    newLimit: number = DEFAULT_NEW_PER_SESSION,
): QueueInfo => {
    const due: { id: string; entry: LeitnerEntry }[] = [];
    const fresh: string[] = [];
    for (const id of cardIds) {
        if (excludeIds.has(id)) continue;
        const entry = state[id];
        if (entry) {
            if (isDue(entry, today)) due.push({ id, entry });
        } else if (fresh.length < newLimit) {
            fresh.push(id);
        }
    }
    due.sort((a, b) =>
        a.entry.due < b.entry.due ? -1 :
        a.entry.due > b.entry.due ? 1 :
        a.entry.box - b.entry.box);
    return { queue: [...due.map(d => d.id), ...fresh], dueCount: due.length, newCount: fresh.length };
};

// Distribution for the progress display: index 0 = never reviewed ("new"),
// indexes 1–5 = boxes 1–5. Known/excluded cards are not counted.
export const boxCounts = (
    cardIds: string[],
    state: LeitnerState,
    excludeIds: Set<string>,
): number[] => {
    const counts = new Array(BOX_COUNT + 1).fill(0);
    for (const id of cardIds) {
        if (excludeIds.has(id)) continue;
        counts[state[id]?.box ?? 0]++;
    }
    return counts;
};
