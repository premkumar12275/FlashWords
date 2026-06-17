import React, { useEffect } from 'react';
import { useFlashcards } from './hooks/useFlashcards';
import { Flashcard } from './components/Flashcard';
import { Controls } from './components/Controls';
import { ProgressIndicator } from './components/ProgressIndicator';
import { GoTo } from './components/GoTo';

function App() {
  const {
    currentCard,
    currentIndex,
    totalCards,
    isFlipped,
    isShuffled,
    loading,
    handleFlip,
    handleNext,
    handlePrev,
    toggleShuffle,
    jumpToNumber,
    jumpToWord,
  } = useFlashcards();

  // Keyboard navigation — but ignore keys while typing in the go-to inputs.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNext, handlePrev, handleFlip]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-rose-50 to-amber-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-300/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-10 right-0 w-96 h-96 bg-fuchsia-300/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-amber-300/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-emerald-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      <header className="mb-10 text-center z-10">
        <div className="text-4xl mb-2 animate-float">🇳🇴</div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-2">
          <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-amber-500 bg-clip-text text-transparent">Norsk Flashcards</span>
        </h1>
        <p className="text-lg text-gray-600 font-medium">Lær norsk, ett kort om gangen ✨</p>
      </header>

      <main className="z-10 w-full max-w-md flex flex-col items-center">
        {loading ? (
          <div className="text-xl text-gray-500 font-medium animate-pulse">Loading words...</div>
        ) : (
          <>
            <ProgressIndicator currentIndex={currentIndex} total={totalCards} />

            <div className="mt-8 w-full flex justify-center">
              <Flashcard
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={handleFlip}
              />
            </div>

            <Controls
              onNext={handleNext}
              onPrev={handlePrev}
              onShuffle={toggleShuffle}
              isShuffled={isShuffled}
            />

            <GoTo
              total={totalCards}
              onJumpToWord={jumpToWord}
              onJumpToNumber={jumpToNumber}
            />
          </>
        )}
      </main>

      <footer className="absolute bottom-4 text-gray-400 text-sm text-center px-4">
        Click card or press Space to flip • ← → to navigate • search or jump to a number above
      </footer>
    </div>
  );
}

export default App;
