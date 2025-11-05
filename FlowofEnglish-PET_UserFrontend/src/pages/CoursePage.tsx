// @ts-nocheck
import { useState, useEffect, useRef, createContext, useContext, ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ContentRenderer from "../components/ContentRenderer";
import NextSubconceptButton from "../components/NextSubconceptButton";
import { FileUploaderRecorder } from "../components/AssignmentComponents/FileUploaderRecorder";
import AssignmentModal from "../components//modals/AssignmentModal";
import axios from "axios";
import { useUserContext } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

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
  selectedCohort: any;
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
  const location = useLocation();
  const navigate = useNavigate();
  const { programId } = useParams();
  const passedCohort = location.state?.selectedCohort || null;
  const { user, selectedCohort, setSelectedCohort } = useUserContext();

  const [currentContent, setCurrentContent] = useState<CurrentContent>({
    url: "",
    type: "video",
    id: "",
    stageId: "",
    unitId: "",
    subconceptId: "",
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stages, setStages] = useState<any[]>([]);
  const [programName, setProgramName] = useState("");
  const [loading, setLoading] = useState(true);

  const [showIframe, setShowIframe] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const [assignmentStatus, setAssignmentStatus] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const courseContextValue: CourseContextType = {
    currentContent,
    setCurrentContent,
    stages,
    programName,
    selectedCohort,
    user,
    programId,
  };

  const shouldShowIframe = (contentType: string) => {
    const nonIframeTypes = [
      "video", "audio", "pdf", "image",
      "assignment_video", "assignment_audio", "assignment_pdf", "assignment_image",
      "assessment", "youtube", "mtf", "mcq", "word", "pdfAsPpt",
    ];
    return !nonIframeTypes.includes(contentType);
  };

  useEffect(() => {
    const shouldShow = shouldShowIframe(currentContent.type);
    setShowIframe(shouldShow);
    setShowSubmit(false);
  }, [currentContent]);

  // Fetch assignment status (non-blocking)
  useEffect(() => {
    const fetchAssignmentStatus = async () => {
      try {
        if (!user?.userId || !currentContent?.subconceptId) return;

        const res = await axios.get(`${API_BASE_URL}/assignments/user-assignment`, {
          params: {
            userId: user.userId,
            subconceptId: currentContent.subconceptId,
          },
        });

        if (res.data?.status === "not_found") setAssignmentStatus(null);
        else setAssignmentStatus(res.data);
      } catch (err) {
        console.error("Error fetching assignment status:", err);
        setAssignmentStatus(null);
      }
    };

    // ✅ Fetch only when type starts with "assignment"
    if (currentContent?.type?.toLowerCase().startsWith("assignment")) {
      fetchAssignmentStatus();
    } else {
      setAssignmentStatus(null);
    }
  }, [currentContent?.type, currentContent?.subconceptId, user?.userId]);


  // Fetch course data
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

        const baseCohort = passedCohort || selectedCohort || null;
        if (baseCohort) {
          setSelectedCohort({
            ...baseCohort,
            programName: data.programName || baseCohort.programName || "Program",
            programId: programId,
          });
        }

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
          }
        }
      } catch (err) {
        console.error("Error fetching course data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (programId && user?.userId) fetchData();
  }, [programId, user?.userId]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "enableSubmit") setShowSubmit(true);
      else if (event.data === "disableSubmit") setShowSubmit(false);
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

  const handleUserAttempt = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      const { cohortId, programId } = selectedCohort || {};
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
    } catch (err) {
      console.error("Error posting user-attempt:", err);
    }
  };

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
              View Assignment
            </button>

            <NextSubconceptButton
              stages={stages}
              currentContentId={currentContent.id}
              onNext={handleNextSubconcept}
            />
          </div>
        ) : (
          <div className="mt-6 flex flex-row items-center justify-center gap-3 flex-wrap">
            <FileUploaderRecorder onSuccess={() => console.log("Assignment upload success")} />

            <NextSubconceptButton
              stages={stages}
              currentContentId={currentContent.id}
              onNext={handleNextSubconcept}
            />
          </div>
        )
      ) : (
        <div className="mt-6 flex flex-row items-center justify-center gap-3 flex-wrap">
        <NextSubconceptButton
          stages={stages}
          currentContentId={currentContent.id}
          onNext={handleNextSubconcept}
        />
        </div>
      )}
    </>
  );

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
    <CourseContext.Provider value={courseContextValue}>
      <div className="flex flex-col md:flex-row h-screen bg-white overflow-hidden">
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

        <div className="flex-1 flex flex-col md:ml-72">
          <div className="hidden md:flex flex-1 flex-col justify-center items-center p-4">
            <div className="w-full flex justify-center">
              <div
                className="relative w-full max-w-5xl rounded-xl shadow-md overflow-hidden bg-white"
                style={{ height: "80vh" }}
              >
                <ContentArea />
              </div>
            </div>
            <ControlButtons />
          </div>

          {/* Mobile layout */}
          <div className="md:hidden flex flex-col h-screen">
            <div className="flex-1 bg-white overflow-hidden" style={{ flex: "0 0 60%" }}>
              <div className="w-full h-full p-4">
                <div className="w-full h-full rounded-xl shadow-md overflow-hidden bg-white">
                  <ContentArea />
                </div>
              </div>

              {showIframe && showSubmit && (
                <div className="fixed bottom-24 right-4 z-20">
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
            </div>

            <div
              className="w-full border-t border-gray-300 overflow-y-auto bg-white"
              style={{ flex: "0 0 40%" }}
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
                    subconceptId: subconceptId || currentContent.subconceptId,
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
                      subconceptId: subconceptId || currentContent.subconceptId,
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
