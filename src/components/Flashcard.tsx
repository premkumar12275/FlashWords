import React from 'react';
import { motion } from 'framer-motion';
import { Flashcard as FlashcardType } from '../types';
import { categoryStyle, genderStyle } from '../utils/category';

interface FlashcardProps {
  card: FlashcardType;
  isFlipped: boolean;
  onFlip: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ card, isFlipped, onFlip }) => {
  const cat = categoryStyle(card.partOfSpeech);
  const isBeginner = card.difficultyLevel === 'beginner';

  return (
    <motion.div
      className="relative w-full max-w-sm h-80 cursor-pointer perspective-1000"
      onClick={onFlip}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div className="absolute inset-0 w-full h-full bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center backface-hidden border border-gray-100 overflow-hidden">
          {/* category color glow */}
          <div className={`absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br ${cat.frontGlow} to-transparent blur-2xl`} />

          {/* top badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${cat.badge}`}>
              <span>{cat.emoji}</span> {cat.label}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${isBeginner ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {isBeginner ? 'Beginner' : 'Intermediate'}
            </span>
          </div>

          <h2 className="relative text-5xl font-extrabold text-gray-800 text-center px-6">{card.norwegianWord}</h2>

          {card.gender && (
            <span className={`relative mt-4 px-3 py-1 rounded-full text-sm font-bold ${genderStyle[card.gender] ?? 'bg-gray-100 text-gray-700'}`}>
              {card.gender}
            </span>
          )}

          <div className="absolute bottom-5 text-gray-400 text-xs font-medium">Tap to flip ↻</div>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 w-full h-full bg-gradient-to-br ${cat.back} rounded-3xl shadow-2xl flex flex-col items-center justify-center text-white backface-hidden overflow-hidden px-6`}
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />

          <span className="relative inline-flex items-center gap-1 px-3 py-1 mb-4 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm">
            <span>{cat.emoji}</span> {cat.label}{card.gender ? ` • ${card.gender}` : ''}
          </span>

          <div className="relative text-4xl font-extrabold mb-1 text-center">{card.englishMeaning}</div>

          <div className="relative mt-5 w-full max-w-xs rounded-2xl bg-white/15 backdrop-blur-sm px-4 py-3 text-center space-y-1">
            <p className="text-base font-semibold leading-snug">"{card.exampleNorwegian}"</p>
            <p className={`text-sm ${cat.accentText}`}>{card.exampleEnglish}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
