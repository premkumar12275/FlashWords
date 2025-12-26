import React from 'react';

interface ProgressIndicatorProps {
  currentIndex: number;
  total: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentIndex, total }) => {
  return (
    <div className="absolute top-8 right-8 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-600 shadow-sm">
      {currentIndex + 1} / {total}
    </div>
  );
};
