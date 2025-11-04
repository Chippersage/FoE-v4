// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ContentRenderer from "../components/ContentRenderer";
import NextSubconceptButton from "../components/NextSubconceptButton";
import { FileUploaderRecorder } from "../components/AssignmentComponents/FileUploaderRecorder";
import axios from "axios";
import { useUserContext } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const CoursePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { programId } = useParams();
  const passedCohort = location.state?.selectedCohort || null;
  const { user, selectedCohort, setSelectedCohort } = useUserContext();

  const [currentContent, setCurrentContent] = useState({
    url: "",
    type: "video",
    id: "",
    stageId: "",
    unitId: "",
    subconceptId: "",
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stages, setStages] = useState([]);
  const [programName, setProgramName] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Iframe states
  const [showIframe, setShowIframe] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const submitBtnRef = useRef(null);

  // Determine if content should be shown in iframe
  const shouldShowIframe = (contentType: string) => {
    const nonIframeTypes = [
      "video", "audio", "pdf", "image", 
      "assignment_video", "assignment_audio", "assignment_pdf", "assignment_image",
      "assessment", "youtube", "mtf", "mcq", "word", "pdfAsPpt"
    ];
    return !nonIframeTypes.includes(contentType);
  };

  // Reset iframe states when content changes
  useEffect(() => {
    const shouldShow = shouldShowIframe(currentContent.type);
    setShowIframe(shouldShow);
    setShowSubmit(false); // Reset submit state for new content
  }, [currentContent]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
                stageId: stage.stageId,
                unitId: firstUnit.unitId,
                subconceptId: firstSubconcept.subconceptId,
              });
              break;
            }
            if (firstUnit.unitLink) {
              setCurrentContent({
                url: firstUnit.unitLink,
                type: "video",
                id: firstUnit.unitId,
                stageId: stage.stageId,
                unitId: firstUnit.unitId,
                subconceptId: firstUnit.unitId,
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
  }, [programId, user?.userId]);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "enableSubmit") {
        setShowSubmit(true);
      } else if (event.data === "disableSubmit") {
        setShowSubmit(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleSubmit = () => {
    const iframe = document.getElementById("embeddedContent");
    if (iframe && iframe.tagName === "IFRAME") {
      (iframe as HTMLIFrameElement).contentWindow?.postMessage("submitClicked", "*");
    }
  };

  // ✅ Handle next subconcept navigation + API call
  const handleNextSubconcept = async (nextSub) => {
    await handleUserAttempt();

    setCurrentContent({
      url: nextSub.subconceptLink,
      type: nextSub.subconceptType,
      id: nextSub.subconceptId,
      stageId: nextSub.stageId,
      unitId: nextSub.unitId,
      subconceptId: nextSub.subconceptId,
    });
  };

  // Function to handle user-attempt post using current content
  const handleUserAttempt = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      const { cohortId, programId } = selectedCohort || {};
      const { stageId, unitId, subconceptId } = currentContent;

      if (!sessionId || !cohortId || !programId || !user?.userId) {
        console.warn("Missing data for user-attempt post");
        return;
      }

      const payload = {
        cohortId,
        programId,
        sessionId,
        stageId,
        unitId,
        subconceptId,
        userId: user.userId,
        userAttemptStartTimestamp: new Date().toISOString(),
        userAttemptEndTimestamp: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
        userAttemptFlag: true,
        userAttemptScore: 2,
      };

      await axios.post(`${API_BASE_URL}/user-attempts`, payload);
    } catch (err) {
      console.error("Error posting user-attempt:", err);
    }
  };

  const renderContent = () => {
    if (showIframe) {
      return (
        <iframe
          id="embeddedContent"
          src={currentContent.url}
          title="Embedded Content"
          className="w-full h-full"
          allow="autoplay"
        />
      );
    } else {
      return (
        <ContentRenderer
          type={currentContent.type}
          url={currentContent.url}
          title="Course Content"
          className="w-full h-full"
        />
      );
    }
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
          onSelectSubconcept={(url, type, id, stageId, unitId, subconceptId) =>
            setCurrentContent({ 
              url, 
              type, 
              id,
              stageId: stageId || currentContent.stageId,
              unitId: unitId || currentContent.unitId,
              subconceptId: subconceptId || currentContent.subconceptId
            })
          }
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
              style={{ height: "80vh" }}
            >
              {renderContent()}
            </div>
          </div>

          {/* Submit Button for iframe content */}
          {showIframe && showSubmit && (
            <div className="mt-4">
              <button
                ref={submitBtnRef}
                onClick={handleSubmit}
                className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white px-6 py-3 font-[700] text-base rounded-full flex items-center justify-center gap-2"
              >
                <img
                  src="/icons/User-icons/send.png"
                  alt="Submit Icon"
                  className="w-5 h-5"
                />
                Submit
              </button>
            </div>
          )}

          console.log("Current content type:", currentContent.type);
          console.log("Is assignment:", currentContent.type?.toLowerCase().startsWith("assignment"));

          {/* Assignment or Next Button */}
          {currentContent.type?.toLowerCase().startsWith("assignment") ? (
            <div className="mt-4 w-full max-w-3xl flex flex-row items-center justify-around gap-4">
              <FileUploaderRecorder
                currentContent={currentContent}
                user={user}
                onSuccess={() => console.log("Assignment upload success")}
              />
              <NextSubconceptButton
                stages={stages}
                currentContentId={currentContent.id}
                onNext={handleNextSubconcept}
              />
            </div>
          ) : (
            <NextSubconceptButton
              stages={stages}
              currentContentId={currentContent.id}
              onNext={handleNextSubconcept}
            />
          )}
        </div>

        {/* Mobile version */}
        <div className="md:hidden flex flex-col h-screen">
          <div className="flex-1 bg-white overflow-hidden">
            <div className="w-full h-full p-4">
              <div className="w-full h-full rounded-xl shadow-md overflow-hidden bg-white">
                {renderContent()}
              </div>
            </div>
          </div>

          {/* Mobile Submit Button for iframe content */}
          {showIframe && showSubmit && (
            <div className="fixed bottom-4 right-4 z-20">
              <button
                ref={submitBtnRef}
                onClick={handleSubmit}
                className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white w-16 h-16 font-[700] text-xs rounded-full flex flex-col items-center justify-center gap-1"
              >
                <img
                  src="/icons/User-icons/send.png"
                  alt="Submit Icon"
                  className="w-5 h-5"
                />
                Submit
              </button>
            </div>
          )}

          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
            <NextSubconceptButton
              stages={stages}
              currentContentId={currentContent.id}
              onNext={handleNextSubconcept}
            />
          </div>

          <div
            className="w-full border-t border-gray-300 overflow-y-auto"
            style={{ height: "40vh" }}
          >
            <Sidebar
              programName={programName}
              onSelectSubconcept={(url, type, id, stageId, unitId, subconceptId) =>
                setCurrentContent({ 
                  url, 
                  type, 
                  id,
                  stageId: stageId || currentContent.stageId,
                  unitId: unitId || currentContent.unitId,
                  subconceptId: subconceptId || currentContent.subconceptId
                })
              }
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
                onSelectSubconcept={(url, type, id, stageId, unitId, subconceptId) =>
                  setCurrentContent({ 
                    url, 
                    type, 
                    id,
                    stageId: stageId || currentContent.stageId,
                    unitId: unitId || currentContent.unitId,
                    subconceptId: subconceptId || currentContent.subconceptId
                  })
                }
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