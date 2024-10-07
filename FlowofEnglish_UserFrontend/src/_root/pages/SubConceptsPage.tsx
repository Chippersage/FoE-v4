import { useState, useEffect } from "react";
import {
  CheckCircle2,
  BookOpen,
  Mic,
  PlayCircle,
  Headphones,
  PenTool,
  Play,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useLocation } from "react-router-dom";

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
  software: BookOpen,
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
  const { userId } = useParams();
  const [subconcepts, setSubconcepts] = useState<Subconcept[]>([]);
  const [started, setStarted] = useState(true);
  const [totalSteps, setTotalSteps] = useState(2);
  const [animationTrigger, setAnimationTrigger] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const fetchSubconcepts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/programconceptsmappings/${userId}/unit/${unitId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching subconcepts:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchAndSetSubconcepts = async () => {
      try {
        const result = await fetchSubconcepts();
        const fetchedSubconcepts: SubconceptData = result.subConcepts;
        setSubconcepts(Object.values(fetchedSubconcepts));
      } catch (err) {
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAndSetSubconcepts();
  }, [userId, unitId]);

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
}, []);  // Empty dependency array to trigger on initial render

  const getPath = () => {
    const width = 1000;
    const height = 400;
    const curveHeight = height / 2;
    return `M0,${curveHeight} 
            C${width / 4},0 ${width / 4},${height} ${width / 2},${curveHeight}
            C${(3 * width) / 4},0 ${(3 * width) / 4},${height} ${width},${curveHeight}`;
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
    <div className="w-full h-[400px] overflow-hidden relative">
      <svg
        className="w-full h-full"
        viewBox="0 0 1000 400"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d={getPath()}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="4"
          className="curve-path"
        />
        {/* {[...Array(totalSteps)].map((_, index) => {
          const point = getPointOnPath(index / (totalSteps - 1));
          const subconcept =
            index > 0 && index < totalSteps - 1 ? subconcepts[index - 1] : null;
          const Icon = subconcept
            ? iconMap[subconcept.subconceptType] || PenTool
            : index === 0
            ? Play
            : CheckCircle2;
          const isCompleted = subconcept && subconcept.completionStatus === "yes";
          const isEnabled =
            started &&
            (index === 0 || subconcepts.slice(0, index - 1).every(s => s.completionStatus === "yes")); */}
{[...Array(totalSteps)].map((_, index) => {
  const point = getPointOnPath(index / (totalSteps - 1));
  const subconcept =
    index > 0 && index < totalSteps - 1 ? subconcepts[index - 1] : null;
    
  // Cast subconceptType to keyof typeof iconMap and provide a fallback (PenTool)
  const Icon = subconcept
    ? iconMap[subconcept.subconceptType as keyof typeof iconMap] || PenTool
    : index === 0
    ? Play
    : CheckCircle2;
    
  const isCompleted = subconcept && subconcept.completionStatus === "yes";
  
  const isEnabled =
    started &&
    (index === 0 || subconcepts.slice(0, index - 1).every(s => s.completionStatus === "yes"));

  // Your rendering logic here


          return (
            <Link
              to={`/subconcept/${subconcept?.subconceptId}`}
              state={{ subconcept, stageId, currentUnitId }}
              key={index}
            >
              <g
                className={`transition-transform duration-300 ease-out ${
                  animationTrigger ? "scale-100" : "scale-0"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="20"
                  fill={isEnabled ? (isCompleted ? "#4CAF50" : "#2196F3") : "#9E9E9E"}
                  className="transition-all duration-300"
                />
                <g
                  className={`transition-transform duration-300 ease-out ${
                    isEnabled ? "scale-100" : "scale-0"
                  }`}
                  style={{ transitionDelay: `${index * 100 + 200}ms` }}
                >
                  <Icon
                    x={point.x - 12}
                    y={point.y - 12}
                    width="24"
                    height="24"
                    color="white"
                  />
                </g>
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