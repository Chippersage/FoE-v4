"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Play,
  Pause,
  Zap,
} from "lucide-react";
import type { Word } from "@/types/types";

interface FlashcardModeProps {
  words: Word[];
  audioEnabled?: boolean;
}

export default function FlashcardMode({
  words,
  audioEnabled = true,
}: FlashcardModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set());
  const [autoMode, setAutoMode] = useState(false);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const [cardAnimation, setCardAnimation] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [backgroundMusic, setBackgroundMusic] = useState<{
    context: AudioContext | null;
    oscillator: OscillatorNode | null;
    gainNode: GainNode | null;
  }>({ context: null, oscillator: null, gainNode: null });

  useEffect(() => {
    if (audioEnabled) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }

    return () => stopBackgroundMusic();
  }, [audioEnabled]);

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  // Auto-progression logic
  useEffect(() => {
    let flipTimer: NodeJS.Timeout;
    let nextTimer: NodeJS.Timeout;

    if (autoMode) {
      if (!isFlipped) {
        flipTimer = setTimeout(() => {
          handleFlip();
        }, 2000);
      } else {
        nextTimer = setTimeout(() => {
          if (currentIndex < words.length - 1) {
            handleNext();
          } else {
            setAutoMode(false);
            triggerSuccessAnimation();
          }
        }, 3000);
      }
    }

    return () => {
      clearTimeout(flipTimer);
      clearTimeout(nextTimer);
    };
  }, [autoMode, isFlipped, currentIndex]);

  const createParticles = useCallback((x: number, y: number) => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 100,
      y: y + (Math.random() - 0.5) * 100,
    }));
    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.find((np) => np.id === p.id))
      );
    }, 1000);
  }, []);

  const startBackgroundMusic = () => {
    if (!audioEnabled) return;

    try {
      const context = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create multiple oscillators for a richer ambient sound
      const osc1 = context.createOscillator();
      const osc2 = context.createOscillator();
      const osc3 = context.createOscillator();

      const gain1 = context.createGain();
      const gain2 = context.createGain();
      const gain3 = context.createGain();
      const masterGain = context.createGain();

      // Connect oscillators
      osc1.connect(gain1);
      osc2.connect(gain2);
      osc3.connect(gain3);

      gain1.connect(masterGain);
      gain2.connect(masterGain);
      gain3.connect(masterGain);
      masterGain.connect(context.destination);

      // Set frequencies for a pleasant chord (C major)
      osc1.frequency.setValueAtTime(130.81, context.currentTime); // C3
      osc2.frequency.setValueAtTime(164.81, context.currentTime); // E3
      osc3.frequency.setValueAtTime(196.0, context.currentTime); // G3

      // Set oscillator types for different timbres
      osc1.type = "sine";
      osc2.type = "triangle";
      osc3.type = "sine";

      // Set very low volumes
      gain1.gain.setValueAtTime(0.015, context.currentTime);
      gain2.gain.setValueAtTime(0.01, context.currentTime);
      gain3.gain.setValueAtTime(0.012, context.currentTime);
      masterGain.gain.setValueAtTime(0.3, context.currentTime);

      // Add subtle modulation
      const lfo = context.createOscillator();
      const lfoGain = context.createGain();

      lfo.connect(lfoGain);
      lfoGain.connect(masterGain.gain);

      lfo.frequency.setValueAtTime(0.2, context.currentTime);
      lfoGain.gain.setValueAtTime(0.05, context.currentTime);

      // Start all oscillators
      osc1.start();
      osc2.start();
      osc3.start();
      lfo.start();

      setBackgroundMusic({ context, oscillator: osc1, gainNode: masterGain });
    } catch (error) {
      console.log("Background music not supported");
    }
  };

  const stopBackgroundMusic = () => {
    if (backgroundMusic.context && backgroundMusic.oscillator) {
      try {
        backgroundMusic.context.close();
        setBackgroundMusic({ context: null, oscillator: null, gainNode: null });
      } catch (error) {
        console.log("Error stopping background music");
      }
    }
  };

  const playSound = (type: "flip" | "next" | "complete" | "success") => {
    if (!audioEnabled) return;

    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case "flip":
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          400,
          audioContext.currentTime + 0.1
        );
        break;
      case "next":
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          800,
          audioContext.currentTime + 0.1
        );
        break;
      case "success":
        // Play a chord
        const frequencies = [523, 659, 784]; // C, E, G
        frequencies.forEach((freq, i) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.setValueAtTime(freq, audioContext.currentTime);
          gain.gain.setValueAtTime(0.1, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.5
          );
          osc.start(audioContext.currentTime + i * 0.1);
          osc.stop(audioContext.currentTime + 0.5 + i * 0.1);
        });
        return;
      case "complete":
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(
          659,
          audioContext.currentTime + 0.1
        );
        oscillator.frequency.setValueAtTime(
          784,
          audioContext.currentTime + 0.2
        );
        break;
    }

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.2
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const handleFlip = () => {
    setCardAnimation("animate-flip-in");
    setIsFlipped(!isFlipped);
    playSound("flip");

    setTimeout(() => setCardAnimation(""), 600);
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCompletedWords((prev) => new Set([...prev, currentIndex]));
      setCardAnimation("animate-slide-out-right");

      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
        setCardAnimation("animate-slide-in-left");
        playSound("next");

        setTimeout(() => setCardAnimation(""), 500);
      }, 300);
    } else {
      triggerSuccessAnimation();
      playSound("complete");
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCardAnimation("animate-slide-out-left");

      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setIsFlipped(false);
        setCardAnimation("animate-slide-in-right");
        playSound("next");

        setTimeout(() => setCardAnimation(""), 500);
      }, 300);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompletedWords(new Set());
    setAutoMode(false);
    setShowSuccess(false);
  };

  const triggerSuccessAnimation = () => {
    setShowSuccess(true);
    playSound("success");
    createParticles(window.innerWidth / 2, window.innerHeight / 2);

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const speakWord = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-2xl mx-auto relative">
      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 bg-yellow-400 rounded-full animate-particle-burst pointer-events-none z-20"
          style={{
            left: particle.x,
            top: particle.y,
          }}
        />
      ))}

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center animate-bounce-in">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">
              Fantastic!
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              You've mastered all the words!
            </p>
          </div>
        </div>
      )}

      {/* Enhanced Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {currentIndex + 1} / {words.length}
          </span>
        </div>
        <Progress value={progress} className="h-3 animate-pulse-progress" />
        <div className="flex justify-center mt-2">
          {words.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 mx-1 rounded-full transition-all duration-500 ${
                index === currentIndex
                  ? "bg-blue-600 scale-150 animate-pulse"
                  : completedWords.has(index)
                  ? "bg-green-500 animate-bounce-subtle"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Flashcard */}
      <div className="perspective-1000 mb-8 relative">
        <div
          className={`relative w-full h-80 transition-all duration-700 transform-style-preserve-3d cursor-pointer hover:scale-105 ${
            isFlipped ? "rotate-y-180" : ""
          } ${cardAnimation}`}
          onClick={!autoMode ? handleFlip : undefined}
        >
          {/* Front of card */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 shadow-2xl flex items-center justify-center p-8 animate-gradient-shift">
            <div className="text-center">
              <div className="animate-float mb-4">
                <h2 className="text-3xl font-bold text-white mb-4 animate-text-glow">
                  {currentWord.term}
                </h2>
              </div>
              <p className="text-blue-100 text-lg animate-fade-in-up">
                {autoMode ? "Auto-revealing..." : "Click to reveal meaning"}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 text-white hover:bg-white/20 animate-bounce-subtle"
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(currentWord.term);
                }}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Back of card */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl bg-gradient-to-br from-green-500 via-teal-600 to-blue-500 shadow-2xl flex items-center justify-center p-8 animate-gradient-shift">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4 animate-text-glow">
                {currentWord.term}
              </h3>
              <p className="text-white text-lg mb-4 animate-fade-in-up">
                {currentWord.meaning}
              </p>
              {currentWord.example && (
                <p className="text-green-100 italic animate-fade-in-up animation-delay-200">
                  "{currentWord.example}"
                </p>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 text-white hover:bg-white/20 animate-bounce-subtle"
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(currentWord.meaning);
                }}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Auto Mode Indicator */}
        {autoMode && (
          <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold animate-pulse z-10">
            <Zap className="w-4 h-4 inline mr-1" />
            AUTO
          </div>
        )}
      </div>

      {/* Enhanced Controls */}
      <div className="flex justify-center items-center gap-4 flex-wrap">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 hover:scale-110 transition-transform duration-300"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <Button
          variant="outline"
          onClick={() => setAutoMode(!autoMode)}
          className={`flex items-center gap-2 transition-all duration-300 hover:scale-110 ${
            autoMode ? "bg-yellow-100 text-yellow-700 animate-pulse" : ""
          }`}
        >
          {autoMode ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {autoMode ? "Stop Auto" : "Auto Mode"}
        </Button>

        <Button
          variant="outline"
          onClick={handleReset}
          className="flex items-center gap-2 hover:scale-110 transition-transform duration-300"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>

        <Button
          onClick={handleNext}
          disabled={currentIndex === words.length - 1}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 hover:scale-110 transition-all duration-300 animate-pulse-button"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Completion Message */}
      {currentIndex === words.length - 1 && isFlipped && (
        <div className="mt-8 text-center p-6 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg animate-bounce-in">
          <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2 animate-text-glow">
            🎉 Congratulations!
          </h3>
          <p className="text-green-600 dark:text-green-300">
            You've completed all vocabulary words!
          </p>
        </div>
      )}
    </div>
  );
}
