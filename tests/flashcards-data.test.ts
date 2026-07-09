// Data-integrity smoke test for the generated deck. Runs in plain Node —
// no jsdom needed. Catches regressions when generate_vocab.py is edited.
// Lives outside src/ so the app's tsconfig (browser lib only) ignores it.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Flashcard } from '../src/types';

const deck: Flashcard[] = JSON.parse(
    readFileSync(join(process.cwd(), 'public', 'flashcards.json'), 'utf-8')
);

describe('flashcards.json', () => {
    it('has a full deck (~1000 cards)', () => {
        expect(deck.length).toBeGreaterThanOrEqual(1000);
    });

    it('has unique ids', () => {
        const ids = new Set(deck.map(c => c.id));
        expect(ids.size).toBe(deck.length);
    });

    it('has no blank required fields', () => {
        for (const c of deck) {
            expect(c.norwegianWord.trim(), c.id).not.toBe('');
            expect(c.englishMeaning.trim(), c.norwegianWord).not.toBe('');
            expect(c.exampleNorwegian.trim(), c.norwegianWord).not.toBe('');
            expect(c.exampleEnglish.trim(), c.norwegianWord).not.toBe('');
        }
    });

    it('gives every noun a valid gender', () => {
        const bad = deck.filter(c => c.partOfSpeech === 'noun' && !['en', 'ei', 'et'].includes(c.gender ?? ''));
        expect(bad.map(c => c.norwegianWord)).toEqual([]);
    });

    it('prefixes every verb with the infinitive marker "å "', () => {
        const bad = deck.filter(c => c.partOfSpeech === 'verb' && !c.norwegianWord.startsWith('å '));
        expect(bad.map(c => c.norwegianWord)).toEqual([]);
    });

    it('uses only known difficulty levels', () => {
        const bad = deck.filter(c => !['beginner', 'intermediate'].includes(c.difficultyLevel));
        expect(bad.map(c => c.norwegianWord)).toEqual([]);
    });
});
