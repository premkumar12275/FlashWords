import { useState, useCallback, useEffect } from 'react';
import { Flashcard } from '../types';

export const useFlashcards = () => {
    const [deck, setDeck] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isShuffled, setIsShuffled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/flashcards.json')
            .then(res => res.json())
            .then(data => {
                setDeck(data);
                setLoading(false);
            })
            .catch(err => console.error("Failed to load flashcards", err));
    }, []);

    const currentCard = deck[currentIndex];

    const handleNext = useCallback(() => {
        if (deck.length === 0) return;
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % deck.length);
        }, 200);
    }, [deck.length]);

    const handlePrev = useCallback(() => {
        if (deck.length === 0) return;
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
        }, 200);
    }, [deck.length]);

    const handleFlip = useCallback(() => {
        setIsFlipped((prev) => !prev);
    }, []);

    const toggleShuffle = useCallback(() => {
        if (deck.length === 0) return;
        setIsFlipped(false);
        setIsShuffled((prev) => !prev);
    }, [deck.length]);

    // Effect to handle shuffling
    useEffect(() => {
        if (deck.length === 0) return;

        if (isShuffled) {
            const shuffled = [...deck].sort(() => Math.random() - 0.5);
            setDeck(shuffled);
        } else {
            // If we want to un-shuffle, we might need the original order. 
            // For now, re-fetching or keeping a separate ref would be ideal, 
            // but simple toggle off can just reload or keep current.
            // Let's re-fetch to be safe and simple for now, or just not support returning to exact original order without a ref.
            // Improvement: Keep originalDeck in a ref.
            fetch('/flashcards.json')
                .then(res => res.json())
                .then(data => setDeck(data));
        }
        setCurrentIndex(0);
    }, [isShuffled]);

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
        toggleShuffle
    };
};
