import React from 'react';
import { useFlashcards } from './hooks/useFlashcards';
import { Flashcard } from './components/Flashcard';
import { Controls } from './components/Controls';
import { ProgressIndicator } from './components/ProgressIndicator';

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
    toggleShuffle
  } = useFlashcards();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <header className="mb-12 text-center z-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-2">
          Norsk <span className="text-indigo-600">Flashcards</span>
        </h1>
        <p className="text-lg text-gray-600">Master beginner Norwegian vocabulary</p>
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
          </>
        )}
      </main>

      <footer className="absolute bottom-4 text-gray-400 text-sm">
        Click card to flip • Use arrows to navigate
      </footer>
    </div>
  );
}

export default App;
