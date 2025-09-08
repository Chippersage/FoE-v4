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
  Video,
  Headphones,
  Edit3,
  FileText,
  HelpCircle,
  Volume2,
  Eye,
  PenTool,
  MessageSquare,
  GraduationCap,
  ClipboardCheck,
  Lightbulb,
  Mic,
  Shuffle,
  Globe,
  BookMarked,
  Feather,
} from "lucide-react";
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
  youtube: Video,
  html: Edit3,
  pdf: FileText,
  video: Video,
  audio: Headphones,
  image: Eye,
  qna: HelpCircle,
  fib: Edit3,
  grammar: PenTool,
  comprehension: BookOpen,
  trueorfalse: CheckCircle2,
  jw: Shuffle,
  listen: Headphones,
  speak: Mic,
  match: Target,
  read: BookOpen,
  teacher_assist: GraduationCap,
  write: Edit3,
  riddles: Lightbulb,
  dictation: Mic,
  vocab: BookMarked,
  mtf: Target,
  mcq: HelpCircle,
  realworld: Globe,
  literature: BookMarked,
  dialogue_writing: MessageSquare,
  generate_idea_words: Lightbulb,
  how_sentences_change: Edit3,
  main_idea: Target,
  story_completion: Feather,
  text_from_picture: Eye,
  text_from_text: FileText,
  writer_general_sentences: Edit3,
  word: BookMarked,
  words: BookMarked,
  passage_read: BookOpen,
  passage_jw: Shuffle,
  passage_fib: Edit3,
  passage_spelling: BookMarked,
  passage_vocab: BookMarked,
  passage_comprehension: BookOpen,
  passage_qna: HelpCircle,
  assignment: ClipboardCheck,
  assignment_pdf: ClipboardCheck,
  assignment_video: ClipboardCheck,
  assignment_audio: ClipboardCheck,
  assignment_image: ClipboardCheck,
  assessment: GraduationCap,
};

const ActivityTypeColors = {
  video: "from-blue-50 to-blue-100",
  audio: "from-purple-50 to-purple-100", 
  qna: "from-indigo-50 to-indigo-100",
  read: "from-emerald-50 to-emerald-100",
  write: "from-orange-50 to-orange-100",
  assessment: "from-red-50 to-red-100",
  assignment: "from-yellow-50 to-yellow-100",
  default: "from-slate-50 to-slate-100",
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

const ActivityCard = ({ subconcept, index, isEnabled, isCompleted, isNext, stageId, currentUnitId }) => {
  const normalizedIconMap = Object.keys(iconMap).reduce(
    (acc, key) => {
      acc[key.toLowerCase()] = iconMap[key];
      return acc;
    },
    {} as Record<string, (typeof iconMap)[keyof typeof iconMap]>
  );

  const Icon = normalizedIconMap[subconcept.subconceptType.toLowerCase()] || BookOpen;
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
                <div className="text-gray-800 font-medium text-md">
                  Assessment already completed, you can attempt only once!
                </div>
              ),
              {
                icon: "⚠️",
                position: "top-center",
                style: {
                  border: "1px solid #d1d5db",
                  padding: "12px 16px",
                  color: "#374151",
                  background: "#f9fafb",
                  borderRadius: "8px",
                },
              }
            );
          }
        }}
      >
        <div
          className={`
            relative overflow-hidden rounded-lg border transition-all duration-300 p-6 min-h-[120px] bg-white
            ${isCompleted 
              ? "border-emerald-200 shadow-sm" 
              : isEnabled 
                ? "border-slate-200 hover:border-blue-300 hover:shadow-md hover:scale-[1.02]" 
                : "border-gray-200 opacity-70"}
            ${isNext ? "ring-2 ring-blue-200 ring-opacity-60 shadow-md" : ""}
          `}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
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
                    relative p-3 rounded-lg transition-all duration-300
                    ${isCompleted 
                      ? "bg-emerald-100" 
                      : isEnabled 
                        ? "bg-slate-50 group-hover:bg-blue-50" 
                        : "bg-gray-100"}
                  `}
                >
                  <Icon
                    width="28"
                    height="28"
                    color={
                      isCompleted 
                        ? "#059669" 
                        : isEnabled 
                          ? "#3b82f6" 
                          : "#9ca3af"
                    }
                    className="object-contain"
                  />

                  {/* Status Indicator */}
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </motion.div>
                  )}

                  {!isEnabled && !isCompleted && (
                    <div className="absolute -top-1 -right-1 bg-gray-400 rounded-full p-1">
                      <Lock className="w-3 h-3 text-white" />
                    </div>
                  )}

                  {isNext && !isCompleted && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1"
                    >
                      <Play className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
              </div>

              {/* Activity Info */}
              <div className="flex-1 min-w-0">
                <h3 className={`
                  font-semibold text-base leading-tight mb-1 truncate
                  ${isCompleted 
                    ? "text-emerald-700" 
                    : isEnabled 
                      ? "text-slate-700" 
                      : "text-gray-500"}
                `}>
                  {subconcept.subconceptDesc}
                </h3>
                <p className={`
                  text-sm capitalize
                  ${isCompleted 
                    ? "text-emerald-600" 
                    : isEnabled 
                      ? "text-blue-600" 
                      : "text-gray-400"}
                `}>
                  {subconcept.subconceptType.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            {/* Action Indicator */}
            <div className={`
              transition-all duration-300
              ${isEnabled ? "opacity-100 group-hover:translate-x-0.5" : "opacity-40"}
            `}>
              {isCompleted ? (
                <Trophy className="w-5 h-5 text-emerald-500" />
              ) : isEnabled ? (
                <ChevronRight className="w-5 h-5 text-blue-500" />
              ) : (
                <Lock className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>

          {/* Next Activity Pulse */}
          {isNext && !isCompleted && (
            <>
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-blue-100/50 rounded-lg"
              />
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-md">
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

export default function SubConceptsPage() {
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

  const completedCount = subconcepts.filter(s => s.completionStatus === "yes").length;
  const progressPercentage = subconcepts.length > 0 ? (completedCount / subconcepts.length) * 100 : 0;

  if (loading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
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
        <audio src="/sounds/unit_completion_success.mp3" autoPlay />
      )}
      {audioPlaying && (
        <audio
          src="/sounds/unit_completion_success.mp3"
          autoPlay
          onEnded={() => setAudioPlaying(false)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Hero Section */}
        <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                {unitName || "Loading Unit..."}
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                {unitDescription || "Loading description..."}
              </p>
            </motion.div>

            {/* Progress Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-semibold text-slate-700">Learning Progress</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-500">
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
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                  </motion.div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-slate-600 font-medium">{Math.round(progressPercentage)}% Complete</span>
                  {progressPercentage === 100 && (
                    <div className="flex items-center space-x-1 text-emerald-600">
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
                <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl shadow-sm p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white/20 p-3 rounded-lg">
                        <Start width="28" height="28" color="white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Begin Your Learning Journey</h3>
                        <p className="text-slate-200 text-sm">Start with the first activity below</p>
                      </div>
                    </div>
                    <Star className="w-6 h-6 text-slate-300" />
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
                    stageId={stageId}
                    currentUnitId={currentUnitId}
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
                    rounded-lg shadow-sm p-6 border
                    ${unitCompletionStatus === "yes" || 
                      unitCompletionStatus.toLowerCase() === "unit completed without assignments"
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400 text-white" 
                      : "bg-gray-100 border-gray-300 text-gray-500"}
                  `}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`
                          p-3 rounded-lg
                          ${unitCompletionStatus === "yes" || 
                            unitCompletionStatus.toLowerCase() === "unit completed without assignments"
                            ? "bg-white/20" 
                            : "bg-gray-200"}
                        `}>
                          <Trophy 
                            width="28" 
                            height="28" 
                            color={
                              unitCompletionStatus === "yes" || 
                              unitCompletionStatus.toLowerCase() === "unit completed without assignments"
                                ? "white" 
                                : "#9ca3af"
                            } 
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {unitCompletionStatus === "yes" || 
                             unitCompletionStatus.toLowerCase() === "unit completed without assignments"
                              ? "Congratulations! Unit Complete!" 
                              : "Finish Unit"}
                          </h3>
                          <p className={`text-sm
                            ${unitCompletionStatus === "yes" || 
                              unitCompletionStatus.toLowerCase() === "unit completed without assignments"
                              ? "text-emerald-100" 
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
                        <Trophy className="w-6 h-6 text-emerald-200" />
                      ) : (
                        <Lock className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Professional Success Modal */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-md mx-4 border border-slate-200"
              >
                {/* Success Icon */}
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-8 h-8 text-emerald-600" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  Unit Completed Successfully
                </h2>

                {/* Message */}
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Congratulations on completing this learning unit. Your progress demonstrates excellent commitment to your educational journey.
                </p>

                {/* Progress Indicator */}
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                    <span>Unit Progress</span>
                    <span className="font-semibold">100%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="bg-emerald-500 h-2 rounded-full"
                    />
                  </div>
                </div>

                {/* Action Message */}
                <p className="text-sm text-slate-500">
                  Redirecting to your dashboard in a moment...
                </p>

                {/* Loading indicator */}
                <div className="flex justify-center mt-4">
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-emerald-500 rounded-full"
                    />
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-emerald-500 rounded-full"
                    />
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
