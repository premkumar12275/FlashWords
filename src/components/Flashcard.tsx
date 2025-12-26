import React from 'react';
import { motion } from 'framer-motion';
import { Flashcard as FlashcardType } from '../types';

interface FlashcardProps {
  card: FlashcardType;
  isFlipped: boolean;
  onFlip: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ card, isFlipped, onFlip }) => {
  return (
    <div className="relative w-full max-w-sm h-80 cursor-pointer perspective-1000" onClick={onFlip}>
      <motion.div
        className="w-full h-full relative preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center backface-hidden border border-gray-100">
          <h2 className="text-5xl font-bold text-gray-800 mb-4">{card.norwegianWord}</h2>
          <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Norwegian</span>
          <div className="absolute bottom-6 text-gray-400 text-xs">Tap to flip</div>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 w-full h-full bg-indigo-600 rounded-2xl shadow-xl flex flex-col items-center justify-center text-white backface-hidden"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="text-4xl font-bold mb-2">{card.englishMeaning}</div>
          <div className="text-indigo-200 italic mb-6">{card.partOfSpeech} • {card.gender}</div>
          
          <div className="px-8 text-center space-y-2">
            <p className="text-lg font-medium">"{card.exampleNorwegian}"</p>
            <p className="text-sm text-indigo-300">{card.exampleEnglish}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
