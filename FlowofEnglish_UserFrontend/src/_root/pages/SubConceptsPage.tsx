import { useState, useEffect } from "react";
import {
  CheckCircle2,
  BookOpen,
  Mic,
  PlayCircle,
  Headphones,
  PenTool,
  Play,
  Flag,
} from "lucide-react";
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
  Software: BookOpen,
  Literal: Mic,
  activity: PenTool,
  video: PlayCircle,
  listen: Headphones,
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

  const fetchSubconcepts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/programconceptsmappings/${user.userId}/unit/${unitId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching subconcepts:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchAndSetSubconcepts = async () => {
      if (user) {
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
    const height = 1000;
    const width = 1000;
    const curveWidth = width;

    return `M${curveWidth},0 
          C0,${height / 16} ${width / 0.5},${height / 16} ${curveWidth / 0.8},${
      height / 8
    }
          C0,${(3 * height) / 16} ${width / 0.5},${(3 * height) / 16} ${
      curveWidth / 0.8
    },${height / 4}`;
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
    <div
      className="w-full h-screen overflow-scroll"
      style={{ backgroundImage: `url('/images/scurve-bg.jpg')` }}
    >
      <Header2 />
      <svg
        className="w-full h-auto mt-40"
        viewBox="600 -50 1000 1400"
        preserveAspectRatio="xMinYMin meet"
      >
        <path
          d={getPath()}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="6"
          className="curve-path"
        />
        {[...Array(totalSteps)].map((_, index) => {
          const point = getPointOnPath(index / (totalSteps - 1));
          const subconcept =
            index > 0 && index < totalSteps - 1 ? subconcepts[index - 1] : null;

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
                  className={`transition-transform duration-300 ease-out ${
                    animationTrigger ? "scale-100" : "scale-0"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <rect
                    x={point.x - 24}
                    y={point.y - 24}
                    width="36"
                    height="36"
                    rx="12"
                    ry="12"
                    fill={
                      isEnabled
                        ? isCompleted
                          ? "#4CAF50"
                          : "#2196F3"
                        : "#9E9E9E"
                    }
                  />
                  <Icon
                    x={point.x - 14}
                    y={point.y - 14}
                    width="16"
                    height="16"
                    color="white"
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
                    className="bg-[#22C55E] text-white p-1 rounded-[5px] text-[8px] text-center font-medium"
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      whiteSpace: "nowrap",
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
  );
}
