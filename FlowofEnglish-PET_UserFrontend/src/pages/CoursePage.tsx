// @ts-nocheck
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import ContentRenderer from "../components/ContentRenderer";
import NextSubconceptButton from "../components/NextSubconceptButton";
import { FileUploaderRecorder } from "../components/AssignmentComponents/FileUploaderRecorder";
import AssignmentModal from "../components//modals/AssignmentModal";
import { useUserContext } from "../context/AuthContext";
import { getInitialSubconcept } from "../utils/courseProgressUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Context types
interface CurrentContent {
  url: string;
  type: string;
  id: string;
  stageId: string;
  unitId: string;
  subconceptId: string;
}

interface CourseContextType {
  currentContent: CurrentContent;
  setCurrentContent: (content: CurrentContent) => void;
  stages: any[];
  programName: string;
  user: any;
  programId: string | undefined;
}

export const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const useCourseContext = (): CourseContextType => {
  const context = useContext(CourseContext);
  if (!context) throw new Error("useCourseContext must be used within a CoursePage");
  return context;
};

const CoursePage: React.FC = () => {
  // Routing and context
  const location = useLocation();
  const navigate = useNavigate();
  const { programId } = useParams();
  const { user } = useUserContext();

  // State
  const [stages, setStages] = useState<any[]>([]);
  const [programName, setProgramName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showIframe, setShowIframe] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [assignmentStatus, setAssignmentStatus] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const passedCohort = location.state?.selectedCohort || null;

  const [currentContent, setCurrentContent] = useState<CurrentContent>({
    url: "",
    type: "video",
    id: "",
    stageId: "",
    unitId: "",
    subconceptId: "",
  });

  // Context value
  const courseContextValue: CourseContextType = {
    currentContent,
    setCurrentContent,
    stages,
    programName,
    user,
    programId,
  };

  // Helpers
  const shouldShowIframe = (contentType: string) => {
    const nonIframeTypes = [
      "video",
      "audio",
      "pdf",
      "image",
      "assignment_video",
      "assignment_audio",
      "assignment_pdf",
      "assignment_image",
      "assessment",
      "youtube",
      "mtf",
      "mcq",
      "word",
      "pdfAsPpt",
    ];
    return !nonIframeTypes.includes(contentType);
  };

  // Effects ---------------------------------------------------------------------

  // Disable right-click
  useEffect(() => {
    const disableContext = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableContext);
    return () => document.removeEventListener("contextmenu", disableContext);
  }, []);

  // Set iframe visibility on content change
  useEffect(() => {
    const shouldShow = shouldShowIframe(currentContent.type);
    setShowIframe(shouldShow);
    setShowSubmit(false);
  }, [currentContent]);

  // Listen for postMessage events from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "enableSubmit") setShowSubmit(true);
      else if (event.data === "disableSubmit") setShowSubmit(false);
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Fetch program stages and initialize initial subconcept (uses util)
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

        // Use getInitialSubconcept util to pick which subconcept to open initially
        const initialSubconcept = getInitialSubconcept(stagesData);
        if (initialSubconcept) {
          const { stage, unit, sub } = initialSubconcept;
          setCurrentContent({
            url: sub.subconceptLink,
            type: sub.subconceptType,
            id: sub.subconceptId,
            stageId: stage.stageId,
            unitId: unit.unitId,
            subconceptId: sub.subconceptId,
          });
        }
      } catch (err) {
        console.error("Error fetching course data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (programId && user?.userId) fetchData();
  }, [programId, user?.userId]);

  // Save last viewed subconcept
  useEffect(() => {
    if (currentContent?.subconceptId) {
      localStorage.setItem("lastViewedSubconcept", currentContent.subconceptId);
    }
  }, [currentContent?.subconceptId]);

  // Fetch assignment status when subconcept changes
  useEffect(() => {
    const fetchAssignmentStatus = async () => {
      try {
        if (!user?.userId || !currentContent?.subconceptId) return;

        const res = await axios.get(`${API_BASE_URL}/assignments/user-assignment`, {
          params: { userId: user.userId, subconceptId: currentContent.subconceptId },
        });

        if (res.data?.status === "not_found") setAssignmentStatus(null);
        else setAssignmentStatus(res.data);
      } catch (err) {
        console.error("Error fetching assignment status:", err);
        setAssignmentStatus(null);
      }
    };

    if (currentContent?.type?.toLowerCase().startsWith("assignment")) {
      fetchAssignmentStatus();
    } else {
      setAssignmentStatus(null);
    }
  }, [currentContent?.type, currentContent?.subconceptId, user?.userId]);

  // Handlers --------------------------------------------------------------------

  const handleSubmit = () => {
    const iframe = document.getElementById("embeddedContent");
    if (iframe && iframe.tagName === "IFRAME") {
      (iframe as HTMLIFrameElement).contentWindow?.postMessage("submitClicked", "*");
    }
  };

  const handleUserAttempt = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      const { cohortId } = passedCohort || {};
      const { stageId, unitId, subconceptId } = currentContent;

      if (!sessionId || !cohortId || !programId || !user?.userId) return;

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

      // Update local progress instantly after successful API
      setStages((prevStages) =>
        prevStages.map((stage) => ({
          ...stage,
          units: stage.units.map((unit) => ({
            ...unit,
            subconcepts: unit.subconcepts.map((sub) =>
              sub.subconceptId === subconceptId
                ? { ...sub, completionStatus: "yes" }
                : sub
            ),
          })),
        }))
      );
    } catch (err) {
      console.error("Error posting user-attempt:", err);
    }
  };

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

  // Render helpers --------------------------------------------------------------

  const renderNextButton = () => (
    <NextSubconceptButton
      stages={stages}
      currentContentId={currentContent.id}
      onNext={handleNextSubconcept}
    />
  );

  const ContentArea = () =>
    showIframe ? (
      <iframe
        id="embeddedContent"
        src={currentContent.url}
        title="Embedded Content"
        className="w-full h-full"
        allow="autoplay"
      />
    ) : (
      <ContentRenderer
        key={currentContent.id || currentContent.url}
        type={currentContent.type}
        url={currentContent.url}
        title="Course Content"
        className="w-full h-full"
      />
    );

  const ControlButtons = () => (
    <>
      {showIframe && showSubmit && (
        <div className="mt-4">
          <button
            ref={submitBtnRef}
            onClick={handleSubmit}
            className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white px-6 py-3 font-[700] text-base rounded-full flex items-center justify-center gap-2"
          >
            <img src="/icons/User-icons/send.png" alt="Submit Icon" className="w-5 h-5" />
            Submit
          </button>
        </div>
      )}

      {currentContent.type?.toLowerCase().startsWith("assignment") ? (
        assignmentStatus ? (
          <div className="mt-6 flex flex-row items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              View Assignment Status
            </button>
            {renderNextButton()}
          </div>
        ) : (
          <div className="mt-6 flex flex-row items-center justify-center gap-3 flex-wrap">
            <FileUploaderRecorder
              onSuccess={() =>
                setStages((prevStages) =>
                  prevStages.map((stage) => ({
                    ...stage,
                    units: stage.units.map((unit) => ({
                      ...unit,
                      subconcepts: unit.subconcepts.map((sub) =>
                        sub.subconceptId === currentContent.subconceptId
                          ? { ...sub, completionStatus: "yes" }
                          : sub
                      ),
                    })),
                  }))
                )
              }
            />
            {renderNextButton()}
          </div>
        )
      ) : (
        <div className="mt-6 flex flex-row items-center justify-center gap-3 flex-wrap">
          {renderNextButton()}
        </div>
      )}
    </>
  );

  // Loader ----------------------------------------------------------------------

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

  // Final Render ---------------------------------------------------------------

  return (
    <CourseContext.Provider value={courseContextValue}>
      <div className="flex flex-col md:flex-row h-screen bg-white overflow-hidden">
        {/* Desktop Sidebar */}
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
                subconceptId: subconceptId || currentContent.subconceptId,
              })
            }
            currentActiveId={currentContent.id}
            stages={stages}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:ml-72">
          {/* Desktop */}
          <div className="hidden md:flex flex-1 flex-col justify-center items-center p-4">
            <div className="w-full flex justify-center">
              <div
                className="relative w-full max-w-5xl rounded-xl shadow-md overflow-hidden bg-white"
                style={{ height: "80vh" }}
              >
                <div key={currentContent.id || currentContent.url} className="h-full w-full">
                  <ContentArea />
                </div>
              </div>
            </div>
            <ControlButtons />
          </div>

          {/* Mobile (45% content, 55% sidebar) */}
{/* Mobile layout - fixed vh heights for precision */}
<div className="md:hidden flex flex-col h-screen">
  {/* Top 45% - Content Renderer */}
  <div className="h-[45vh] flex-shrink-0 bg-white border-b border-gray-200">
    <div className="p-4 h-full">
      <div className="w-full h-full rounded-xl shadow-md overflow-hidden bg-white">
        <ContentArea />
      </div>
    </div>

    {/* Floating Submit Button */}
    {showIframe && showSubmit && (
      <div className="fixed bottom-24 right-4 z-20">
        <button
          ref={submitBtnRef}
          onClick={handleSubmit}
          className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white w-16 h-16 font-[700] text-xs rounded-full flex flex-col items-center justify-center gap-1"
        >
          <img src="/icons/User-icons/send.png" alt="Submit Icon" className="w-5 h-5" />
          Submit
        </button>
      </div>
    )}

    {/* Floating Next Button */}
    <div className="fixed bottom-4 right-4 z-20">{renderNextButton()}</div>
  </div>

  {/* Bottom 55% - Sidebar */}
  <div className="h-[55vh] overflow-y-auto bg-white">
    <Sidebar
      programName={programName}
      onSelectSubconcept={(url, type, id, stageId, unitId, subconceptId) =>
        setCurrentContent({
          url,
          type,
          id,
          stageId: stageId || currentContent.stageId,
          unitId: unitId || currentContent.unitId,
          subconceptId: subconceptId || currentContent.subconceptId,
        })
      }
      currentActiveId={currentContent.id}
      stages={stages}
    />
  </div>
</div>

        </div>
      </div>

      {showAssignmentModal && (
        <AssignmentModal
          onClose={() => setShowAssignmentModal(false)}
          submissionDate={assignmentStatus?.submittedDate}
          status={assignmentStatus?.status}
          fileUrl={assignmentStatus?.submittedFile?.downloadUrl}
        />
      )}
    </CourseContext.Provider>
  );
};

export default CoursePage;
