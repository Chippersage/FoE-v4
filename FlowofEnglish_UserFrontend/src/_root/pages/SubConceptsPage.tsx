// @ts-nocheck
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  // BookOpen,
  // Mic,
  // PlayCircle,
  // Headphones,
  // PenTool,
  // Play,
  // Flag,
} from "lucide-react";
import PenNib from "@/components/activityIcons/PenNib";
import Book from "@/components/activityIcons/Book";
import Camera from "@/components/activityIcons/Camera";
import Speaker from "@/components/activityIcons/Speaker";
import Picture from "@/components/activityIcons/Picture";
// import ReadAlongBook from "@/components/ReadAlongBook";
import Start from "@/components/activityIcons/Start";
import QnA from "@/components/activityIcons/QnA";
// import TeachingIcon from "@/assets/icons/workshop.svg";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
// import { useLocation } from "react-router-dom";
import Header2 from "@/components/Header2";
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

import { useSession } from "@/context/TimerContext";
import Default from "@/components/activityIcons/Default";
import WriterGeneralSentences from "@/components/activityIcons/WriterGeneralSentences";
import BackButton from "@/components/BackButton";

interface Subconcept {
  subconceptId: string;
  subconceptDesc: string;
  subconceptType: string;
  subconceptLink: string;
  completionStatus: string;
}

interface SubconceptData {
  [key: string]: Subconcept;
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

export default function SubConceptsPage() {
  // const location = useLocation();
  // const stageId = location.state?.stageId;
  const [stageId, setStageId] = useState("");
  // const currentUnitId = location.state?.currentUnitId;
  const [currentUnitId, setCurrentUnitId] = useState("");
  // const nextUnitId = location.state?.nextUnitId;
  const { unitId } = useParams();
  const [nextUnitId, setNextUnitId] = useState(null);
  const { user, selectedCohortWithProgram } = useUserContext();
  const [subconcepts, setSubconcepts] = useState<Subconcept[]>([]);
  // const [started, setStarted] = useState(true);
  const [animationTrigger, setAnimationTrigger] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [pathWidth, setPathWidth] = useState(1000);
  const [pathHeight, setPathHeight] = useState(400);
  const rowHeight = pathHeight / 2; // Height of each row
  const [totalSteps, setTotalSteps] = useState(2);
  const [showConfetti, setShowConfetti] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [unitCompletionStatus, setUnitCompletionStatus] = useState("");
  const [unitName, setUnitName] = useState("");
  const [unitDescription, setUnitDescription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [celebratedStageName, setCelebratedStageName] = useState("");
  const navigate = useNavigate();
  const selectedProgramId = localStorage.getItem("selectedProgramId");
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null); // Start with null
  const [pathData, setPathData] = useState(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  const { formattedElapsedTime } = useSession();

  const bounceAnimation = {
    y: [0, -20, 0],
    // scale: [1, 1.2, 1], // Scale up to 1.1 at the peak of the bounce
    transition: {
      duration: 1,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
      ease: "easeInOut",
    },
  };

  // just to ensure paths calculated and
  const [delayedPoints, setDelayedPoints] = useState<
    { x: number; y: number }[]
  >([]);

  // Detect orientation changes
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  // Update path data when totalSteps, path size, or screen size changes
  useEffect(() => {
    if (totalSteps) {
      if (totalSteps < 5 && screenWidth >= 640) {
        const calculatedPath = getSinglePath();
        setPathData(calculatedPath);
      } else {
        const calculatedPath = getPath(
          totalSteps > 8 ? (totalSteps > 14 ? 3 : 2) : 1
        );
        setPathData(calculatedPath);
      }
    }

    const timer = setTimeout(() => {
      const newPoints = [...Array(totalSteps)].map((_, index) =>
        getPointOnPath(index / (totalSteps - 1))
      );
      setDelayedPoints(newPoints);
    }, 300);

    return () => clearTimeout(timer);
  }, [totalSteps, screenWidth, screenHeight, pathWidth, pathHeight]); // Trigger on orientation change

  // Update path dimensions when totalSteps or screen size changes
  useLayoutEffect(() => {
    if (screenWidth < 768) {
      setPathWidth(300);
    } else if (screenWidth >= 768 && screenWidth < 1024) {
      setPathWidth(800);
    } else {
      setPathWidth(1000);
    }

    const baseHeight = 400;
    const heightIncrement = 50;
    const newHeight = baseHeight + (totalSteps - 2) * heightIncrement;
    setPathHeight(newHeight);
  }, [totalSteps, screenWidth, screenHeight]); // Recalculate on orientation change

  useEffect(() => {
    // const selectedProgramId = localStorage.getItem("selectedProgramId");

    if (selectedCohortWithProgram) {
      // If `selectedProgramId` is not set, wait for `user` to load
      // if (user && user.program && user.program.programId) {
      //   const programId = user.program.programId;
      //   localStorage.setItem("selectedProgramId", programId);

      // Set background URL dynamically
      setBackgroundUrl(
        selectedCohortWithProgram?.program?.programId.startsWith("PET")
          ? "/images/PET-background-1.png"
          : "/images/index.png"
      );

      // setIsLoading(false); // Background determined, stop loading
    }
  }, [selectedCohortWithProgram]);

  const [targetIndex, setTargetIndex] = useState(null);
  const scrollableDivRef = useRef(null);
  const stepRefs = useRef([]);
  // const { pathname } = useLocation(); // Detect route changes

  // Calculate target index and update state
  useEffect(() => {
    const incompleteIndex = subconcepts.findIndex(
      (s) => s.completionStatus === "incomplete"
    );
    const ignoredIndex = subconcepts.findIndex(
      (s) => s.completionStatus === "ignored"
    );

    // Find the first occurring status
    let calculatedTargetIndex;
    if (
      incompleteIndex !== -1 &&
      (ignoredIndex === -1 || incompleteIndex < ignoredIndex)
    ) {
      calculatedTargetIndex = incompleteIndex;
    } else {
      calculatedTargetIndex = ignoredIndex;
    }

    setTargetIndex(
      calculatedTargetIndex === -1
        ? subconcepts.length + 1
        : calculatedTargetIndex + 1
    );
  }, [subconcepts]);

  // Scroll to the active subconcept when the target index changes
  useEffect(() => {
    setTimeout(() => {
      if (targetIndex !== null && stepRefs.current[targetIndex]) {
        stepRefs.current[targetIndex].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 500);
  }, [targetIndex]); // Trigger on targetIndex change

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
        // console.log(user);
        try {
          const result = await fetchSubconcepts();
          // console.log(result);
          setUnitCompletionStatus(result.unitCompletionStatus);
          setStageId(result.stageId);
          setCurrentUnitId(result.unitId);
          setUnitName(result.unitName);
          setUnitDescription(result.unitDesc);
          setCelebratedStageName(result.stageName);
          const fetchedSubconcepts: SubconceptData = result.subConcepts;
          setSubconcepts(Object.values(fetchedSubconcepts));
        } catch (err) {
          setError("Failed to fetch data.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAndSetSubconcepts();
  }, [user, unitId]);

  useEffect(() => {
    setTotalSteps(subconcepts.length + 2); // Including start and end
  }, [subconcepts]);

  // useEffect(() => {
  //   if (started) {
  //     setAnimationTrigger(true);
  //   }
  // }, [started]);

  useEffect(() => {
    setAnimationTrigger(true);
  }, []); // Empty dependency array to trigger on initial render

  useEffect(() => {
    if (!unitId) return;

    // Retrieve all units and parse as an array
    const allUnitsString = localStorage.getItem("allUnitsOfCurrentStage");
    const allUnits: { unitId: string }[] = allUnitsString
      ? JSON.parse(allUnitsString)
      : [];
    // console.log(allUnits);
    // Find the current unit index
    const currentIndex = allUnits.findIndex((unit) => {
      // console.log(unit);
      return unit.unitId == unitId;
    });
    // console.log(currentIndex);
    // Find the next unit
    if (currentIndex !== -1 && currentIndex < allUnits.length - 1) {
      const nextUnit = allUnits[currentIndex + 1];
      // @ts-ignore
      setNextUnitId(nextUnit?.unitId || null);
    } else {
      setNextUnitId(null); // No next unit
    }
  }, [unitId]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/");
  };

  const getSinglePath = () => {
    // Fixed starting Y position
    const startY = 200; // Fixed starting position
    let path = `M100,${startY}`;

    // Draw a straight horizontal line to the right
    path += `H${pathWidth - 40}`;

    return { path, dynamicHeight: startY + 100 }; // Add some padding
  };

  const getPath = (numWaves = 2) => {
    const radius = window.innerWidth >= 640 ? 50 : 30;
    const waveHeight = rowHeight / 2;
    const startY = 150; // Fixed starting position

    let path = `M100,${startY}`;
    let maxY = startY; // Track max Y-coordinate

    for (let i = 0; i < numWaves; i++) {
      let yOffset = i * waveHeight * 2;
      let bottomY = waveHeight * 2 + startY + yOffset;
      maxY = Math.max(maxY, bottomY); // Update max Y-coordinate

      path += `
      H${pathWidth - 40 - radius} 
      A${radius},${radius} 0 0 1 ${pathWidth - 40},${startY + radius + yOffset}
      V${waveHeight + startY - radius + yOffset} 
      A${radius},${radius} 0 0 1 ${pathWidth - 40 - radius},${
        waveHeight + startY + yOffset
      }
      H${40 + radius}
      A${radius},${radius} 0 0 0 40,${waveHeight + startY + radius + yOffset}
      V${waveHeight * 2 + startY - radius + yOffset} 
      A${radius},${radius} 0 0 0 ${40 + radius},${bottomY}
    `;
    }

    path += ` H${pathWidth - 40}`; // Ensure path extends properly

    return { path, dynamicHeight: maxY + 100 }; // Add some padding
  };

  const getPointOnPath = (progress: number) => {
    const path = document.querySelector(".curve-path") as SVGPathElement | null;
    if (!path) return { x: 0, y: 0 };
    const length = path.getTotalLength();
    const point = path.getPointAtLength(progress * length);
    return { x: point.x, y: point.y };
  };

  const handleFinishClick = () => {
    setShowConfetti(true); // Trigger confetti animation
    setAudioPlaying(true); // Play audio
    setTimeout(() => {
      setShowConfetti(false); // Hide confetti after 5 seconds
    }, 5000);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <Header2 />
      <BackButton className="fixed top-28 left-4 z-20" /> {/* Add this line */}
      <KidFriendlyModal
        isOpen={isModalOpen}
        onClose={closeModal}
        stageName={celebratedStageName}
        congratsType="stageCompletion"
      />
      {/* Audio Element */}
      {isModalOpen && (
        <audio
          src="/youaresuperb.mp3"
          autoPlay

          // onEnded={() => setShowConfetti(false)}
        />
      )}
      <div
        ref={scrollableDivRef}
        className="relative w-full h-auto overflow-y-auto"
      >
        <div
          className={`fixed inset-0 bg-center md:bg-cover bg-no-repeat pointer-events-none opacity-70 top-24 sm:top-0`}
          style={{
            backgroundImage: `url(${backgroundUrl})`,
          }}
        />
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
            <DotLottieReact
              src="/animation.lottie"
              loop
              autoplay
              style={{ width: "2000px", height: "1000px", zIndex: 9999 }}
            />
            <div className="absolute bg-white p-6 rounded shadow-lg text-center max-w-[300px] sm:max-w-xl">
              <h2 className="text-2xl font-bold text-green-500">
                Congratulations!
              </h2>
              <p>You have completed this unit successfully!</p>
              <p className="text-sm text-gray-500 mt-2">
                You will be redirected to the home page. From there, you can
                continue to the next unit to keep learning!
              </p>
            </div>
          </div>
        )}

        {/* Audio Element */}
        {audioPlaying && (
          <audio
            src="/youaresuperb.mp3"
            autoPlay
            onEnded={() => setAudioPlaying(false)}
          />
        )}

        {/* Current Unit Title */}
        <div
          className="fixed z-[10] top-[160px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center font-semibold text-white bg-[#E26291] px-4 py-2 rounded-[2px] max-w-full truncate text-sm sm:text-sm "
          style={{ maxWidth: "90%" }} // Ensures text doesn't overflow
        >
          <div>{unitName || "Loading Unit..."}</div>
          <div className=" text-xs sm:text-xs md:text-xs  font-normal opacity-80 italic truncate">
            {unitDescription || "Loading description..."}
          </div>
        </div>
        {/* Session Time */}
        {formattedElapsedTime && (
          <div className="fixed z-[10] top-[200px] sm:top-[140px] right-2 flex items-center gap-2 rounded-full bg-green-50 px-2">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-600 tabular-nums">
              Session time: {formattedElapsedTime}
            </span>
          </div>
        )}
        {/* Scrollable SVG Container */}
        {pathData && (
          <div className="w-full min-h-full relative flex items-center justify-center">
            <svg
              className="w-full h-auto"
              viewBox={`0 0 ${pathWidth} ${pathData.dynamicHeight}`}
              preserveAspectRatio="xMinYMin meet"
            >
              <path
                d={
                  pathData.path
                  // totalSteps <= 5 && window.innerWidth > 728
                  //   ? getSinglePath()
                  //   : getPath(totalSteps > 8 ? (totalSteps > 14 ? 3 : 2) : 1)
                }
                fill="none"
                stroke="white"
                strokeWidth="5"
                className="curve-path"
                strokeDasharray={"20,5"}
              />
              {delayedPoints.map((_, index) => {
                const point = getPointOnPath(index / (totalSteps - 1));
                const subconcept =
                  index > 0 && index < totalSteps - 1
                    ? subconcepts[index - 1]
                    : null;

                const normalizedIconMap = Object.keys(iconMap).reduce(
                  (acc, key) => {
                    acc[key.toLowerCase()] = iconMap[key]; // Converting keys to lowercase
                    return acc;
                  },
                  {} as Record<string, (typeof iconMap)[keyof typeof iconMap]>
                );

                const Icon = subconcept
                  ? normalizedIconMap[
                      subconcept.subconceptType.toLowerCase() as keyof typeof normalizedIconMap
                    ]
                  : index === 0
                  ? Start
                  : Finish;

                const isCompleted =
                  subconcept && subconcept.completionStatus === "yes";
                const isEnabled =
                  // @ts-ignore
                  // started &&
                  index === 0 ||
                  (index === totalSteps - 1 &&
                    subconcepts.every((s) => s.completionStatus === "yes")) ||
                  (subconcept?.completionStatus !== "disabled" &&
                    index !== totalSteps - 1);

                // // Find the first incomplete subconcept index
                // const firstIncompleteIndex = subconcepts.findIndex(
                //   (s) => s.completionStatus === "incomplete"
                // );
                // const targetIndex = firstIncompleteIndex + 1; // Adjust for the offset

                return (
                  <g key={index} ref={(el) => (stepRefs.current[index] = el)}>
                    <Link
                      // @ts-ignore
                      to={
                        index === totalSteps - 1 &&
                        nextUnitId &&
                        (unitCompletionStatus === "yes" ||
                          unitCompletionStatus.toLowerCase() ===
                            "unit completed without assignments")
                          ? `/home`
                          : isEnabled && index !== totalSteps - 1 && index !== 0
                          ? `/subconcept/${subconcept?.subconceptId}`
                          : null
                      }
                      state={{ subconcept, stageId, currentUnitId }}
                      className={`${
                        !isEnabled &&
                        unitCompletionStatus.toLowerCase() !==
                          "unit completed without assignments" &&
                        "cursor-not-allowed"
                      }`}
                      onMouseEnter={() => setActiveTooltip(index)}
                      onMouseLeave={() => setActiveTooltip(null)}
                      onClick={(e) => {
                        if (
                          index === totalSteps - 1 &&
                          (unitCompletionStatus === "yes" ||
                            unitCompletionStatus.toLowerCase() ===
                              "unit completed without assignments") &&
                          nextUnitId
                        ) {
                          e.preventDefault(); // Prevent immediate navigation
                          setShowConfetti(true);
                          setAudioPlaying(true);
                          // Navigate after confetti animation
                          setTimeout(() => {
                            navigate("/home");
                          }, 5000); // Match this with confetti duration
                        } else if (
                          index === totalSteps - 1 &&
                          (unitCompletionStatus === "yes" ||
                            unitCompletionStatus.toLowerCase() ===
                              "unit completed without assignments") &&
                          !nextUnitId
                        ) {
                          openModal();
                        }
                      }}
                    >
                      <g
                        className={`transition-transform duration-300 ease-out  ${
                          animationTrigger ? "scale-100" : "scale-0"
                        }`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                      >
                        <rect
                          x={point.x - 20}
                          y={point.y - 20}
                          width="40"
                          height="40"
                          rx="2"
                          ry="2"
                          fill={
                            index === 0 || index === totalSteps - 1
                              ? "transparent"
                              : subconcept?.completionStatus === "incomplete"
                              ? "#2196F3"
                              : "#fff"
                          }
                          stroke={
                            index === 0 || index === totalSteps - 1
                              ? "none"
                              : isEnabled
                              ? isCompleted
                                ? "#4CAF50"
                                : "#2196F3"
                              : "#9E9E9E"
                          }
                          strokeWidth="2"
                          onClick={
                            index === totalSteps - 1
                              ? handleFinishClick
                              : undefined
                          }
                        />

                        <Icon
                          x={
                            index === 0
                              ? point.x - 64
                              : index === totalSteps - 1
                              ? point.x - 30
                              : point.x - 18
                          }
                          y={
                            index === 0
                              ? point.y - 45
                              : index === totalSteps - 1
                              ? point.y - 50
                              : point.y - 18
                          }
                          width={
                            index === 0 || index === totalSteps - 1
                              ? "70"
                              : "38"
                          }
                          height={
                            index === 0 || index === totalSteps - 1
                              ? "70"
                              : "38"
                          }
                          color="white"
                          className={`object-contain ${
                            index === totalSteps - 1 &&
                            unitCompletionStatus != "yes" &&
                            unitCompletionStatus?.toLowerCase() !=
                              "unit completed without assignments" &&
                            "opacity-50"
                          }`}
                        />

                        {isCompleted && (
                          <g
                            className={`transition-transform duration-300 ease-out ${
                              animationTrigger ? "scale-100" : "scale-0"
                            }`}
                            style={{
                              transitionDelay: `${index * 100 + 300}ms`,
                            }}
                          >
                            <circle
                              cx={point.x + 18}
                              cy={point.y - 20}
                              r="10"
                              fill="#4CAF50"
                            />
                            <CheckCircle2
                              x={point.x + 8}
                              y={point.y - 30}
                              width="20"
                              height="20"
                              color="white"
                            />
                          </g>
                        )}
                      </g>
                      {/* Google Pin for the first incomplete subconcept */}
                      {index === targetIndex && (
                        <motion.g animate={bounceAnimation}>
                          <image
                            x={point.x - 28}
                            y={point.y - 90} // Position above the icon
                            width="54"
                            height="60"
                            href="/images/google-pin.png" // Replace with your pin image path
                            className=""
                          />
                        </motion.g>
                      )}
                    </Link>
                    {activeTooltip === index && (
                      <foreignObject
                        x={point.x - 100}
                        y={point.y + 20}
                        width="200"
                        height="500"
                      >
                        <div
                          className={`${
                            isEnabled
                              ? "bg-[#22C55E]" // Green for enabled
                              : unitCompletionStatus?.toLowerCase() ===
                                "unit completed without assignments"
                              ? "bg-[#FFC107]" // Yellow for "unit completed without assignments"
                              : "bg-slate-400" // Default slate for all others
                          } text-white p-1 rounded-[5px] text-[8px] text-center font-medium z-[1000]`}
                          style={{
                            position: "absolute",
                            left: "50%",
                            transform: "translateX(-50%)",
                            whiteSpace: "normal",
                            zIndex: 1000,
                            maxWidth: "200px", // Restrict the width to enable ellipsis
                          }}
                        >
                          {subconcept ? (
                            subconcept.subconceptDesc
                          ) : index === 0 ? (
                            "Start"
                          ) : index === totalSteps - 1 &&
                            unitCompletionStatus !== "yes" &&
                            unitCompletionStatus?.toLowerCase() !==
                              "unit completed without assignments" ? (
                            "Complete all the activities"
                          ) : unitCompletionStatus?.toLowerCase() ===
                            "unit completed without assignments" ? (
                            <>
                              <span>Finish!</span>
                              <br />
                              <span>
                                Don't forget to come back and complete your
                                assignment(s)
                              </span>
                            </>
                          ) : (
                            "Finish"
                          )}
                        </div>
                      </foreignObject>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </>
  );
}
