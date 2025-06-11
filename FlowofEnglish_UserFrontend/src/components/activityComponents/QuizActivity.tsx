// @ts-nocheck
import { useEffect, useState, useRef } from "react";
import { Question as QuestionType, QuizState } from "@/types/types";
import { fetchAndParseQuestionsFromXML } from "@/utils/XmlParser";
import Question from "@/components/Question";
import Options from "@/components/Options";
import Navigation from "@/components/Navigation";
import ScoreDisplay from "@/components/ScoreDisplay";

interface QuizActivityProps {
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

// Sound effect paths - you can replace these with your actual audio files
const SOUND_EFFECTS = {
  QUIZ_LOAD: "/",
  OPTION_SELECT: "/",
  CORRECT_ANSWER: "/duolingo-correct.mp3",
  WRONG_ANSWER: "/duolingo-wrong.mp3",
  NAVIGATION: "/",
};

const QuizActivity: React.FC<QuizActivityProps> = ({
  triggerSubmit,
  xmlUrl,
  setScorePercentage,
  subconceptMaxscore,
  setSubmissionPayload,
}) => {
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    questions: [],
    selectedOptions: {},
    isChecked: false,
    score: 0,
    timeRemaining: 15 * 60,
    totalMarks: 0,
    scoredQuestions: {},
  });

  // Add state for activities header text
  const [activitiesHeaderText, setActivitiesHeaderText] = useState<
    string | null
  >(null);

  // Add state for image overlay
  const [showImgOverlay, setShowImgOverlay] = useState(false);
  const [overlayImageSrc, setOverlayImageSrc] = useState<string>("");

  // Create refs for audio elements
  const loadSoundRef = useRef<HTMLAudioElement | null>(null);
  const selectSoundRef = useRef<HTMLAudioElement | null>(null);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);
  const navigationSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    loadSoundRef.current = new Audio(SOUND_EFFECTS.QUIZ_LOAD);
    selectSoundRef.current = new Audio(SOUND_EFFECTS.OPTION_SELECT);
    correctSoundRef.current = new Audio(SOUND_EFFECTS.CORRECT_ANSWER);
    wrongSoundRef.current = new Audio(SOUND_EFFECTS.WRONG_ANSWER);
    navigationSoundRef.current = new Audio(SOUND_EFFECTS.NAVIGATION);

    // Preload audio
    loadSoundRef.current.load();
    selectSoundRef.current.load();
    correctSoundRef.current.load();
    wrongSoundRef.current.load();
    navigationSoundRef.current.load();

    return () => {
      // Cleanup audio elements when component unmounts
      [
        loadSoundRef,
        selectSoundRef,
        correctSoundRef,
        wrongSoundRef,
        navigationSoundRef,
      ].forEach((ref) => {
        if (ref.current) {
          ref.current.pause();
          ref.current = null;
        }
      });
    };
  }, []);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const { questions, activitiesHeaderText } =
          await fetchAndParseQuestionsFromXML(xmlUrl);
        const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

        setState((prev) => ({
          ...prev,
          questions,
          totalMarks,
        }));

        // Set the activities header text
        setActivitiesHeaderText(activitiesHeaderText);

        // Play loading sound when questions are loaded
        if (loadSoundRef.current) {
          loadSoundRef.current.play();
        }
      } catch (error) {
        console.error("Error fetching or parsing XML:", error);
      }
    };

    if (xmlUrl) {
      loadQuestions();
    }
  }, [xmlUrl]);

  const currentQuestion = state.questions[state.currentQuestionIndex] || null;

  // Play a sound effect
  const playSound = (soundRef) => {
    if (soundRef.current) {
      soundRef.current.currentTime = 0; // Reset sound to beginning
      soundRef.current.play().catch((error) => {
        // Handle autoplay restrictions
        console.warn("Failed to play sound:", error);
      });
    }
  };

  // Handle image overlay
  const handleImageClick = (imageSrc: string) => {
    setOverlayImageSrc(imageSrc);
    setShowImgOverlay(true);
  };

  const handleCloseImageOverlay = () => {
    setShowImgOverlay(false);
    setOverlayImageSrc("");
  };

  const handleOptionSelect = (optionId: string) => {
    if (state.isChecked) return;

    // Play option select sound
    playSound(selectSoundRef);

    const questionId = currentQuestion?.id || "";
    const isMultiple = currentQuestion?.type === "multiple";
    const selectedOptions = { ...state.selectedOptions };

    if (isMultiple) {
      // For multiple-choice questions, toggle the selection
      if (!selectedOptions[questionId]) {
        selectedOptions[questionId] = [];
      }

      if (selectedOptions[questionId].includes(optionId)) {
        selectedOptions[questionId] = selectedOptions[questionId].filter(
          (id) => id !== optionId
        );
      } else {
        selectedOptions[questionId] = [
          ...selectedOptions[questionId],
          optionId,
        ];
      }
    } else {
      // For single-choice questions, replace the selection
      selectedOptions[questionId] = [optionId];
    }

    setState((prev) => ({
      ...prev,
      selectedOptions,
    }));
  };

  const handleCheck = () => {
    if (!currentQuestion) return;

    const questionId = currentQuestion.id;

    // Skip scoring if already scored
    if (state.scoredQuestions[questionId]) {
      setState((prev) => ({
        ...prev,
        isChecked: true,
      }));
      return;
    }

    const selectedIds = state.selectedOptions[questionId] || [];
    const correctOptionIds = currentQuestion.options
      .filter((opt) => opt.isCorrect)
      .map((opt) => opt.id);

    let isCorrect = false;

    if (currentQuestion.type === "single") {
      isCorrect =
        selectedIds.length === 1 && correctOptionIds.includes(selectedIds[0]);
    } else {
      const allCorrectSelected = correctOptionIds.every((id) =>
        selectedIds.includes(id)
      );
      const noIncorrectSelected = selectedIds.every((id) =>
        correctOptionIds.includes(id)
      );
      isCorrect = allCorrectSelected && noIncorrectSelected;
    }

    // Play correct or wrong sound based on answer
    if (isCorrect) {
      playSound(correctSoundRef);
    } else {
      playSound(wrongSoundRef);
    }

    const scoreIncrease = isCorrect ? currentQuestion.marks : 0;

    setState((prev) => ({
      ...prev,
      isChecked: true,
      score: prev.score + scoreIncrease,
      scoredQuestions: {
        ...prev.scoredQuestions,
        ...(isCorrect && !prev.scoredQuestions[questionId]
          ? { [questionId]: true }
          : {}),
      },
    }));
  };

  const handleNext = () => {
    if (state.currentQuestionIndex >= state.questions.length - 1) return;

    // Play navigation sound
    playSound(navigationSoundRef);

    setState((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      isChecked: false,
    }));
  };

  const handlePrevious = () => {
    if (state.currentQuestionIndex <= 0) return;

    // Play navigation sound
    playSound(navigationSoundRef);

    setState((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex - 1,
      isChecked: false,
    }));
  };

  const handleSubmit = () => {
    // Play navigation sound for submit
    playSound(navigationSoundRef);

    const finalScore = state.score;
    const percentage = (finalScore / subconceptMaxscore) * 100;

    // Set the score percentage
    setScorePercentage(percentage);

    // Set the submission payload
    setSubmissionPayload?.({
      userAttemptFlag: true,
      userAttemptScore: finalScore,
    });

    // Trigger submit after 100ms
    setTimeout(() => {
      triggerSubmit();
    }, 100);
  };

  if (state.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-lg text-gray-600">
          Loading quiz...
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const questionId = currentQuestion.id;
  const selectedOptions = state.selectedOptions[questionId] || [];
  const canCheck = selectedOptions.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-green-200 py-10 px-4 relative">
      <div className="bg-gradient-to-b from-[#b8eea5] to-white border border-green-200 shadow-md rounded-xl p-6 md:p-8 w-full transition-all duration-300 relative">
        <div className="flex justify-between items-center mb-6">
          {activitiesHeaderText && (
            <h2 className="text-xl font-semibold text-green-800 mb-6">
              {activitiesHeaderText}
            </h2>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Score on top for small, right for md+ */}
          <div className="block md:hidden">
            <ScoreDisplay score={state.score} total={state.totalMarks} />
          </div>

          <div className="flex flex-col flex-grow">
            <Question
              question={currentQuestion}
              currentIndex={state.currentQuestionIndex}
              totalQuestions={state.questions.length}
              activitiesHeaderText={activitiesHeaderText}
              onImageClick={handleImageClick}
            />

            <Options
              options={currentQuestion.options}
              selectedOptions={selectedOptions}
              isMultiple={currentQuestion.type === "multiple"}
              isChecked={state.isChecked}
              onSelect={handleOptionSelect}
            />

            <Navigation
              onPrevious={handlePrevious}
              onNext={handleNext}
              onCheck={handleCheck}
              onSubmit={handleSubmit}
              isFirstQuestion={state.currentQuestionIndex === 0}
              isLastQuestion={
                state.currentQuestionIndex === state.questions.length - 1
              }
              isChecked={state.isChecked}
              canCheck={canCheck}
            />
          </div>

          {/* Score on right for md+ */}
          <div className="hidden md:flex md:items-center md:justify-center">
            <ScoreDisplay score={state.score} total={state.totalMarks} />
          </div>
        </div>
      </div>

      {/* Image Overlay - positioned relative to the entire quiz container */}
      {showImgOverlay && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm"
          onClick={handleCloseImageOverlay}
        >
          <img
            src={overlayImageSrc}
            alt="Full question visual"
            className="max-h-[90vh] max-w-[95vw] w-auto rounded shadow-lg border-4 border-white"
            style={{ objectFit: "contain" }}
          />
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold bg-black bg-opacity-70 rounded-full px-3 py-1 hover:bg-opacity-90 focus:outline-none transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              handleCloseImageOverlay();
            }}
            aria-label="Close image overlay"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizActivity;
