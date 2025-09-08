// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Play,
  Lock,
  ArrowRight,
  Trophy,
  Star,
  ChevronRight,
  BookOpen,
  Target,
  Award,
} from "lucide-react";

// Activity Icons
import PenNib from "@/components/activityIcons/PenNib";
import Book from "@/components/activityIcons/Book";
import Camera from "@/components/activityIcons/Camera";
import Speaker from "@/components/activityIcons/Speaker";
import Picture from "@/components/activityIcons/Picture";
import Start from "@/components/activityIcons/Start";
import QnA from "@/components/activityIcons/QnA";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import UnifiedHeader from "@/components/UnifiedHeader";
import { useUserContext } from "@/context/AuthContext";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Finish from "@/components/activityIcons/Finish";
import FIB from "@/components/activityIcons/FIB";
import JumbledWords from "@/components/activityIcons/JumbledWords";
import Grammar from "@/components/activityIcons/Grammar";
import Read from "@/components/activityIcons/Read";
import Spelling from "@/components/activityIcons/Spelling";
import Comprehension from "@/components/activityIcons/Comprehension";
import TrueOrFalse from "@/components/activityIcons/TrueOrFalse";
import Listen from "@/components/activityIcons/Listen";
import Match from "@/components/activityIcons/Match";
import TeacherAssist from "@/components/activityIcons/TeacherAssist";
import Write from "@/components/activityIcons/Write";
import KidFriendlyModal from "@/components/modals/CongratulatoryModal";
import Riddle from "@/components/activityIcons/Riddle";
import Dictation from "@/components/activityIcons/Dictation";
import Assignment from "@/components/activityIcons/Assignment";
import Assessment from "@/components/activityIcons/Assessment";
import RealWorld from "@/components/activityIcons/RealWorld";
import Literature from "@/components/activityIcons/Literature";
import DialogueWriting from "@/components/activityIcons/DialogueWriting";
import GenerateIdeaWords from "@/components/activityIcons/GenerateIdeaWords";
import HowSentencesChange from "@/components/activityIcons/HowSentencesChange";
import MainIdea from "@/components/activityIcons/MainIdea";
import StoryCompletion from "@/components/activityIcons/StoryCompletion";
import TextFromImage from "@/components/activityIcons/TextFromImage";
import TextFromText from "@/components/activityIcons/TextFromText";
import WriterGeneralSentences from "@/components/activityIcons/WriterGeneralSentences";
import Default from "@/components/activityIcons/Default";
import BackButton from "@/components/BackButton";
import toast from "react-hot-toast";
import Word from "@/components/activityIcons/Word";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useSession } from "@/context/TimerContext";

interface Subconcept {
  subconceptId: string;
  subconceptDesc: string;
  subconceptType: string;
  subconceptLink: string;
  completionStatus: string;
}

const iconMap = {
  youtube: Camera,
  html: PenNib,
  pdf: Book,
  video: Camera,
  audio: Speaker,
  image: Picture,
  qna: QnA,
  fib: FIB,
  grammar: Grammar,
  comprehension: Comprehension,
  trueorfalse: TrueOrFalse,
  jw: JumbledWords,
  listen: Listen,
  speak: Speaker,
  match: Match,
  read: Read,
  teacher_assist: TeacherAssist,
  write: Write,
  riddles: Riddle,
  dictation: Dictation,
  vocab: Spelling,
  mtf: Spelling,
  mcq: QnA,
  realworld: RealWorld,
  literature: Literature,
  dialogue_writing: DialogueWriting,
  generate_idea_words: GenerateIdeaWords,
  how_sentences_change: HowSentencesChange,
  main_idea: MainIdea,
  story_completion: StoryCompletion,
  text_from_picture: TextFromImage,
  text_from_text: TextFromText,
  writer_general_sentences: WriterGeneralSentences,
  word: Word,
  words: Word,
  passage_read: Read,
  passage_jw: JumbledWords,
  passage_fib: FIB,
  passage_spelling: Spelling,
  passage_vocab: Spelling,
  passage_comprehension: Comprehension,
  passage_qna: QnA,
  assignment: Assignment,
  assignment_pdf: Assignment,
  assignment_video: Assignment,
  assignment_audio: Assignment,
  assignment_image: Assignment,
  assessment: Assessment,
};

const ActivityTypeColors = {
  video: "from-blue-500 to-blue-600",
  audio: "from-green-500 to-green-600",
  qna: "from-purple-500 to-purple-600",
  read: "from-indigo-500 to-indigo-600",
  write: "from-orange-500 to-orange-600",
  assessment: "from-red-500 to-red-600",
  assignment: "from-yellow-500 to-yellow-600",
  default: "from-gray-500 to-gray-600",
};

export default function SubConceptsPageRedesigned() {
  const [stageId, setStageId] = useState("");
  const [currentUnitId, setCurrentUnitId] = useState("");
  const { unitId } = useParams();
  const [nextUnitId, setNextUnitId] = useState(null);
  const { user, selectedCohortWithProgram } = useUserContext();
  const [subconcepts, setSubconcepts] = useState<Subconcept[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [showConfetti, setShowConfetti] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [unitCompletionStatus, setUnitCompletionStatus] = useState("");
  const [unitName, setUnitName] = useState("");
  const [unitDescription, setUnitDescription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [celebratedStageName, setCelebratedStageName] = useState("");
  const navigate = useNavigate();
  const { formattedElapsedTime } = useSession();

  const fetchSubconcepts = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/programconceptsmappings/${user.userId}/unit/${unitId}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching subconcepts:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchAndSetSubconcepts = async () => {
      if (user.userId && unitId) {
        try {
          const result = await fetchSubconcepts();
          setUnitCompletionStatus(result.unitCompletionStatus);
          setStageId(result.stageId);
          setCurrentUnitId(result.unitId);
          setUnitName(result.unitName);
          setUnitDescription(result.unitDesc);
          setCelebratedStageName(result.stageName);
          const fetchedSubconcepts = result.subConcepts;
          setSubconcepts(Object.values(fetchedSubconcepts));
        } catch (err) {
          setError("Failed to fetch data.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAndSetSubconcepts();
  }, [user?.userId, unitId]);

  useEffect(() => {
    if (!unitId) return;

    const allUnitsString = localStorage.getItem("allUnitsOfCurrentStage");
    const allUnits: { unitId: string }[] = allUnitsString
      ? JSON.parse(allUnitsString)
      : [];
    
    const currentIndex = allUnits.findIndex((unit) => unit.unitId == unitId);
    
    if (currentIndex !== -1 && currentIndex < allUnits.length - 1) {
      const nextUnit = allUnits[currentIndex + 1];
      setNextUnitId(nextUnit?.unitId || null);
    } else {
      setNextUnitId(null);
    }
  }, [unitId]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/");
  };

  const handleFinishClick = () => {
    setShowConfetti(true);
    setAudioPlaying(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };

  const getActivityTypeColor = (type: string) => {
    const normalizedType = type.toLowerCase();
    if (normalizedType.includes('video') || normalizedType.includes('camera')) return ActivityTypeColors.video;
    if (normalizedType.includes('audio') || normalizedType.includes('speaker') || normalizedType.includes('listen')) return ActivityTypeColors.audio;
    if (normalizedType.includes('qna') || normalizedType.includes('mcq')) return ActivityTypeColors.qna;
    if (normalizedType.includes('read')) return ActivityTypeColors.read;
    if (normalizedType.includes('write')) return ActivityTypeColors.write;
    if (normalizedType.includes('assessment')) return ActivityTypeColors.assessment;
    if (normalizedType.includes('assignment')) return ActivityTypeColors.assignment;
    return ActivityTypeColors.default;
  };

  const completedCount = subconcepts.filter(s => s.completionStatus === "yes").length;
  const progressPercentage = subconcepts.length > 0 ? (completedCount / subconcepts.length) * 100 : 0;

  const ActivityCard = ({ subconcept, index, isEnabled, isCompleted, isNext }) => {
    const normalizedIconMap = Object.keys(iconMap).reduce(
      (acc, key) => {
        acc[key.toLowerCase()] = iconMap[key];
        return acc;
      },
      {} as Record<string, (typeof iconMap)[keyof typeof iconMap]>
    );

    const Icon = normalizedIconMap[subconcept.subconceptType.toLowerCase()] || Default;
    const colorGradient = getActivityTypeColor(subconcept.subconceptType);

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative"
      >
        <Link
          to={
            isEnabled &&
            !(subconcept?.subconceptType?.toLowerCase().startsWith("assessment") &&
              subconcept?.completionStatus === "yes")
              ? `/subconcept/${subconcept?.subconceptId}`
              : null
          }
          state={{ subconcept, stageId, currentUnitId }}
          className={`${!isEnabled && "cursor-not-allowed"}`}
          onClick={(e) => {
            if (subconcept?.subconceptType?.toLowerCase().startsWith("assessment") &&
                subconcept?.completionStatus === "yes") {
              e.preventDefault();
              toast(
                (t) => (
                  <div className="text-yellow-800 font-medium text-md">
                    Assessment already completed, you can attempt only once!
                  </div>
                ),
                {
                  icon: "⚠️",
                  position: "top-center",
                  style: {
                    border: "1px solid #facc15",
                    padding: "12px 16px",
                    color: "#78350f",
                    background: "#fef9c3",
                    borderRadius: "8px",
                  },
                }
              );
            }
          }}
        >
          <div
            className={`
              relative overflow-hidden rounded-2xl border-2 transition-all duration-300 p-6 min-h-[140px]
              ${isCompleted 
                ? "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg" 
                : isEnabled 
                  ? "border-orange-200 bg-white hover:border-orange-400 hover:shadow-xl hover:scale-105" 
                  : "border-gray-200 bg-gray-50 opacity-60"}
              ${isNext ? "ring-4 ring-orange-300 ring-opacity-50 shadow-2xl" : ""}
            `}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${colorGradient}`}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-between h-full">
              <div className="flex items-center space-x-4 flex-1">
                {/* Icon Container */}
                <div 
                  className={`
                    relative p-3 rounded-xl transition-all duration-300
                    ${isCompleted 
                      ? "bg-green-100" 
                      : isEnabled 
                        ? "bg-orange-50 group-hover:bg-orange-100" 
                        : "bg-gray-100"}
                  `}
                >
                  <Icon
                    width="32"
                    height="32"
                    color={
                      isCompleted 
                        ? "#10b981" 
                        : isEnabled 
                          ? "#f48d03" 
                          : "#9ca3af"
                    }
                    className="object-contain"
                  />

                  {/* Status Indicator */}
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </motion.div>
                  )}

                  {!isEnabled && !isCompleted && (
                    <div className="absolute -top-1 -right-1 bg-gray-400 rounded-full p-1">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {isNext && !isCompleted && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-1"
                    >
                      <Play className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>

                {/* Activity Info */}
                <div className="flex-1 min-w-0">
                  <h3 className={`
                    font-semibold text-lg leading-tight mb-1 truncate
                    ${isCompleted 
                      ? "text-green-800" 
                      : isEnabled 
                        ? "text-slate-800" 
                        : "text-gray-500"}
                  `}>
                    {subconcept.subconceptDesc}
                  </h3>
                  <p className={`
                    text-sm capitalize
                    ${isCompleted 
                      ? "text-green-600" 
                      : isEnabled 
                        ? "text-orange-600" 
                        : "text-gray-400"}
                  `}>
                    {subconcept.subconceptType.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>

              {/* Action Indicator */}
              <div className={`
                transition-all duration-300
                ${isEnabled ? "opacity-100 group-hover:translate-x-1" : "opacity-40"}
              `}>
                {isCompleted ? (
                  <Trophy className="w-6 h-6 text-green-500" />
                ) : isEnabled ? (
                  <ChevronRight className="w-6 h-6 text-orange-500" />
                ) : (
                  <Lock className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>

            {/* Next Activity Pulse */}
            {isNext && !isCompleted && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-orange-600/20 rounded-2xl"
                />
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                    Next
                  </span>
                </div>
              </>
            )}
          </div>
        </Link>
      </motion.div>
    );
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const nextActivityIndex = subconcepts.findIndex(s => 
    s.completionStatus === "incomplete" || s.completionStatus === "ignored"
  );

  return (
    <>
      <UnifiedHeader variant="transparent" />
      
      <KidFriendlyModal
        isOpen={isModalOpen}
        onClose={closeModal}
        stageName={celebratedStageName}
        congratsType="stageCompletion"
      />

      {/* Audio Elements */}
      {isModalOpen && (
        <audio src="/youaresuperb.mp3" autoPlay />
      )}
      {audioPlaying && (
        <audio
          src="/youaresuperb.mp3"
          autoPlay
          onEnded={() => setAudioPlaying(false)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
        {/* Hero Section */}
        <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                {unitName || "Loading Unit..."}
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                {unitDescription || "Loading description..."}
              </p>
            </motion.div>

            {/* Progress Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-orange-500" />
                  <h2 className="text-lg font-semibold text-slate-800">Learning Progress</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <span>{completedCount} of {subconcepts.length} completed</span>
                  {formattedElapsedTime && (
                    <>
                      <span>•</span>
                      <Clock className="w-4 h-4" />
                      <span>{formattedElapsedTime}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="relative">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                  </motion.div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-orange-600 font-medium">{Math.round(progressPercentage)}% Complete</span>
                  {progressPercentage === 100 && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Award className="w-4 h-4" />
                      <span className="font-medium">Unit Completed!</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-4 md:gap-6">
              {/* Start Activity */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="col-span-full"
              >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white/20 p-3 rounded-xl">
                        <Start width="32" height="32" color="white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Begin Your Learning Journey</h3>
                        <p className="text-blue-100">Start with the first activity below</p>
                      </div>
                    </div>
                    <Star className="w-8 h-8 text-yellow-300" />
                  </div>
                </div>
              </motion.div>

              {/* Activity Cards */}
              {subconcepts.map((subconcept, index) => {
                const isCompleted = subconcept.completionStatus === "yes";
                const isEnabled = subconcept.completionStatus !== "disabled";
                const isNext = index === nextActivityIndex;

                return (
                  <ActivityCard
                    key={subconcept.subconceptId}
                    subconcept={subconcept}
                    index={index}
                    isEnabled={isEnabled}
                    isCompleted={isCompleted}
                    isNext={isNext}
                  />
                );
              })}

              {/* Finish Activity */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: subconcepts.length * 0.1 }}
                className="col-span-full"
              >
                <Link
                  to={
                    nextUnitId &&
                    (unitCompletionStatus === "yes" ||
                      unitCompletionStatus.toLowerCase() === "unit completed without assignments")
                      ? "/dashboard"
                      : null
                  }
                  onClick={(e) => {
                    if (
                      nextUnitId &&
                      (unitCompletionStatus === "yes" ||
                        unitCompletionStatus.toLowerCase() === "unit completed without assignments")
                    ) {
                      e.preventDefault();
                      setShowConfetti(true);
                      setAudioPlaying(true);
                      setTimeout(() => {
                        navigate("/dashboard");
                      }, 5000);
                    } else if (
                      !nextUnitId &&
                      (unitCompletionStatus === "yes" ||
                        unitCompletionStatus.toLowerCase() === "unit completed without assignments")
                    ) {
                      openModal();
                    }
                  }}
                  className={`
                    block transition-all duration-300
                    ${unitCompletionStatus === "yes" || 
                      unitCompletionStatus.toLowerCase() === "unit completed without assignments"
                      ? "hover:scale-105 cursor-pointer" 
                      : "cursor-not-allowed opacity-60"}
                  `}
                >
                  <div className={`
                    rounded-2xl shadow-lg p-6 border-2
                    ${unitCompletionStatus === "yes" || 
                      unitCompletionStatus.toLowerCase() === "unit completed without assignments"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 border-green-400 text-white" 
                      : "bg-gray-100 border-gray-300 text-gray-500"}
                  `}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`
                          p-3 rounded-xl
                          ${unitCompletionStatus === "yes" || 
                            unitCompletionStatus.toLowerCase() === "unit completed without assignments"
                            ? "bg-white/20" 
                            : "bg-gray-200"}
                        `}>
                          <Finish 
                            width="32" 
                            height="32" 
                            color={
                              unitCompletionStatus === "yes" || 
                              unitCompletionStatus.toLowerCase() === "unit completed without assignments"
                                ? "white" 
                                : "#9ca3af"
                            } 
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">
                            {unitCompletionStatus === "yes" || 
                             unitCompletionStatus.toLowerCase() === "unit completed without assignments"
                              ? "Congratulations! Unit Complete!" 
                              : "Finish Unit"}
                          </h3>
                          <p className={`
                            ${unitCompletionStatus === "yes" || 
                              unitCompletionStatus.toLowerCase() === "unit completed without assignments"
                              ? "text-green-100" 
                              : "text-gray-400"}
                          `}>
                            {unitCompletionStatus === "yes" || 
                             unitCompletionStatus.toLowerCase() === "unit completed without assignments"
                              ? "Click to continue to the next unit" 
                              : "Complete all activities above to proceed"}
                          </p>
                        </div>
                      </div>
                      {unitCompletionStatus === "yes" || 
                       unitCompletionStatus.toLowerCase() === "unit completed without assignments" ? (
                        <Trophy className="w-8 h-8 text-yellow-300" />
                      ) : (
                        <Lock className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Confetti Animation */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50"
            >
              <DotLottieReact
                src="/animation.lottie"
                loop
                autoplay
                style={{ width: "2000px", height: "1000px", zIndex: 9999 }}
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="absolute bg-white border border-slate-200 p-8 rounded-2xl shadow-2xl text-center max-w-[350px] sm:max-w-xl"
              >
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-slate-800 mb-3">
                  Outstanding Achievement!
                </h2>
                <p className="text-slate-600 text-lg mb-2">
                  You've successfully mastered this unit!
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Your dedication and hard work are paying off. Get ready for the next exciting challenge!
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
