import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Flashcard } from '../types';
import { loadJSON, saveJSON } from '../utils/storage';
import {
    LeitnerState, buildQueue, boxCounts, grade, todayISO,
    DEFAULT_NEW_PER_SESSION,
} from '../utils/leitner';

const LEITNER_KEY = 'flashwords:leitner:v1';

export interface ReviewStats {
    correct: number;
    again: number;
}

// Drives one review session over the Leitner queue. Wrong answers are
// re-queued at the end of the session until answered correctly.
export const useReview = (allCards: Flashcard[], knownIds: Set<string>) => {
    const [state, setState] = useState<LeitnerState>(() => loadJSON(LEITNER_KEY, {}));
    const [queue, setQueue] = useState<string[]>([]);
    const [sessionSize, setSessionSize] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [stats, setStats] = useState<ReviewStats>({ correct: 0, again: 0 });
    const startedRef = useRef(false);

    const cardById = useMemo(
        () => new Map(allCards.map(c => [c.id, c])),
        [allCards]);

    // Build today's queue once, when the deck first arrives. knownIds changes
    // mid-session intentionally don't rebuild it.
    useEffect(() => {
        if (allCards.length === 0 || startedRef.current) return;
        startedRef.current = true;
        const { queue: q } = buildQueue(allCards.map(c => c.id), state, knownIds, todayISO());
        setQueue(q);
        setSessionSize(q.length);
    }, [allCards, state, knownIds]);

    const currentCard: Flashcard | undefined = queue.length > 0 ? cardById.get(queue[0]) : undefined;
    const done = startedRef.current && allCards.length > 0 && queue.length === 0;

    const flip = useCallback(() => setIsFlipped(prev => !prev), []);

    const gradeCard = useCallback((correct: boolean) => {
        if (queue.length === 0) return;
        const id = queue[0];
        const today = todayISO();
        setState(prev => {
            const next = { ...prev, [id]: grade(prev[id], correct, today) };
            saveJSON(LEITNER_KEY, next);
            return next;
        });
        setStats(prev => correct
            ? { ...prev, correct: prev.correct + 1 }
            : { ...prev, again: prev.again + 1 });
        setIsFlipped(false);
        // let the card flip back before it changes
        setTimeout(() => {
            setQueue(q => {
                if (q[0] !== id) return q; // double-click guard
                return correct ? q.slice(1) : [...q.slice(1), id];
            });
        }, 150);
    }, [queue]);

    // After finishing today's queue: pull in the next batch of never-seen
    // words. buildQueue skips cards already in `state`, so this naturally
    // continues where the last batch stopped.
    const learnMore = useCallback(() => {
        const { queue: q } = buildQueue(
            allCards.map(c => c.id), state, knownIds, todayISO(), DEFAULT_NEW_PER_SESSION);
        setQueue(q);
        setSessionSize(q.length);
        setStats({ correct: 0, again: 0 });
        setIsFlipped(false);
    }, [allCards, state, knownIds]);

    const distribution = useMemo(
        () => boxCounts(allCards.map(c => c.id), state, knownIds),
        [allCards, state, knownIds]);

    return {
        currentCard,
        remaining: queue.length,
        sessionSize,
        isFlipped,
        flip,
        gradeCard,
        done,
        stats,
        distribution, // [new, box1..box5]
        learnMore,
    };
};
