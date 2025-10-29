import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ContentRenderer from "../components/ContentRenderer";
import axios from "axios";

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const CoursePage: React.FC = () => {
  const [currentContent, setCurrentContent] = useState<{url: string; type: string; id: string}>({
    url: "",
    type: "video",
    id: ""
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE_URL}/programconceptsmappings/Swapna05/program/PET-Level-2/complete`
        );
        const stagesData = res.data.stages || [];
        setStages(stagesData);

        // auto-play first content
        for (const stage of stagesData) {
          if (stage.units?.length) {
            const firstUnit = stage.units[0];
            if (firstUnit.subconcepts?.length) {
              const firstSubconcept = firstUnit.subconcepts[0];
              setCurrentContent({
                url: firstSubconcept.subconceptLink,
                type: firstSubconcept.subconceptType,
                id: firstSubconcept.subconceptId
              });
              break;
            }
            if (firstUnit.unitLink) {
              setCurrentContent({
                url: firstUnit.unitLink,
                type: "video", // default type for unit links
                id: firstUnit.unitId
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
    fetchData();
  }, []);

  const handleSelectSubconcept = (url: string, id: string, type: string = "video") => {
    console.log("Selected content:", { url, id, type }); // Debug log
    setCurrentContent({
      url,
      type,
      id
    });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
      {/* Desktop sidebar - fixed positioning */}
      <div className="hidden md:block fixed left-0 top-0 h-screen w-72 z-30">
        <Sidebar 
          onSelectSubconcept={handleSelectSubconcept} 
          currentActiveId={currentContent.id}
          stages={stages}
        />
      </div>

      {/* Main content - with proper margin for fixed sidebar */}
      <div className="flex-1 flex flex-col md:ml-72">
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Desktop Layout */}
        <div className="hidden md:flex flex-1 flex-col justify-center items-center p-4 mt-14">
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
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col h-screen pt-14">
          {/* Content Container - Takes all available space above sidebar */}
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

          {/* Sidebar Container - Fixed height of 40vh */}
          <div 
            className="w-full border-t border-gray-300 overflow-y-auto"
            style={{ height: "40vh" }}
          >
            <Sidebar 
              onSelectSubconcept={handleSelectSubconcept} 
              currentActiveId={currentContent.id}
              stages={stages}
            />
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
            <div className="fixed left-0 top-0 h-full w-80 bg-white z-50">
              <Sidebar 
                onSelectSubconcept={handleSelectSubconcept} 
                currentActiveId={currentContent.id}
                stages={stages}
              />
            </div>
            <div 
              className="fixed inset-0 z-45" 
              onClick={() => setIsSidebarOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePage;