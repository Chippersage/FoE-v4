"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
  Eye,
  EyeOff,
  Play,
  Pause,
  Zap,
  Sparkles,
} from "lucide-react";
import type { Word } from "@/types/types";

interface SliderModeProps {
  setScorePercentage: React.Dispatch<React.SetStateAction<number>>;
  subconceptMaxscore: number;
  setSubmissionPayload?: React.Dispatch<
    React.SetStateAction<{
      userAttemptFlag: boolean;
      userAttemptScore: number;
    } | null>
  >;
  triggerSubmit: () => void;
  words: Word[];
  audioEnabled?: boolean;
}

export default function SliderMode({
  triggerSubmit,
  words,
  audioEnabled = true,
  setScorePercentage,
  subconceptMaxscore,
  setSubmissionPayload,
}: SliderModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set());
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right"
  );
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const [wordAnimation, setWordAnimation] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  // Add the same background music state and functions as in flashcard-mode.tsx
  const [backgroundMusic, setBackgroundMusic] = useState<{
    context: AudioContext | null;
    oscillator: OscillatorNode | null;
    gainNode: GainNode | null;
  }>({ context: null, oscillator: null, gainNode: null });

  // Add the same useEffect and background music functions as in flashcard-mode.tsx
  useEffect(() => {
    if (audioEnabled) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }

    return () => stopBackgroundMusic();
  }, [audioEnabled]);

  const startBackgroundMusic = () => {
    if (!audioEnabled) return;

    try {
      const context = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create a different ambient sound for slider mode (D major chord)
      const osc1 = context.createOscillator();
      const osc2 = context.createOscillator();
      const osc3 = context.createOscillator();

      const gain1 = context.createGain();
      const gain2 = context.createGain();
      const gain3 = context.createGain();
      const masterGain = context.createGain();

      osc1.connect(gain1);
      osc2.connect(gain2);
      osc3.connect(gain3);

      gain1.connect(masterGain);
      gain2.connect(masterGain);
      gain3.connect(masterGain);
      masterGain.connect(context.destination);

      // D major chord frequencies
      osc1.frequency.setValueAtTime(146.83, context.currentTime); // D3
      osc2.frequency.setValueAtTime(185.0, context.currentTime); // F#3
      osc3.frequency.setValueAtTime(220.0, context.currentTime); // A3

      osc1.type = "sine";
      osc2.type = "triangle";
      osc3.type = "sine";

      gain1.gain.setValueAtTime(0.015, context.currentTime);
      gain2.gain.setValueAtTime(0.01, context.currentTime);
      gain3.gain.setValueAtTime(0.012, context.currentTime);
      masterGain.gain.setValueAtTime(0.3, context.currentTime);

      // Add gentle modulation
      const lfo = context.createOscillator();
      const lfoGain = context.createGain();

      lfo.connect(lfoGain);
      lfoGain.connect(masterGain.gain);

      lfo.frequency.setValueAtTime(0.15, context.currentTime);
      lfoGain.gain.setValueAtTime(0.04, context.currentTime);

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

  // Enhanced auto-play with meaning reveal
  useEffect(() => {
    let meaningTimer: NodeJS.Timeout;
    let nextTimer: NodeJS.Timeout;

    if (autoPlay) {
      if (!showMeaning) {
        meaningTimer = setTimeout(() => {
          handleReveal();
        }, 2500);
      } else {
        nextTimer = setTimeout(() => {
          if (currentIndex < words.length - 1) {
            handleNext();
          } else {
            setAutoPlay(false);
            triggerCelebration();
          }
        }, 3500);
      }
    }

    return () => {
      clearTimeout(meaningTimer);
      clearTimeout(nextTimer);
    };
  }, [autoPlay, showMeaning, currentIndex]);

  const createParticles = useCallback((count = 12) => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
    }));
    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.find((np) => np.id === p.id))
      );
    }, 2000);
  }, []);

  // Update the existing playSound function to check audioEnabled
  const playSound = (type: "slide" | "reveal" | "complete" | "celebration") => {
    if (!audioEnabled) return;

    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    if (type === "celebration") {
      // Play a triumphant chord progression
      const chords = [
        [261, 329, 392], // C major
        [293, 369, 440], // D major
        [329, 415, 493], // E major
      ];

      chords.forEach((chord, chordIndex) => {
        chord.forEach((freq, noteIndex) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          gainNode.gain.setValueAtTime(
            0.1,
            audioContext.currentTime + chordIndex * 0.3
          );
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + chordIndex * 0.3 + 0.5
          );

          oscillator.start(audioContext.currentTime + chordIndex * 0.3);
          oscillator.stop(audioContext.currentTime + chordIndex * 0.3 + 0.5);
        });
      });
      return;
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case "slide":
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          660,
          audioContext.currentTime + 0.15
        );
        break;
      case "reveal":
        oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          440,
          audioContext.currentTime + 0.1
        );
        break;
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

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCompletedWords((prev) => new Set([...prev, currentIndex]));
      setSlideDirection("right");
      setWordAnimation("animate-slide-out-left");

      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        // setShowMeaning(false);
        setWordAnimation("animate-slide-in-right");
        playSound("slide");

        setTimeout(() => setWordAnimation(""), 500);
      }, 300);
    } else {
      triggerCelebration();
      playSound("complete");
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setSlideDirection("left");
      setWordAnimation("animate-slide-out-right");

      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        // setShowMeaning(false);
        setWordAnimation("animate-slide-in-left");
        playSound("slide");

        setTimeout(() => setWordAnimation(""), 500);
      }, 300);
    }
  };

  const handleReveal = () => {
    setShowMeaning(!showMeaning);
    playSound("reveal");
    if (!showMeaning) {
      createParticles(6);
    }
  };

  // const handleReset = () => {
  //   setCurrentIndex(0);
  //   setShowMeaning(false);
  //   setCompletedWords(new Set());
  //   setAutoPlay(false);
  //   setShowCelebration(false);
  // };

  const triggerCelebration = () => {
    setShowCelebration(true);
    playSound("celebration");
    createParticles(20);
    const finalScore = subconceptMaxscore;
    const percentage = (finalScore / subconceptMaxscore) * 100;

    // Set the score percentage
    setScorePercentage(percentage);

    // Set the submission payload
    setSubmissionPayload?.({
      userAttemptFlag: true,
      userAttemptScore: finalScore,
    });

    setTimeout(() => {
      setShowCelebration(false);
      triggerSubmit();
    }, 4000);
  };

  const speakWord = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  // Automatically speak the current word's term and meaning in order
  useEffect(() => {
    if (!audioEnabled) return;
    if (!currentWord) return;

    // Cancel any ongoing speech
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    // Speak term, then meaning
    if ("speechSynthesis" in window) {
      const utterTerm = new SpeechSynthesisUtterance(currentWord.term);
      utterTerm.rate = 0.8;
      utterTerm.pitch = 1;

      const utterMeaning = new SpeechSynthesisUtterance(currentWord.meaning);
      utterMeaning.rate = 0.8;
      utterMeaning.pitch = 1;

      utterTerm.onend = () => {
        window.speechSynthesis.speak(utterMeaning);
      };

      window.speechSynthesis.speak(utterTerm);
    }
  }, [currentWord, audioEnabled]);

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-4 h-4 pointer-events-none z-20"
          style={{
            left: particle.x,
            top: particle.y,
          }}
        >
          <Sparkles className="w-4 h-4 text-yellow-400 animate-particle-float" />
        </div>
      ))}

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center z-30 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center animate-celebration-bounce shadow-2xl">
            <div className="text-8xl mb-6 animate-spin-slow">🎊</div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Outstanding Achievement!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              You've mastered all vocabulary words
            </p>
          </div>
        </div>
      )}

      {/* Enhanced Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-green-600 dark:text-green-300 animate-pulse">
            Vocabulary
          </span>
          <span className="text-sm font-medium text-green-600 dark:text-green-300">
            {currentIndex + 1} / {words.length}
          </span>
        </div>
        <Progress
          value={progress}
          className="h-4 animate-pulse-progress bg-green-100 [&>[role=progressbar]]:bg-gradient-to-r [&>[role=progressbar]]:from-green-400 [&>[role=progressbar]]:to-emerald-500"
        />
      </div>

      {/* Enhanced Word Slider */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-800/20 dark:to-emerald-900/20 shadow-2xl mb-8 border border-green-200 dark:border-green-700">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {words.map((word, index) => (
            <div
              key={index}
              className={`w-full flex-shrink-0 p-12 text-center min-h-[500px] flex flex-col justify-center relative ${
                wordAnimation && index === currentIndex ? wordAnimation : ""
              }`}
            >
              {/* Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 animate-gradient-shift opacity-50" />

              <div className="space-y-8 relative z-10">
                <div className="flex items-center justify-center gap-4">
                  <h2
                    className={`text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent animate-text-glow ${
                      index === currentIndex ? "animate-bounce-in" : ""
                    }`}
                  >
                    {word.term}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakWord(word.term)}
                    className="text-green-600 hover:text-green-800 dark:text-green-300 dark:hover:text-white hover:scale-110 transition-transform duration-300"
                  >
                    <Volume2 className="w-6 h-6" />
                  </Button>
                </div>

                <div
                  className={`transition-all duration-700 ${
                    showMeaning && index === currentIndex
                      ? "opacity-100 transform translate-y-0 scale-100"
                      : "opacity-0 transform translate-y-8 scale-95"
                  }`}
                >
                  {showMeaning && index === currentIndex && (
                    <div className="space-y-6 animate-fade-in-up">
                      <div className="flex items-center justify-center gap-4">
                        <p className="text-2xl text-green-700 dark:text-green-200 font-medium animate-text-reveal">
                          {word.meaning}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speakWord(word.meaning)}
                          className="text-green-600 hover:text-green-800 dark:text-green-300 dark:hover:text-white hover:scale-110 transition-transform duration-300"
                        >
                          <Volume2 className="w-5 h-5" />
                        </Button>
                      </div>
                      {word.example && (
                        <p className="text-xl italic text-green-600 dark:text-green-400 max-w-3xl mx-auto animate-fade-in-up animation-delay-300 bg-green-50 dark:bg-green-800/30 p-4 rounded-lg">
                          "{word.example}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {words.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setShowMeaning(false);
                playSound("slide");
              }}
              className={`w-4 h-4 rounded-full transition-all duration-500 transform hover:scale-125 ${
                index === currentIndex
                  ? "bg-gradient-to-r from-green-400 to-emerald-500 scale-150 animate-pulse"
                  : completedWords.has(index)
                  ? "bg-gradient-to-r from-green-400 to-emerald-500 animate-bounce-subtle"
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-green-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="flex justify-center items-center gap-6 flex-wrap">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 hover:scale-110 transition-all duration-300 px-6 py-3 border-green-300 hover:border-green-400 text-green-700"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </Button>

        <Button
          onClick={handleNext}
          className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 hover:scale-110 transition-all duration-300 px-6 py-3 animate-pulse-button text-white"
        >
          {currentIndex === words.length - 1 ? "Submit" : "Next"}
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Completion Message */}
      {/* {currentIndex === words.length - 1 && showMeaning && (
        <div className="mt-8 text-center p-8 bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 dark:from-green-900 dark:via-blue-900 dark:to-purple-900 rounded-2xl animate-celebration-bounce shadow-xl">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4 animate-text-glow">
            🎉 Excellent Work!
          </h3>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            You've explored all vocabulary words in slider mode!
          </p>
        </div>
      )} */}
    </div>
  );
}
