import { useState, useCallback, useEffect, useRef } from 'react';
import { Flashcard } from '../types';

export interface SearchResult {
    found: boolean;
    index: number;
}

export const useFlashcards = () => {
    // The deck currently shown (may be shuffled). originalDeck keeps load order
    // so toggling shuffle off restores the original sequence without re-fetching.
    const [deck, setDeck] = useState<Flashcard[]>([]);
    const originalDeck = useRef<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isShuffled, setIsShuffled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/flashcards.json')
            .then(res => res.json())
            .then((data: Flashcard[]) => {
                originalDeck.current = data;
                setDeck(data);
                setLoading(false);
            })
            .catch(err => console.error("Failed to load flashcards", err));
    }, []);

    const currentCard = deck[currentIndex];

    const goToIndex = useCallback((index: number) => {
        if (deck.length === 0) return;
        const clamped = Math.max(0, Math.min(index, deck.length - 1));
        setIsFlipped(false);
        setCurrentIndex(clamped);
    }, [deck.length]);

    const handleNext = useCallback(() => {
        if (deck.length === 0) return;
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % deck.length);
        }, 150);
    }, [deck.length]);

    const handlePrev = useCallback(() => {
        if (deck.length === 0) return;
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
        }, 150);
    }, [deck.length]);

    const handleFlip = useCallback(() => {
        setIsFlipped((prev) => !prev);
    }, []);

    // Jump to a card by its (1-based) position.
    const jumpToNumber = useCallback((oneBased: number): SearchResult => {
        if (deck.length === 0 || Number.isNaN(oneBased)) return { found: false, index: currentIndex };
        const index = oneBased - 1;
        if (index < 0 || index >= deck.length) return { found: false, index: currentIndex };
        goToIndex(index);
        return { found: true, index };
    }, [deck, currentIndex, goToIndex]);

    // Jump to a card by typing a Norwegian or English word.
    // Prefers an exact match (ignoring the "å " verb prefix), else first substring match.
    const jumpToWord = useCallback((query: string): SearchResult => {
        const q = query.trim().toLowerCase();
        if (!q || deck.length === 0) return { found: false, index: currentIndex };

        const norm = (s: string) => s.toLowerCase().replace(/^å\s+/, '').replace(/^to\s+/, '');

        let index = deck.findIndex(
            c => norm(c.norwegianWord) === q || norm(c.englishMeaning) === q
        );
        if (index === -1) {
            index = deck.findIndex(
                c => c.norwegianWord.toLowerCase().includes(q) ||
                     c.englishMeaning.toLowerCase().includes(q)
            );
        }
        if (index === -1) return { found: false, index: currentIndex };
        goToIndex(index);
        return { found: true, index };
    }, [deck, currentIndex, goToIndex]);

    const toggleShuffle = useCallback(() => {
        if (originalDeck.current.length === 0) return;
        setIsFlipped(false);
        setCurrentIndex(0);
        setIsShuffled((prev) => {
            const next = !prev;
            if (next) {
                const shuffled = [...originalDeck.current];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                setDeck(shuffled);
            } else {
                setDeck(originalDeck.current);
            }
            return next;
        });
    }, []);

    return {
        currentCard,
        currentIndex,
        totalCards: deck.length,
        isFlipped,
        isShuffled,
        loading,
        handleNext,
        handlePrev,
        handleFlip,
        toggleShuffle,
        jumpToNumber,
        jumpToWord,
    };
};
