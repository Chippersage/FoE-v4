// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
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
  const { user } = useUserContext();
  const [subconcepts, setSubconcepts] = useState<Subconcept[]>([]);
  // const [started, setStarted] = useState(true);
  const [totalSteps, setTotalSteps] = useState(2);
  const [animationTrigger, setAnimationTrigger] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const pathWidth = 1000; // Total width of the SVG
  const pathHeight = 400; // Total height of the SVG
  const rowHeight = pathHeight / 2; // Height of each row
  const [showConfetti, setShowConfetti] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [unitCompletionStatus, setUnitCompletionStatus] = useState("");
  const [unitName, setUnitName] = useState("");
  const [unitDescription, setUnitDescription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [celebratedStageName, setCelebratedStageName] = useState("");
  const navigate = useNavigate();
  const selectedProgramId = localStorage.getItem("selectedProgramId");

  const bounceAnimation = {
    y: [0, -20, 0],
    scale: [1, 1.2, 1], // Scale up to 1.1 at the peak of the bounce
    transition: {
      duration: 1,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
      ease: "easeInOut",
    },
  };

  const backgroundUrl =
    selectedProgramId === "PET-Level-1"
      ? "/images/PET-background.png"
      : "/images/index.png";

  const [targetIndex, setTargetIndex] = useState(null);
  const scrollableDivRef = useRef(null);
  const stepRefs = useRef([]);
  // const { pathname } = useLocation(); // Detect route changes

  // Calculate target index and update state
  useEffect(() => {
    const calculatedTargetIndex =
      subconcepts.findIndex((s) => s.completionStatus === "incomplete") + 1; // Adjust the index calculation if needed
    setTargetIndex(calculatedTargetIndex === 0 ? subconcepts.length + 1 : calculatedTargetIndex); 
    console.log(calculatedTargetIndex);
  }, [subconcepts]); // Trigger when subconcepts change

  // Scroll to the active subconcept when the target index changes
  useEffect(() => {
    if (targetIndex !== null && stepRefs.current[targetIndex]) {
      stepRefs.current[targetIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [targetIndex]); // Trigger on targetIndex change

  // useEffect(() => {
  //   if (scrollableDivRef.current) {
  //     scrollableDivRef.current.scrollTo({
  //       top: 0,
  //       behavior: "smooth",
  //     });
  //   }
  // }, [pathname]); // Trigger scroll when the route changes

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
          console.log(result);
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
    console.log(allUnits);
    // Find the current unit index
    const currentIndex = allUnits.findIndex((unit) => {
      console.log(unit);
      return unit.unitId == unitId;
    });
    console.log(currentIndex);
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

  const getPath = () => {
    const radius = 50; // Radius of the curves at ends
    return `
      M100,${rowHeight / 2} 
      H${pathWidth - 100 - radius} 
      A${radius},${radius} 0 0 1 ${pathWidth - 100},${rowHeight / 2 + radius}
      V${rowHeight + rowHeight / 2 - radius} 
      A${radius},${radius} 0 0 1 ${pathWidth - 100 - radius},${
      rowHeight + rowHeight / 2
    }
      H${100 + radius}
      A${radius},${radius} 0 0 0 100,${rowHeight + rowHeight / 2 + radius}
    V${rowHeight + rowHeight + rowHeight / 2 - radius} 
    A${radius},${radius} 0 0 0 ${100 + radius},${
      rowHeight + rowHeight + rowHeight / 2
    }
    H${pathWidth - 100 - radius}
     
    `;
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
        className="relative w-full h-screen overflow-y-auto"
      >
        <div
          className={`fixed inset-0 bg-center md:bg-cover bg-no-repeat pointer-events-none shadow-inner-black`}
          style={{
            backgroundImage: `url(${backgroundUrl})`,
          }}
        />
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 bg-black">
            <DotLottieReact
              src="/animation.lottie"
              loop
              autoplay
              style={{ width: "2000px", height: "1000px", zIndex: 9999 }}
            />
            <div className="absolute bg-white p-6 rounded shadow-lg text-center">
              <h2 className="text-2xl font-bold text-green-500">
                Congratulations!
              </h2>
              <p>You have unlocked the next unit!</p>
              <p className="text-sm text-gray-500 mt-2">
                You are being redirected to the next unit...
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
          className="absolute top-[160px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center font-semibold text-white bg-[#E26291] px-4 py-2 rounded-[2px] max-w-full truncate text-sm sm:text-sm "
          style={{ maxWidth: "90%" }} // Ensures text doesn't overflow
        >
          <div>{unitName || "Loading Unit..."}</div>
          <div className=" text-xs sm:text-xs md:text-xs  font-normal opacity-80 italic">
            {unitDescription || "Loading description..."}
          </div>
        </div>

        {/* Scrollable SVG Container */}
        <div className="w-full h-full sm:mt-36 mt-44 relative">
          <svg
            className="w-full h-auto"
            viewBox={`0 0 ${pathWidth} ${pathWidth / 1.5}`}
            preserveAspectRatio="xMinYMin meet"
          >
            <path
              d={getPath()}
              fill="none"
              stroke="white"
              strokeWidth="5"
              className="curve-path"
              strokeDasharray={"20,5"}
            />
            {[...Array(totalSteps)].map((_, index) => {
              const point = getPointOnPath(index / (totalSteps - 1));
              const subconcept =
                index > 0 && index < totalSteps - 1
                  ? subconcepts[index - 1]
                  : null;

              const Icon = subconcept
                ? iconMap[subconcept.subconceptType as keyof typeof iconMap]
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
                        ? `/subconcepts/${nextUnitId}`
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
                    onClick={() => {
                      if (
                        index === totalSteps - 1 &&
                        (unitCompletionStatus === "yes" ||
                          unitCompletionStatus.toLowerCase() ===
                            "unit completed without assignments") &&
                        nextUnitId
                      ) {
                        setShowConfetti(true);
                        setAudioPlaying(true);
                        setTimeout(() => {
                          setShowConfetti(false);
                        }, 5000);
                      } else if (
                        index === totalSteps - 1 &&
                        unitCompletionStatus === "yes" &&
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
                        width="36"
                        height="36"
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
                            : point.x - 17
                        }
                        y={
                          index === 0
                            ? point.y - 45
                            : index === totalSteps - 1
                            ? point.y - 50
                            : point.y - 15
                        }
                        width={
                          index === 0 || index === totalSteps - 1 ? "70" : "30"
                        }
                        height={
                          index === 0 || index === totalSteps - 1 ? "70" : "30"
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
                          style={{ transitionDelay: `${index * 100 + 300}ms` }}
                        >
                          <circle
                            cx={point.x + 12}
                            cy={point.y - 12}
                            r="8"
                            fill="#4CAF50"
                          />
                          <CheckCircle2
                            x={point.x + 8}
                            y={point.y - 16}
                            width="8"
                            height="8"
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
      </div>
    </>
  );
}
