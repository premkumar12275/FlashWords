export type DifficultyLevel = 'beginner' | 'intermediate';

export interface Flashcard {
    id: string;
    norwegianWord: string;
    englishMeaning: string;
    partOfSpeech: string;
    gender?: 'en' | 'ei' | 'et';
    exampleNorwegian: string;
    exampleEnglish: string;
    pronunciation?: string;
    difficultyLevel: DifficultyLevel;
}
