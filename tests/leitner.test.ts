import { describe, it, expect } from 'vitest';
import {
    addDays, isDue, grade, buildQueue, boxCounts,
    LeitnerState, DEFAULT_NEW_PER_SESSION,
} from '../src/utils/leitner';

const TODAY = '2026-07-11';
const none = new Set<string>();

describe('addDays', () => {
    it('adds within a month', () => {
        expect(addDays('2026-07-11', 3)).toBe('2026-07-14');
    });
    it('rolls over month and year boundaries', () => {
        expect(addDays('2026-07-31', 1)).toBe('2026-08-01');
        expect(addDays('2026-12-25', 14)).toBe('2027-01-08');
    });
});

describe('isDue', () => {
    it('due today and overdue count as due; future does not', () => {
        expect(isDue({ box: 1, due: TODAY }, TODAY)).toBe(true);
        expect(isDue({ box: 3, due: '2026-07-01' }, TODAY)).toBe(true);
        expect(isDue({ box: 2, due: '2026-07-12' }, TODAY)).toBe(false);
    });
});

describe('grade', () => {
    it('wrong answer sends any card back to box 1, due immediately', () => {
        expect(grade({ box: 5, due: TODAY }, false, TODAY)).toEqual({ box: 1, due: TODAY });
        expect(grade(undefined, false, TODAY)).toEqual({ box: 1, due: TODAY });
    });
    it('a new card answered correctly goes to box 2, due tomorrow', () => {
        expect(grade(undefined, true, TODAY)).toEqual({ box: 2, due: '2026-07-12' });
    });
    it('correct answers promote one box with growing intervals', () => {
        expect(grade({ box: 2, due: TODAY }, true, TODAY)).toEqual({ box: 3, due: '2026-07-14' });
        expect(grade({ box: 4, due: TODAY }, true, TODAY)).toEqual({ box: 5, due: '2026-07-25' });
    });
    it('box 5 is the ceiling — stays there on correct', () => {
        expect(grade({ box: 5, due: TODAY }, true, TODAY)).toEqual({ box: 5, due: '2026-07-25' });
    });
});

describe('buildQueue', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];

    it('introduces new cards up to the limit, in deck order', () => {
        const q = buildQueue(ids, {}, none, TODAY, 3);
        expect(q.queue).toEqual(['a', 'b', 'c']);
        expect(q.newCount).toBe(3);
        expect(q.dueCount).toBe(0);
    });

    it('puts due cards first, oldest due date first', () => {
        const state: LeitnerState = {
            a: { box: 2, due: '2026-07-10' },   // overdue
            b: { box: 1, due: TODAY },          // due today
            c: { box: 3, due: '2026-08-01' },   // future — not due
        };
        const q = buildQueue(ids, state, none, TODAY, 1);
        expect(q.queue).toEqual(['a', 'b', 'd']); // due (a older than b), then 1 new
        expect(q.dueCount).toBe(2);
        expect(q.newCount).toBe(1);
    });

    it('excludes known cards from both due and new', () => {
        const state: LeitnerState = { a: { box: 1, due: TODAY } };
        const q = buildQueue(ids, state, new Set(['a', 'b']), TODAY, 10);
        expect(q.queue).toEqual(['c', 'd', 'e']);
    });

    it('uses the default new-card limit', () => {
        const many = Array.from({ length: 50 }, (_, i) => `id${i}`);
        const q = buildQueue(many, {}, none, TODAY);
        expect(q.newCount).toBe(DEFAULT_NEW_PER_SESSION);
    });
});

describe('boxCounts', () => {
    it('counts unseen cards at index 0 and boxes 1-5, skipping known', () => {
        const state: LeitnerState = {
            a: { box: 1, due: TODAY },
            b: { box: 5, due: TODAY },
            c: { box: 5, due: TODAY },
        };
        const counts = boxCounts(['a', 'b', 'c', 'd', 'e'], state, new Set(['e']));
        expect(counts).toEqual([1, 1, 0, 0, 0, 2]); // d unseen; e excluded
    });
});
