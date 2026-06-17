import React from 'react';

interface ProgressIndicatorProps {
  currentIndex: number;
  total: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentIndex, total }) => {
  return (
    <div className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-gray-700 shadow-md border border-white/60">
      <span className="text-base">📚</span>
      <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
        {currentIndex + 1}
      </span>
      <span className="text-gray-400">/ {total}</span>
    </div>
  );
};
