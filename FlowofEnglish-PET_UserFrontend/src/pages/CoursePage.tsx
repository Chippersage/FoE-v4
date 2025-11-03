// @ts-nocheck
import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom"; // ✅ added useParams
import Sidebar from "../components/Sidebar";
import ContentRenderer from "../components/ContentRenderer";
import NextSubconceptButton from "../components/NextSubconceptButton";
import axios from "axios";
import { useUserContext } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const CoursePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { programId } = useParams(); // ✅ get programId from URL
  const passedCohort = location.state?.selectedCohort || null;
  const { user, selectedCohort, setSelectedCohort } = useUserContext();

  const [currentContent, setCurrentContent] = useState({
    url: "",
    type: "video",
    id: "",
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stages, setStages] = useState([]);
  const [programName, setProgramName] = useState("");
  const [loading, setLoading] = useState(true);

  // redirect back if cohort missing
  useEffect(() => {
    if (!passedCohort && !selectedCohort) {
      navigate("/select-cohort");
    }
  }, [passedCohort, selectedCohort, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // ✅ dynamically use programId from URL
        const res = await axios.get(
          `${API_BASE_URL}/programconceptsmappings/${user?.userId}/program/${programId}/complete`
        );

        const data = res.data;
        const stagesData = data.stages || [];
        setStages(stagesData);
        setProgramName(data.programName || "Program");

        // merge cohort + program into context
        const baseCohort = passedCohort || selectedCohort || null;
        if (baseCohort) {
          setSelectedCohort({
            ...baseCohort,
            programName: data.programName || baseCohort.programName || "Program",
            programId: programId,
          });
        }

        // auto-play first content
        for (const stage of stagesData) {
          if (stage.units?.length) {
            const firstUnit = stage.units[0];
            if (firstUnit.subconcepts?.length) {
              const firstSubconcept = firstUnit.subconcepts[0];
              setCurrentContent({
                url: firstSubconcept.subconceptLink,
                type: firstSubconcept.subconceptType,
                id: firstSubconcept.subconceptId,
              });
              break;
            }
            if (firstUnit.unitLink) {
              setCurrentContent({
                url: firstUnit.unitLink,
                type: "video",
                id: firstUnit.unitId,
              });
              break;
            }
          }
        }
      } catch (err) {
        console.error("Error fetching course data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (programId && user?.userId) {
      fetchData();
    }
  }, [programId, user?.userId]); // ✅ re-run when programId changes

  const handleSelectSubconcept = (url, id, type = "video") => {
    setCurrentContent({ url, type, id });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-[#0EA5E9] opacity-25" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#0EA5E9] border-transparent animate-spin" />
        </div>
        <p className="mt-4 text-[#0EA5E9] font-medium text-base animate-pulse tracking-wide">
          Loading your course...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block fixed left-0 top-0 h-screen w-72 z-30">
        <Sidebar
          programName={programName}
          onSelectSubconcept={handleSelectSubconcept}
          currentActiveId={currentContent.id}
          stages={stages}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-72">
        <div className="hidden md:flex flex-1 flex-col justify-center items-center p-4">
          <div className="w-full flex justify-center">
            <div
              className="relative w-full max-w-5xl rounded-xl shadow-md overflow-hidden bg-white"
              style={{ height: "85vh" }}
            >
              <ContentRenderer
                type={currentContent.type}
                url={currentContent.url}
                title="Course Content"
                className="w-full h-full"
              />
            </div>
          </div>

          <NextSubconceptButton
            stages={stages}
            currentContentId={currentContent.id}
            onSelectSubconcept={handleSelectSubconcept}
          />
        </div>

        {/* Mobile */}
        <div className="md:hidden flex flex-col h-screen">
          <div className="flex-1 bg-white overflow-hidden">
            <div className="w-full h-full p-4">
              <div className="w-full h-full rounded-xl shadow-md overflow-hidden bg-white">
                <ContentRenderer
                  type={currentContent.type}
                  url={currentContent.url}
                  title="Course Content"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
            <NextSubconceptButton
              stages={stages}
              currentContentId={currentContent.id}
              onSelectSubconcept={handleSelectSubconcept}
            />
          </div>

          <div className="w-full border-t border-gray-300 overflow-y-auto" style={{ height: "40vh" }}>
            <Sidebar
              programName={programName}
              onSelectSubconcept={handleSelectSubconcept}
              currentActiveId={currentContent.id}
              stages={stages}
            />
          </div>
        </div>

        {isSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
            <div className="fixed left-0 top-0 h-full w-80 bg-white z-50">
              <Sidebar
                programName={programName}
                onSelectSubconcept={handleSelectSubconcept}
                currentActiveId={currentContent.id}
                stages={stages}
              />
            </div>
            <div className="fixed inset-0 z-45" onClick={() => setIsSidebarOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePage;
