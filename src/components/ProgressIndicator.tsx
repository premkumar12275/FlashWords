import React from 'react';

interface ProgressIndicatorProps {
  currentIndex: number;
  total: number;
  knownCount: number;
  totalAll: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentIndex, total, knownCount, totalAll }) => {
  return (
    <div className="absolute top-6 right-6 z-20 flex items-center gap-3 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-gray-700 shadow-md border border-white/60">
      <span className="flex items-center gap-1.5">
        <span className="text-base">📚</span>
        <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
          {total === 0 ? 0 : currentIndex + 1}
        </span>
        <span className="text-gray-400">/ {total}</span>
      </span>
      <span className="w-px h-4 bg-gray-200" />
      <span className="flex items-center gap-1.5" title={`${knownCount} of ${totalAll} words marked as known`}>
        <span className="text-base">✅</span>
        <span className="text-emerald-600">{knownCount}</span>
      </span>
    </div>
  );
};
