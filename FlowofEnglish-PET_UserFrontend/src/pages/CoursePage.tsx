// @ts-nocheck
import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import ContentRenderer from "../components/ContentRenderer";
import NextSubconceptButton from "../components/NextSubconceptButton";
import { FileUploaderRecorder } from "../components/AssignmentComponents/FileUploaderRecorder";
import AssignmentModal from "../components//modals/AssignmentModal";
import { useUserContext } from "../context/AuthContext";
import { getInitialSubconcept } from "../utils/courseProgressUtils";
import CourseContext from "../context/CourseContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

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
  const [canGoNext, setCanGoNext] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);

  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const passedCohort = location.state?.selectedCohort || null;

  const [currentContent, setCurrentContent] = useState({
    url: "",
    type: "video",
    id: "",
    stageId: "",
    unitId: "",
    subconceptId: "",
  });

  // ADDED: states for Google Form checkbox & persisted submission
  const [formChecked, setFormChecked] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Context value
  const courseContextValue = useMemo(
    () => ({
      currentContent,
      setCurrentContent,
      stages,
      setStages,
      programName,
      user,
      programId,
      canGoNext,
      setCanGoNext,
      remainingTime,
      setRemainingTime,
    }),
    [currentContent, stages, programName, user, programId]
  );

  // Helper to detect Google Form type (includes "assessment")
  const isGoogleFormType = (type: string) => {
    if (!type) return false;
    const normalized = type.toLowerCase();
    return normalized === "googleform" || normalized === "assessment";
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

    setFormChecked(false);
    setFormSubmitted(false);
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

  // Restore checkbox/submission state for google forms from localStorage
  useEffect(() => {
    try {
      if (currentContent?.subconceptId && isGoogleFormType(currentContent.type)) {
        const saved = localStorage.getItem(`submitted_${currentContent.subconceptId}`);
        if (saved === "true") {
          setFormChecked(true);
          setFormSubmitted(true);
        } else {
          setFormChecked(false);
          setFormSubmitted(false);
        }
      } else {
        setFormChecked(false);
        setFormSubmitted(false);
      }
    } catch (err) {
      // ignore
    }
  }, [currentContent.subconceptId, currentContent.type]);

  // Handlers --------------------------------------------------------------------

  const handleSubmit = () => {
    const iframe = document.getElementById("embeddedContent");
    if (iframe && iframe.tagName === "IFRAME") {
      (iframe as HTMLIFrameElement).contentWindow?.postMessage("submitClicked", "*");
    }
  };

  // Helper to record attempt for googleform via API
  const recordGoogleFormAttempt = async () => {
    try {
      if (!user?.userId || !currentContent?.subconceptId) return;
      await axios.post(`${API_BASE_URL}/user-attempt`, {
        userId: user.userId,
        subconceptId: currentContent.subconceptId,
        attemptStatus: "completed",
      });

      window.dispatchEvent(
        new CustomEvent("updateSidebarCompletion", {
          detail: { subconceptId: currentContent.subconceptId },
        })
      );

      localStorage.setItem(`submitted_${currentContent.subconceptId}`, "true");
      setFormSubmitted(true);
    } catch (err) {
      console.error("Error recording google form attempt:", err);
      throw err;
    }
  };

  // Next subconcept handler
  const handleNextSubconcept = async (nextSub) => {
    if (isGoogleFormType(currentContent.type) && (formChecked || formSubmitted)) {
      try {
        if (!formSubmitted) {
          await recordGoogleFormAttempt();
        }
      } catch (err) {
        console.error("Failed to record google form attempt before moving next:", err);
      }
    }

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
  const renderNextButton = (disabled = false) => (
    <NextSubconceptButton
      stages={stages}
      currentContentId={currentContent.id}
      onNext={handleNextSubconcept}
      disabled={disabled}
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
        type={currentContent.type}
        url={currentContent.url}
        title="Course Content"
        className="w-full h-full"
      />
    );

  const GoogleFormCheckbox =
    isGoogleFormType(currentContent.type) ? (
      <label className="flex items-center space-x-3 mb-2">
        <input
          type="checkbox"
          checked={formChecked || formSubmitted}
          disabled={formSubmitted}
          onChange={(e) => setFormChecked(e.target.checked)}
          className="w-5 h-5 text-[#0EA5E9] border-gray-300 rounded focus:ring-[#0EA5E9]"
        />
        <span className="text-gray-700">I have submitted this Google Form</span>
      </label>
    ) : null;

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
            {renderNextButton(isGoogleFormType(currentContent.type) && !formChecked && !formSubmitted)}
          </div>
        ) : (
          <div className="mt-6 flex flex-row items-center justify-center gap-3 flex-wrap">
            <FileUploaderRecorder
              assignmentStatus={assignmentStatus}
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
            {renderNextButton(isGoogleFormType(currentContent.type) && !formChecked && !formSubmitted)}
          </div>
        )
      ) : (
        <div className="mt-6 flex flex-row items-center justify-center gap-3 flex-wrap">
          {GoogleFormCheckbox}
          {renderNextButton(isGoogleFormType(currentContent.type) && !formChecked && !formSubmitted)}
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
        {/* Sidebar (Desktop fixed) */}
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
          <div
            className="bg-white border-b border-gray-200 flex justify-center items-center p-4"
            style={{
              height: window.innerWidth >= 768 ? "80vh" : "45vh",
              transition: "height 0.2s ease-in-out",
            }}
          >
            <div className="w-full max-w-5xl rounded-xl shadow-md overflow-hidden bg-white h-full">
              <ContentArea />
            </div>
          </div>

          {/* Floating Submit Button (for both desktop & mobile) */}
          {showIframe && showSubmit && (
            <div className="fixed bottom-24 right-4 z-20">
              <button
                ref={submitBtnRef}
                onClick={handleSubmit}
                className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white w-16 h-16 font-[700] text-xs rounded-full flex flex-col items-center justify-center gap-1 shadow-md"
              >
                <img src="/icons/User-icons/send.png" alt="Submit Icon" className="w-5 h-5" />
                Submit
              </button>
            </div>
          )}

          {/* Sidebar (Mobile only, below content) */}
          <div
            className="md:hidden flex-shrink-0 bg-white overflow-y-auto border-t border-gray-300"
            style={{ height: "45vh" }}
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

          {/* Desktop Control Buttons (below video) */}
          <div className="hidden md:flex justify-center mt-4">
            <ControlButtons />
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
