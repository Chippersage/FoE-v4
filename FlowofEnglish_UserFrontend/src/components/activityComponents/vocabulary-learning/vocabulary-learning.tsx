"use client";

import { useState, useEffect } from "react";
import FlashcardMode from "@/components/activityComponents/vocabulary-learning/flashcard-mode";
import SliderMode from "@/components/activityComponents/vocabulary-learning/slider-mode";
import { parseXMLData } from "@/utils/vocabLearningXmlParser";
import type { VocabularyData } from "@/types/types";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VocabularyLearningProps {
  triggerSubmit: () => void;
  xmlUrl: string;
  setScorePercentage: React.Dispatch<React.SetStateAction<number>>;
  subconceptMaxscore: number;
  setSubmissionPayload?: React.Dispatch<
    React.SetStateAction<{
      userAttemptFlag: boolean;
      userAttemptScore: number;
    } | null>
  >;
}

export default function VocabularyLearning({
  triggerSubmit,
  xmlUrl,
  setScorePercentage,
  subconceptMaxscore,
  setSubmissionPayload,
}: VocabularyLearningProps) {
  const [vocabularyData, setVocabularyData] = useState<VocabularyData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  // const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Play encouraging startup sound
    playStartupSound();

    // Start background music
    // startBackgroundMusic();

    // Cleanup function to stop music when component unmounts
    // return () => {
    //   stopBackgroundMusic();
    // };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const parsedData = await parseXMLData(xmlUrl);
        setVocabularyData(parsedData);
      } catch (err) {
        setError("Failed to parse XML data");
        console.error("XML parsing error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [xmlUrl]);

  // useEffect(() => {
  //   if (vocabularyData) {
  //     // Show welcome message for 3 seconds
  //     const timer = setTimeout(() => {
  //       setShowWelcome(false);
  //     }, 3000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [vocabularyData]);

  const playStartupSound = () => {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    // Create an uplifting startup melody
    const notes = [
      { freq: 523, time: 0 }, // C5
      { freq: 659, time: 0.2 }, // E5
      { freq: 784, time: 0.4 }, // G5
      { freq: 1047, time: 0.6 }, // C6
    ];

    notes.forEach((note) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(
        note.freq,
        audioContext.currentTime + note.time
      );
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0, audioContext.currentTime + note.time);
      gainNode.gain.linearRampToValueAtTime(
        0.1,
        audioContext.currentTime + note.time + 0.05
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + note.time + 0.3
      );

      oscillator.start(audioContext.currentTime + note.time);
      oscillator.stop(audioContext.currentTime + note.time + 0.3);
    });
  };

  let backgroundAudioContext: AudioContext | null = null;
  let backgroundOscillator: OscillatorNode | null = null;
  let backgroundGainNode: GainNode | null = null;

  const startBackgroundMusic = () => {
    try {
      backgroundAudioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create a gentle, ambient background tone
      backgroundOscillator = backgroundAudioContext.createOscillator();
      backgroundGainNode = backgroundAudioContext.createGain();

      backgroundOscillator.connect(backgroundGainNode);
      backgroundGainNode.connect(backgroundAudioContext.destination);

      // Set a calming frequency (around 220 Hz - A3)
      backgroundOscillator.frequency.setValueAtTime(
        220,
        backgroundAudioContext.currentTime
      );
      backgroundOscillator.type = "sine";

      // Very low volume for background ambience
      backgroundGainNode.gain.setValueAtTime(
        0.02,
        backgroundAudioContext.currentTime
      );

      // Add subtle frequency modulation for a more interesting sound
      const lfo = backgroundAudioContext.createOscillator();
      const lfoGain = backgroundAudioContext.createGain();

      lfo.connect(lfoGain);
      lfoGain.connect(backgroundOscillator.frequency);

      lfo.frequency.setValueAtTime(0.5, backgroundAudioContext.currentTime); // Slow modulation
      lfoGain.gain.setValueAtTime(10, backgroundAudioContext.currentTime); // Subtle pitch variation

      backgroundOscillator.start();
      lfo.start();
    } catch (error) {
      console.log("Background music not supported in this browser");
    }
  };

  const stopBackgroundMusic = () => {
    if (backgroundOscillator && backgroundAudioContext) {
      backgroundOscillator.stop();
      backgroundAudioContext.close();
      backgroundOscillator = null;
      backgroundAudioContext = null;
      backgroundGainNode = null;
    }
  };

  // if (showWelcome && vocabularyData) {
  //   return (
  //     <div className="fixed inset-0 bg-gradient-to-br from-green-400/90 to-emerald-600/90 flex items-center justify-center z-50 animate-fade-in">
  //       <div className="text-center text-white animate-bounce-in">
  //         <div className="text-8xl mb-6 animate-spin-slow">🎓</div>
  //         <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-200 to-emerald-100 bg-clip-text ">
  //           Let's Build Your Vocabulary!
  //         </h2>
  //         <p className="text-xl mb-6 animate-fade-in-up text-emerald-50">
  //           Unlock the power of {vocabularyData.words.length} incredible new
  //           words
  //         </p>
  //         {/* <div className="text-lg animate-pulse">
  //           {vocabularyData.type === "flashcard"
  //             ? "🃏 Flashcard Mode"
  //             : "🎠 Slider Mode"}{" "}
  //           Ready!
  //         </div> */}
  //       </div>
  //     </div>
  //   );
  // }

  if (loading) {
    return (
      <div
        className="min-h-screen bg-slate-100 font-sans p-4 relative"
        style={{
          backgroundImage: "url('/images/cohort-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/10 z-0" />
        <div className="relative z-10 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !vocabularyData) {
    return (
      <div
        className="min-h-screen bg-slate-100 font-sans p-4 relative"
        style={{
          backgroundImage: "url('/images/cohort-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/10 z-0" />
        <div className="relative z-10 flex items-center justify-center min-h-[400px]">
          <div className="text-center text-red-600 dark:text-red-400">
            <p className="text-lg">{error || "No vocabulary data available"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-100 font-sans p-4 relative"
      style={{
        backgroundImage: "url('/images/cohort-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10 z-0" />
      <div className="relative z-10 w-full py-10 px-4">
        {/* Audio Control */}
        <div className="fixed top-4 right-4 z-40">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
          >
            {audioEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Existing content */}
        {vocabularyData.type === "flashcard" ? (
          <FlashcardMode
            words={vocabularyData.words}
            audioEnabled={audioEnabled}
          />
        ) : (
          <SliderMode
            setScorePercentage={setScorePercentage}
            subconceptMaxscore={subconceptMaxscore}
            setSubmissionPayload={setSubmissionPayload}
            triggerSubmit={triggerSubmit}
            words={vocabularyData.words}
            audioEnabled={audioEnabled}
          />
        )}
      </div>
    </div>
  );
}
