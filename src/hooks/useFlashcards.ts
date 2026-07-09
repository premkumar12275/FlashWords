import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Flashcard } from '../types';
import { loadJSON, saveJSON } from '../utils/storage';

export type Direction = 'no-en' | 'en-no';

export interface StudySettings {
    direction: Direction;
    category: string;      // 'all' or a partOfSpeech value
    hideKnown: boolean;
}

export interface SearchResult {
    found: boolean;
    index: number;
    matches: number;
}

const KNOWN_KEY = 'flashwords:known:v1';
const SETTINGS_KEY = 'flashwords:settings:v1';
const LAST_CARD_KEY = 'flashwords:lastCard:v1';

const DEFAULT_SETTINGS: StudySettings = { direction: 'no-en', category: 'all', hideKnown: false };

const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

export const useFlashcards = () => {
    const [allCards, setAllCards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFlipped, setIsFlipped] = useState(false);

    // The current card is tracked by ID (not index) so it survives deck
    // changes — filters, shuffle, reload — without effect races. The index is
    // derived below.
    const [currentId, setCurrentId] = useState<string | null>(() =>
        loadJSON<string | null>(LAST_CARD_KEY, null));

    // Shuffle is stored as a full ordering of card ids (null = original order).
    // Keeping the ordering separate from the filtered deck means changing a
    // filter doesn't reshuffle everything.
    const [orderIds, setOrderIds] = useState<string[] | null>(null);
    const isShuffled = orderIds !== null;

    const [settings, setSettings] = useState<StudySettings>(() =>
        ({ ...DEFAULT_SETTINGS, ...loadJSON<Partial<StudySettings>>(SETTINGS_KEY, {}) }));
    const [knownIds, setKnownIds] = useState<Set<string>>(() =>
        new Set(loadJSON<string[]>(KNOWN_KEY, [])));

    useEffect(() => {
        fetch('/flashcards.json')
            .then(res => res.json())
            .then((data: Flashcard[]) => {
                setAllCards(data);
                setLoading(false);
            })
            .catch(err => console.error('Failed to load flashcards', err));
    }, []);

    // Distinct categories, in order of first appearance in the deck.
    const categories = useMemo(() => {
        const seen: string[] = [];
        for (const c of allCards) if (!seen.includes(c.partOfSpeech)) seen.push(c.partOfSpeech);
        return seen;
    }, [allCards]);

    const filteredDeck = useMemo(() => allCards.filter(c =>
        (settings.category === 'all' || c.partOfSpeech === settings.category) &&
        (!settings.hideKnown || !knownIds.has(c.id))
    ), [allCards, settings.category, settings.hideKnown, knownIds]);

    const deck = useMemo(() => {
        if (!orderIds) return filteredDeck;
        const pos = new Map(orderIds.map((id, i) => [id, i]));
        return [...filteredDeck].sort((a, b) => (pos.get(a.id) ?? 0) - (pos.get(b.id) ?? 0));
    }, [filteredDeck, orderIds]);

    // Derived position: the current card's place in the active deck. If the
    // card is no longer present (filtered out / hidden), stay at the same
    // numeric position instead of jumping to the top.
    const lastIndexRef = useRef(0);
    const currentIndex = useMemo(() => {
        if (deck.length === 0) return 0;
        const idx = currentId ? deck.findIndex(c => c.id === currentId) : -1;
        return idx >= 0 ? idx : Math.min(lastIndexRef.current, deck.length - 1);
    }, [deck, currentId]);

    useEffect(() => {
        lastIndexRef.current = currentIndex;
    }, [currentIndex]);

    const currentCard: Flashcard | undefined = deck[currentIndex];

    // Remember where we are for the next visit.
    useEffect(() => {
        if (currentCard) saveJSON(LAST_CARD_KEY, currentCard.id);
    }, [currentCard]);

    const goToIndex = useCallback((index: number) => {
        if (deck.length === 0) return;
        setIsFlipped(false);
        setCurrentId(deck[Math.max(0, Math.min(index, deck.length - 1))].id);
    }, [deck]);

    const handleNext = useCallback(() => {
        if (deck.length === 0) return;
        setIsFlipped(false);
        const target = deck[(currentIndex + 1) % deck.length].id;
        setTimeout(() => setCurrentId(target), 150);
    }, [deck, currentIndex]);

    const handlePrev = useCallback(() => {
        if (deck.length === 0) return;
        setIsFlipped(false);
        const target = deck[(currentIndex - 1 + deck.length) % deck.length].id;
        setTimeout(() => setCurrentId(target), 150);
    }, [deck, currentIndex]);

    const handleFlip = useCallback(() => {
        setIsFlipped(prev => !prev);
    }, []);

    const toggleShuffle = useCallback(() => {
        setIsFlipped(false);
        setCurrentId(null);          // start from the top of the new order
        lastIndexRef.current = 0;
        setOrderIds(prev => prev ? null : shuffle(allCards.map(c => c.id)));
    }, [allCards]);

    const toggleKnown = useCallback(() => {
        if (!currentCard) return;
        const id = currentCard.id;
        setKnownIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            saveJSON(KNOWN_KEY, [...next]);
            return next;
        });
    }, [currentCard]);

    const updateSettings = useCallback((patch: Partial<StudySettings>) => {
        setIsFlipped(false);
        setSettings(prev => {
            const next = { ...prev, ...patch };
            saveJSON(SETTINGS_KEY, next);
            return next;
        });
    }, []);

    // Jump to a card by its (1-based) position in the current deck.
    const jumpToNumber = useCallback((oneBased: number): SearchResult => {
        if (deck.length === 0 || Number.isNaN(oneBased)) return { found: false, index: currentIndex, matches: 0 };
        const index = oneBased - 1;
        if (index < 0 || index >= deck.length) return { found: false, index: currentIndex, matches: 0 };
        goToIndex(index);
        return { found: true, index, matches: 1 };
    }, [deck, currentIndex, goToIndex]);

    // Jump to a card by Norwegian or English word. Prefers an exact match
    // (ignoring "å "/"to " prefixes); reports how many cards matched.
    const jumpToWord = useCallback((query: string): SearchResult => {
        const q = query.trim().toLowerCase();
        if (!q || deck.length === 0) return { found: false, index: currentIndex, matches: 0 };

        const norm = (s: string) => s.toLowerCase().replace(/^å\s+/, '').replace(/^to\s+/, '');
        const matchIdxs: number[] = [];
        let exactIdx = -1;
        deck.forEach((c, i) => {
            const sub = c.norwegianWord.toLowerCase().includes(q) || c.englishMeaning.toLowerCase().includes(q);
            const exact = norm(c.norwegianWord) === q || norm(c.englishMeaning) === q;
            if (sub || exact) matchIdxs.push(i);
            if (exact && exactIdx === -1) exactIdx = i;
        });

        if (matchIdxs.length === 0) return { found: false, index: currentIndex, matches: 0 };
        const target = exactIdx !== -1 ? exactIdx : matchIdxs[0];
        goToIndex(target);
        return { found: true, index: target, matches: matchIdxs.length };
    }, [deck, currentIndex, goToIndex]);

    return {
        currentCard,
        currentIndex,
        totalCards: deck.length,
        totalAll: allCards.length,
        knownCount: knownIds.size,
        isCurrentKnown: currentCard ? knownIds.has(currentCard.id) : false,
        categories,
        settings,
        updateSettings,
        isFlipped,
        isShuffled,
        loading,
        handleNext,
        handlePrev,
        handleFlip,
        toggleShuffle,
        toggleKnown,
        jumpToNumber,
        jumpToWord,
    };
};
