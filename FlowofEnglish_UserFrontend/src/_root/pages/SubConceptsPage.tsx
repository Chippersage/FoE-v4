import { useState, useEffect } from "react";
import {
  CheckCircle2,
  // BookOpen,
  // Mic,
  // PlayCircle,
  // Headphones,
  PenTool,
  Play,
  Flag,
} from "lucide-react";
import PenNib from "@/components/PenNib";
import Book from "@/components/Book";
import Camera from "@/components/Camera";
import Speaker from "@/components/Speaker";
import Picture from "@/components/Picture";
import ReadAlongBook from "@/components/ReadAlongBook";
// import TeachingIcon from "@/assets/icons/workshop.svg";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Header2 from "@/components/Header2";
import { useUserContext } from "@/context/AuthContext";

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
  passage: ReadAlongBook,
};

export default function SubConceptsPage() {
  const location = useLocation();
  const stageId = location.state?.stageId;
  const currentUnitId = location.state?.currentUnitId;
  const { unitId } = useParams();
  const { user } = useUserContext();
  const [subconcepts, setSubconcepts] = useState<Subconcept[]>([]);
  const [started, setStarted] = useState(true);
  const [totalSteps, setTotalSteps] = useState(2);
  const [animationTrigger, setAnimationTrigger] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const pathWidth = 1000; // Total width of the SVG
  const pathHeight = 400; // Total height of the SVG
  const rowHeight = pathHeight / 2; // Height of each row

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
        console.log(user);
        try {
          const result = await fetchSubconcepts();
          console.log(result);
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

  useEffect(() => {
    if (started) {
      setAnimationTrigger(true);
    }
  }, [started]);

  useEffect(() => {
    setAnimationTrigger(true);
  }, []); // Empty dependency array to trigger on initial render

  const getPath = () => {

    const radius = 50; // Radius of the curves at ends
    return `
      M100,${rowHeight / 2} 
      H${pathWidth - 100 - radius} 
      A${radius},${radius} 0 0 1 ${pathWidth - 100},${rowHeight / 2 + radius}
      V${rowHeight + rowHeight / 2 - radius} 
      A${radius},${radius} 0 0 1 ${pathWidth - 100 - radius},${rowHeight + rowHeight / 2}
      H${100 + radius}
      A${radius},${radius} 0 0 0 100,${rowHeight + rowHeight / 2 + radius}
    V${rowHeight + rowHeight + rowHeight / 2 - radius} 
    A${radius},${radius} 0 0 0 ${100 +radius},${rowHeight + rowHeight +rowHeight / 2}
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <Header2 />
      <div
        className="w-full overflow-scroll custom-scrollbar-2 mt-36"
        style={{ backgroundImage: `url('/images/scurve-bg.jpg')` }}
      >
        <svg
          className="w-full h-auto"
          viewBox={`0 0 ${pathWidth} ${pathWidth}`}
          preserveAspectRatio="xMinYMin meet"
        >
        <path
              d={getPath()}
              fill="none"
              stroke="#4CAF50"
              strokeWidth="3"
              className="curve-path"
            />

          {[...Array(totalSteps)].map((_, index) => {
            const point = getPointOnPath(index / (totalSteps - 1));
            const subconcept =
              index > 0 && index < totalSteps - 1
                ? subconcepts[index - 1]
                : null;

            const Icon = subconcept
              ? iconMap[subconcept.subconceptType as keyof typeof iconMap] ||
                PenTool
              : index === 0
              ? Play
              : Flag;

            const isCompleted =
              subconcept && subconcept.completionStatus === "yes";
            const isEnabled =
              started &&
              (index === 0 ||
                (index === totalSteps - 1 &&
                  subconcepts.every((s) => s.completionStatus === "yes")) ||
                (subconcept?.completionStatus !== "disabled" &&
                  index !== totalSteps - 1));

            return (
              <g key={index}>
                <Link
                  // @ts-ignore
                  to={
                    isEnabled && index !== totalSteps - 1 && index !== 0
                      ? `/subconcept/${subconcept?.subconceptId}`
                      : null
                  }
                  state={{ subconcept, stageId, currentUnitId }}
                  className={`${!isEnabled && "cursor-not-allowed"}`}
                  onMouseEnter={() => setActiveTooltip(index)}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <g
                    className={`transition-transform duration-300 ease-out  ${
                      animationTrigger ? "scale-100" : "scale-0"
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <rect
                    className="bg-white"
                      x={point.x - 20}
                      y={point.y - 20}
                      width="36"
                      height="36"
                      rx="2"
                      ry="2"
                      fill={(index === 0 || index === totalSteps - 1 || subconcept?.completionStatus === 'incomplete')? "#2196F3" : "#fff"} // This removes the fill color
                      stroke={
                        isEnabled
                          ? isCompleted
                            ? "#4CAF50" // Outline color when completed
                            : "#2196F3" // Outline color when enabled but not completed
                          : "#9E9E9E" // Outline color when not enabled
                      }
                      strokeWidth="2" 
                    />

                    <Icon
                      x={point.x - 15}
                      y={point.y - 15}
                      width="25"
                      height="25"
                      color="white"
                      className="object-contain"
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
                </Link>
                {activeTooltip === index && (
                  <foreignObject
                    x={point.x - 100}
                    y={point.y - 60}
                    width="200"
                    height="40"
                  >
                    <div
                      className={`${
                        isEnabled ? "bg-[#22C55E]" : "bg-slate-400"
                      } text-white p-1 rounded-[5px] text-[8px] text-center font-medium z-[1000]`}
                      style={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        whiteSpace: "nowrap",
                        zIndex: 1000
                      }}
                    >
                      {subconcept
                        ? subconcept.subconceptDesc
                        : index === 0
                        ? "Start"
                        : "Finish"}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>

        {!started && (
          <button
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-full transition-transform duration-200 hover:scale-110 active:scale-90"
            onClick={() => setStarted(true)}
          >
            Start
          </button>
        )}
      </div>
    </>
  );
}
