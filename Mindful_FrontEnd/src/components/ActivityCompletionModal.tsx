// @ts-nocheck
import { useEffect, useState } from "react";
import {
  Star,
  Trophy,
  Sparkles,
  Medal,
  Target,
  CheckCircle,
  Timer,
  TrendingUp,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";

interface ActivityCompletionModal {
  onClose: () => void;
  scorePercentage: number;
  countdownDuration: number;
}

export default function ActivityCompletionModal({
  onClose,
  scorePercentage,
  countdownDuration,
}: ActivityCompletionModal) {
  const [countdown, setCountdown] = useState(countdownDuration);
  const [audio] = useState(new Audio());

  useEffect(() => {
    let timer: number;
    setCountdown(countdownDuration);

    // Professional sound effects based on performance - copyright-free alternatives
    if (scorePercentage > 75) {
      // High achievement - success completion sound
      audio.src = "/sounds/high-score-sound-effect.mp3";
    } else if (scorePercentage >= 50) {
      // Good performance - positive feedback sound
      audio.src = "/sounds/average-score-sound-effect.mp3";
    } else {
      // Needs improvement - gentle encouragement sound
      audio.src = "/sounds/low-score-sound-effect.mp3";
    }

    // Play audio with error handling
    audio.play().catch((error) => {
      console.warn("Audio playback failed:", error);
    });

    timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [scorePercentage, countdownDuration, audio, onClose]);

  const getScoreContent = () => {
    if (scorePercentage > 75) {
      return {
        icon: <Trophy className="w-16 h-16 text-emerald-600" />,
        title: "Excellent Work!",
        message: "Outstanding performance! You've mastered this concept and unlocked the next activity.",
        bgGradient: "from-emerald-50 to-blue-50",
        borderColor: "border-emerald-200",
        titleColor: "text-emerald-700",
        messageColor: "text-slate-600",
        progressColor: "bg-emerald-500",
        badge: (
          <div className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
            <Award className="w-4 h-4" />
            High Achiever
          </div>
        ),
        extraIcon: <Sparkles className="w-5 h-5 text-emerald-500" />,
      };
    } else if (scorePercentage >= 50) {
      return {
        icon: <Medal className="w-16 h-16 text-blue-600" />,
        title: "Well Done!",
        message: "Good progress! You've completed this activity and can move forward. Keep practicing to improve further.",
        bgGradient: "from-blue-50 to-indigo-50",
        borderColor: "border-blue-200",
        titleColor: "text-blue-700",
        messageColor: "text-slate-600",
        progressColor: "bg-blue-500",
        badge: (
          <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            Good Progress
          </div>
        ),
        extraIcon: <Star className="w-5 h-5 text-blue-500" />,
      };
    } else {
      return {
        icon: <Target className="w-16 h-16 text-slate-600" />,
        title: "Keep Learning!",
        message: "You're making progress! Consider reviewing this material and try again when you're ready. The next activity is unlocked.",
        bgGradient: "from-slate-50 to-gray-50",
        borderColor: "border-slate-200",
        titleColor: "text-slate-700",
        messageColor: "text-slate-600",
        progressColor: "bg-slate-500",
        badge: (
          <div className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Activity Complete
          </div>
        ),
        extraIcon: <TrendingUp className="w-5 h-5 text-slate-500" />,
      };
    }
  };

  const content = getScoreContent();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`bg-gradient-to-br ${content.bgGradient} rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl border ${content.borderColor}`}
      >
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm py-4 px-6 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Activity Completed
            </h2>
            {content.badge}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center">
            {/* Icon with animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="flex justify-center mb-6 relative"
            >
              <div className="relative">
                {content.icon}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-1 -right-1"
                >
                  {content.extraIcon}
                </motion.div>
              </div>
            </motion.div>

            {/* Score Display */}
            <div className="mb-4">
              <div className="text-3xl font-bold text-slate-800 mb-1">
                {Math.round(scorePercentage)}%
              </div>
              <div className="w-24 h-2 bg-slate-200 rounded-full mx-auto">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${scorePercentage}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className={`h-full ${content.progressColor} rounded-full`}
                />
              </div>
            </div>

            {/* Title */}
            <h3 className={`text-2xl font-bold mb-4 ${content.titleColor}`}>
              {content.title}
            </h3>

            {/* Message */}
            <p className={`text-base leading-relaxed mb-6 ${content.messageColor}`}>
              {content.message}
            </p>

            {/* Countdown */}
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <Timer className="w-4 h-4" />
              <span>
                Continuing in{" "}
                <span className="font-semibold text-slate-700">{countdown}</span>{" "}
                seconds
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-200">
          <motion.div
            initial={{ width: "0%" }}
            animate={{
              width: `${((countdownDuration - countdown) / countdownDuration) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
            className={`h-full ${content.progressColor}`}
          />
        </div>
      </motion.div>
    </div>
  );
}
