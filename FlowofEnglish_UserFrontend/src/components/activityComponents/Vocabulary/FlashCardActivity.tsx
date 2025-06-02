"use client";

import { useState, useEffect } from "react";
// import { StudyHeader } from "./study-header";
import { ProgressSection } from "./progress-section";
import { StatsGrid } from "../stats/stats-grid";
import { FlashCard } from "../cards/flash-card";
import { DifficultyIndicator } from "../cards/difficulty-indicator";
import { FloatingInstructions } from "../ui/floating-instructions";
import { CelebrationAnimation } from "../ui/celebration-animation";
import { AnswerFeedback } from "../ui/answer-feedback";
import type {
  VocabularyCard,
  StudySession as StudySessionType,
} from "../../../types/vocabulary";

interface StudySessionProps {
  cards: VocabularyCard[];
  currentCardIndex: number;
  session: StudySessionType;
  currentSet: string;
  onAnswer: (isCorrect: boolean) => void;
  onEndStudy: () => void;
  onReset: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  playSound: (type: "correct" | "incorrect" | "flip" | "complete") => void;
}

export function StudySession({
  cards,
  currentCardIndex,
  session,
  currentSet,
  onAnswer,
  onEndStudy,
  onReset,
  soundEnabled,
  onSoundToggle,
  playSound,
}: StudySessionProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<
    "correct" | "incorrect" | null
  >(null);

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / cards.length) * 100;
  const accuracy =
    session.totalCards > 0 ? (session.correct / session.totalCards) * 100 : 0;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(true);
    playSound("flip");
  };

  const handleAnswer = (isCorrect: boolean) => {
    setAnswerFeedback(isCorrect ? "correct" : "incorrect");
    onAnswer(isCorrect);

    if (isCorrect && session.streak + 1 === 5) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }

    setTimeout(() => {
      setAnswerFeedback(null);
      if (currentCardIndex < cards.length - 1) {
        setIsFlipped(false);
        setShowAnswer(false);
      } else {
        onEndStudy();
      }
    }, 1500);
  };

  // Reset card state when moving to next card
  useEffect(() => {
    setIsFlipped(false);
    setShowAnswer(false);
  }, [currentCardIndex]);

  return (
    <div className="max-w-4xl mx-auto">
      <StudyHeader
        onBack={onEndStudy}
        onReset={onReset}
        soundEnabled={soundEnabled}
        onSoundToggle={onSoundToggle}
      />

      <ProgressSection
        currentCardIndex={currentCardIndex}
        totalCards={cards.length}
        progress={progress}
      />

      <StatsGrid session={session} accuracy={accuracy} />

      <FlashCard
        card={currentCard}
        currentSet={currentSet}
        isFlipped={isFlipped}
        showAnswer={showAnswer}
        onFlip={handleFlip}
        onAnswer={handleAnswer}
      />

      <DifficultyIndicator difficulty={currentCard?.difficulty || 1} />

      {!showAnswer && <FloatingInstructions />}

      {showCelebration && <CelebrationAnimation />}
      {answerFeedback && <AnswerFeedback type={answerFeedback} />}
    </div>
  );
}
