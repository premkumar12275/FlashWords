import React, { useEffect, useState, useCallback } from 'react';
import { useFlashcards } from './hooks/useFlashcards';
import { useReview } from './hooks/useReview';
import { Flashcard } from './components/Flashcard';
import { Controls } from './components/Controls';
import { ProgressIndicator } from './components/ProgressIndicator';
import { GoTo } from './components/GoTo';
import { StudyBar } from './components/StudyBar';
import { ModeTabs, Mode } from './components/ModeTabs';
import { ReviewSession } from './components/ReviewSession';
import { loadJSON, saveJSON } from './utils/storage';

const MODE_KEY = 'flashwords:mode:v1';

// The whole study experience (browse + review). Mounted with a React key of
// the signed-in user id, so switching accounts remounts everything and every
// hook re-reads its (namespaced) storage.
export function StudyApp() {
  const {
    allCards,
    knownIds,
    currentCard,
    currentIndex,
    totalCards,
    totalAll,
    knownCount,
    isCurrentKnown,
    categories,
    settings,
    updateSettings,
    isFlipped,
    isShuffled,
    loading,
    handleFlip,
    handleNext,
    handlePrev,
    toggleShuffle,
    toggleKnown,
    jumpToNumber,
    jumpToWord,
  } = useFlashcards();

  const review = useReview(allCards, knownIds);

  const [mode, setMode] = useState<Mode>(() => loadJSON<Mode>(MODE_KEY, 'browse'));
  const changeMode = useCallback((m: Mode) => {
    setMode(m);
    saveJSON(MODE_KEY, m);
  }, []);

  // Browse-mode keys. Review mode registers its own handler inside
  // ReviewSession, so bail out here to avoid double-handling.
  useEffect(() => {
    if (mode !== 'browse') return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'k' || e.key === 'K') toggleKnown();
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, handleNext, handlePrev, handleFlip, toggleKnown]);

  const emptyDeck = !loading && totalCards === 0;

  return (
    <>
      {loading ? (
        <div className="text-xl text-gray-500 font-medium animate-pulse">Loading words...</div>
      ) : (
        <>
          <ModeTabs mode={mode} reviewBadge={review.remaining} onChange={changeMode} />

          {mode === 'review' ? (
            <ReviewSession
              card={review.currentCard}
              direction={settings.direction}
              remaining={review.remaining}
              sessionSize={review.sessionSize}
              isFlipped={review.isFlipped}
              onFlip={review.flip}
              onGrade={review.gradeCard}
              done={review.done}
              stats={review.stats}
              distribution={review.distribution}
              onLearnMore={review.learnMore}
            />
          ) : (
            <>
              <ProgressIndicator
                currentIndex={currentIndex}
                total={totalCards}
                knownCount={knownCount}
                totalAll={totalAll}
              />

              <StudyBar settings={settings} categories={categories} onChange={updateSettings} />

              {emptyDeck ? (
                <div className="w-full max-w-sm h-80 rounded-3xl bg-white/80 backdrop-blur-md shadow-2xl border border-white/60 flex flex-col items-center justify-center text-center px-8 animate-pop-in">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Gratulerer!</h2>
                  <p className="text-gray-500 mb-6">
                    You know every word in this selection. Change the filter — or unhide known words to review them.
                  </p>
                  <button
                    onClick={() => updateSettings({ hideKnown: false })}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white font-bold shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
                  >
                    Show known words
                  </button>
                </div>
              ) : (
                currentCard && (
                  <>
                    <div className="w-full flex justify-center">
                      <Flashcard
                        card={currentCard}
                        direction={settings.direction}
                        isFlipped={isFlipped}
                        onFlip={handleFlip}
                      />
                    </div>

                    <Controls
                      onNext={handleNext}
                      onPrev={handlePrev}
                      onShuffle={toggleShuffle}
                      onToggleKnown={toggleKnown}
                      isShuffled={isShuffled}
                      isKnown={isCurrentKnown}
                    />

                    <GoTo
                      total={totalCards}
                      onJumpToWord={jumpToWord}
                      onJumpToNumber={jumpToNumber}
                    />
                  </>
                )
              )}
            </>
          )}
        </>
      )}

      <footer className="absolute bottom-4 left-0 right-0 text-gray-400 text-sm text-center px-4">
        {mode === 'review'
          ? 'Space to flip • 1 = again, 2 = got it'
          : 'Space to flip • ← → to navigate • K to mark known'}
      </footer>
    </>
  );
}
