// @ts-nocheck
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
import GoogleFormControl from "../components/GoogleFormControl";
import { ChevronRight } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const CoursePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { programId } = useParams();
  const { user } = useUserContext();

  const [stages, setStages] = useState<any[]>([]);
  const [programName, setProgramName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showIframe, setShowIframe] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [assignmentStatus, setAssignmentStatus] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [canGoNext, setCanGoNext] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);
  const [iframeScore, setIframeScore] = useState<number | null>(null);
  const [iframeAttemptRecorded, setIframeAttemptRecorded] = useState(false);
  const [isNextEnabled, setIsNextEnabled] = useState(false);

  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [currentContent, setCurrentContent] = useState({
    url: "",
    type: "video",
    id: "",
    stageId: "",
    unitId: "",
    subconceptId: "",
    subconceptMaxscore: 0,
    completionStatus: "",
  });

  // Create a custom hook that can be used after context is available
  const useRecordAttempt = () => {
    // This will be called later, when we actually need to record
    const recordAttempt = useCallback(async (score?: number) => {
      try {
        if (!user?.userId || !currentContent?.subconceptId) return null;

        // Get cohortId from user context or localStorage
        const selectedCohortRaw = localStorage.getItem("selectedCohort");
        const selectedCohort = selectedCohortRaw
          ? JSON.parse(selectedCohortRaw)
          : null;
        const cohortId = selectedCohort?.cohortId || "";
        const sessionId = localStorage.getItem("sessionId") || "";

        // Validate essential fields
        if (!sessionId || !cohortId || !programId || !user?.userId) return;

        // ✅ Send the raw score as-is (e.g., 1, 2, 3)
        const userAttemptScore = score || 0;

        console.log("Recording attempt with raw score:", userAttemptScore);

        // Build API payload
        const payload = {
          cohortId,
          programId,
          sessionId,
          stageId: currentContent.stageId || "",
          unitId: currentContent.unitId || "",
          subconceptId: currentContent.subconceptId,
          userId: user.userId,
          userAttemptStartTimestamp: new Date().toISOString(),
          userAttemptEndTimestamp: new Date().toISOString(),
          userAttemptFlag: true,
          userAttemptScore: userAttemptScore, // Raw score (e.g., 1, 2, 3)
        };

        console.log("Sending user attempt payload:", payload);

        const response = await axios.post(
          `${API_BASE_URL}/user-attempts`,
          payload
        );

        console.log("User attempt recorded successfully:", response.data);
        
        return response.data;
      } catch (err) {
        console.error("Error recording user attempt:", err);
        throw err;
      }
    }, [user, currentContent, programId]);

    return { recordAttempt };
  };

  // Initialize the record function
  const { recordAttempt } = useRecordAttempt();

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
      iframeScore,
      setIframeScore,
      iframeAttemptRecorded,
      setIframeAttemptRecorded,
      isNextEnabled,
      setIsNextEnabled,
    }),
    [currentContent, stages, programName, user, programId, canGoNext, remainingTime, iframeScore, iframeAttemptRecorded, isNextEnabled]
  );

  // ---------------------------
  // Helper functions
  // ---------------------------
  const isGoogleFormType = (type: string) => {
    if (!type) return false;
    const normalized = String(type).toLowerCase();
    return normalized === "googleform" || normalized === "assessment";
  };

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

  // ---------------------------
  // Assignment status handling
  // ---------------------------
  const fetchAssignmentStatus = useCallback(async () => {
    try {
      if (!user?.userId || !currentContent?.subconceptId) return;

      const res = await axios.get(`${API_BASE_URL}/assignments/user-assignment`, {
        params: { userId: user.userId, subconceptId: currentContent.subconceptId },
      });

      if (res.data?.status === "not_found") {
        setAssignmentStatus(null);
      } else {
        setAssignmentStatus(res.data);
      }
    } catch (err) {
      console.error("Error fetching assignment status:", err);
      setAssignmentStatus(null);
    }
  }, [user?.userId, currentContent?.subconceptId]);

  const handleAssignmentSubmissionSuccess = useCallback(() => {
    // Update completion status in local state
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
    );
    
    // Update current content completion status
    setCurrentContent(prev => ({
      ...prev,
      completionStatus: "yes"
    }));
    
    // Fetch the latest assignment status after a short delay
    setTimeout(() => {
      fetchAssignmentStatus();
    }, 1500);
  }, [currentContent.subconceptId, fetchAssignmentStatus]);

  // ---------------------------
  // Event handlers
  // ---------------------------
  const handleSubmit = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.tagName === "IFRAME") {
      console.log("Sending submitClicked to iframe");
      iframe.contentWindow?.postMessage("submitClicked", "*");
    }
  };

  const handleNextSubconcept = async (nextSub) => {
    setCurrentContent({
      url: nextSub.subconceptLink,
      type: nextSub.subconceptType,
      id: nextSub.subconceptId,
      stageId: nextSub.stageId,
      unitId: nextSub.unitId,
      subconceptId: nextSub.subconceptId,
      completionStatus: nextSub.completionStatus,
      subconceptMaxscore: Number(nextSub.subconceptMaxscore || 0),
    });
    // Reset iframe state when moving to new content
    setIframeScore(null);
    setIframeAttemptRecorded(false);
    setShowSubmit(false);
    setIsNextEnabled(false);
  };

  const renderNextButton = (disabled = false) => (
    <NextSubconceptButton
      stages={stages}
      currentContentId={currentContent.id}
      onNext={handleNextSubconcept}
      disabled={disabled}
    />
  );

  // ---------------------------
  // useEffect for event listeners
  // ---------------------------
  useEffect(() => {
    const disableContext = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableContext);
    return () => document.removeEventListener("contextmenu", disableContext);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("Received message from iframe:", event.data);
      
      if (event.data === "enableSubmit" && !showSubmit) {
        console.log("Message received: enableSubmit");
        setShowSubmit(true);
        setIsNextEnabled(false); // Disable Next button when submit appears
      } else if (event.data === "disableSubmit" && showSubmit) {
        console.log("Message received: disableSubmit");
        setShowSubmit(false);
      } else if (event.data === "confirmSubmission") {
        console.log("Iframe confirmed submission");
        // Handle case where HTML shows popup but doesn't return score
        // If we get confirmation but no score data, use subconceptMaxscore
        if (!iframeAttemptRecorded && iframeScore === null) {
          console.log("HTML confirmed but no score sent, using subconceptMaxscore as raw score");
          const fallbackScore = currentContent.subconceptMaxscore || 1; // Use as raw score
          console.log(`Using fallback raw score: ${fallbackScore}`);
          
          recordAttempt(fallbackScore)
            .then(() => {
              setIframeAttemptRecorded(true);
              setShowSubmit(false);
              setIsNextEnabled(true);
              
              // Update completion status locally
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
              );
              
              setCurrentContent(prev => ({
                ...prev,
                completionStatus: "yes"
              }));

              window.dispatchEvent(
                new CustomEvent("updateSidebarCompletion", {
                  detail: { subconceptId: currentContent.subconceptId },
                })
              );
            })
            .catch(err => {
              console.error("Error recording fallback attempt:", err);
              setIsNextEnabled(false);
            });
        }
      } else if (typeof event.data === "object" && event.data.type === "scoreData") {
        // Handle score sent from iframe
        console.log("Received scoreData from iframe:", event.data.payload);
        const rawScore = event.data.payload.userAttemptScore;
        setIframeScore(rawScore);
        
        // ✅ Send raw score directly (e.g., 1, 2, 3) - NO percentage calculation
        console.log(`Sending raw score to API: ${rawScore}`);
        
        // Record attempt with the raw score
        if (!iframeAttemptRecorded) {
          recordAttempt(rawScore)
            .then(() => {
              setIframeAttemptRecorded(true);
              setShowSubmit(false);
              setIsNextEnabled(true);
              
              // Notify iframe that recording was successful
              const iframe = iframeRef.current;
              if (iframe) {
                iframe.contentWindow?.postMessage("postSuccess", "*");
              }
              
              // Update completion status locally
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
              );
              
              setCurrentContent(prev => ({
                ...prev,
                completionStatus: "yes"
              }));

              window.dispatchEvent(
                new CustomEvent("updateSidebarCompletion", {
                  detail: { subconceptId: currentContent.subconceptId },
                })
              );
            })
            .catch(err => {
              console.error("Error recording iframe score attempt:", err);
              setIsNextEnabled(false);
            });
        }
      }
    };
    
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [showSubmit, iframeScore, iframeAttemptRecorded, currentContent, recordAttempt]);

  useEffect(() => {
    const unlock = () => {
      const locked = document.getElementById("btn-locked");
      const unlocked = document.getElementById("btn-unlocked");

      if (locked && unlocked) {
        locked.style.display = "none";
        unlocked.style.display = "block";
      }

      const mobileBtn = document.getElementById("mobile-next-btn");
      if (mobileBtn) {
        mobileBtn.style.opacity = "1";
        mobileBtn.style.pointerEvents = "auto";
        mobileBtn.style.backgroundColor = "#0EA5E9";
      }
    };

    window.addEventListener("video90", unlock);
    return () => window.removeEventListener("video90", unlock);
  }, []);

  // ---------------------------
  // useEffect for content and UI state
  // ---------------------------
  // FIXED: Only update showIframe when content type changes, not on every content change
  useEffect(() => {
    const shouldShow = shouldShowIframe(currentContent.type);
    console.log("Content type changed:", currentContent.type, "shouldShowIframe:", shouldShow);
    
    // Only update if the value actually changes
    setShowIframe(prev => {
      if (prev !== shouldShow) {
        return shouldShow;
      }
      return prev;
    });
    
    // Always reset submit button when content type changes
    setShowSubmit(false);
    // Reset iframe state when content type changes
    setIframeScore(null);
    setIframeAttemptRecorded(false);
    setIsNextEnabled(false);
  }, [currentContent.type]); // Only depend on type, not URL or ID

  // Debug logging for current content changes
  useEffect(() => {
    console.log("CurrentContent changed:", {
      id: currentContent.id,
      url: currentContent.url,
      type: currentContent.type,
      subconceptId: currentContent.subconceptId,
      subconceptMaxscore: currentContent.subconceptMaxscore
    });
  }, [currentContent]);

  // Reset mobile button when new content loads
  useEffect(() => {
    const mobileBtn = document.getElementById("mobile-next-btn");

    if (!mobileBtn) return;

    const type = String(currentContent.type).toLowerCase();

    if (type === "video") {
      mobileBtn.style.opacity = "0.5";
      mobileBtn.style.pointerEvents = "none";
      mobileBtn.style.backgroundColor = "#bfbfbf";
    } else {
      mobileBtn.style.opacity = "1";
      mobileBtn.style.pointerEvents = "auto";
      mobileBtn.style.backgroundColor = "#0EA5E9";
    }
  }, [currentContent.id]);

  // ---------------------------
  // useEffect for data fetching
  // ---------------------------
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
            subconceptMaxscore: Number(sub.subconceptMaxscore || 0),
            completionStatus: sub.completionStatus,
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

  useEffect(() => {
    if (currentContent?.subconceptId) {
      localStorage.setItem("lastViewedSubconcept", currentContent.subconceptId);
    }
  }, [currentContent?.subconceptId]);

  // Fetch assignment status when assignment content is loaded
  useEffect(() => {
    if (currentContent?.type?.toLowerCase().startsWith("assignment")) {
      fetchAssignmentStatus();
    } else {
      setAssignmentStatus(null);
    }
  }, [currentContent?.type, currentContent?.subconceptId, user?.userId, fetchAssignmentStatus]);

  // ---------------------------
  // Component rendering functions
  // ---------------------------
  // FIXED: Memoized ContentArea to prevent unnecessary re-renders
  const ContentArea = useMemo(() => {
    const Component = () => {
      const isAssessment = String(currentContent.type).toLowerCase() === "assessment";
      const isCompleted = String(currentContent.completionStatus).toLowerCase() === "yes";
      const isLockedGoogleForm = isAssessment && isCompleted;

      console.log("ContentArea rendering:", {
        showIframe,
        type: currentContent.type,
        isLockedGoogleForm,
        url: currentContent.url
      });

      if (showIframe) {
        if (isLockedGoogleForm) {
          return (
            <div className="w-full h-full flex items-center justify-center text-gray-700 font-medium">
              You have already submitted this form.
            </div>
          );
        }

        return (
          <iframe
            ref={iframeRef}
            id="embeddedContent"
            src={currentContent.url}
            title="Embedded Content"
            className="w-full h-full"
            allow="autoplay"
            key={`iframe-${currentContent.subconceptId}`} // Unique key prevents re-mounting
          />
        );
      }

      return (
        <div className="relative w-full h-full">
          <ContentRenderer
            type={currentContent.type}
            url={currentContent.url}
            title="Course Content"
            className="w-full h-full"
            key={`renderer-${currentContent.subconceptId}`} // Important: Add key
          />

          {isLockedGoogleForm && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center text-gray-700 font-medium">
              You have already submitted this form.
            </div>
          )}
        </div>
      );
    };
    return Component;
  }, [currentContent.type, currentContent.url, currentContent.subconceptId, currentContent.completionStatus, showIframe]);

  const ControlButtons = () => {
    // Render different button layouts based on content type
    const isAssignment = currentContent.type?.toLowerCase().startsWith("assignment");
    const isGoogleForm = isGoogleFormType(currentContent.type);
    const isVideo = currentContent.type?.toLowerCase() === "video";
    const isOtherContent = !isAssignment && !isGoogleForm && !isVideo && !showIframe;
    const isIframeContent = showIframe;

    // Common button container styling
    const buttonContainerClass = "mt-6 flex flex-row items-center justify-center gap-3 flex-wrap";

    if (isAssignment) {
      return (
        <div className={buttonContainerClass}>
          {assignmentStatus ? (
            <>
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                style={{ height: "38px" }}
              >
                View Assignment Status
              </button>
              {renderNextButton()}
            </>
          ) : (
            <>
              <FileUploaderRecorder
                assignmentStatus={assignmentStatus}
                onUploadSuccess={handleAssignmentSubmissionSuccess}
              />
              {renderNextButton()}
            </>
          )}
        </div>
      );
    }

    if (isGoogleForm) {
      return (
        <div className={buttonContainerClass}>
          <GoogleFormControl
            onNext={handleNextSubconcept}
            completionStatus={currentContent.completionStatus}
            subconceptType={currentContent.type}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className={buttonContainerClass}>
          <div id="btn-locked">
            {renderNextButton(true)}
          </div>
          <div id="btn-unlocked" style={{ display: "none" }}>
            {renderNextButton(false)}
          </div>
        </div>
      );
    }

    if (isOtherContent) {
      return (
        <div className={buttonContainerClass}>
          {renderNextButton(false)}
        </div>
      );
    }

    // Handle iframe content (HTML, etc.) - This is where submit button should appear
    if (isIframeContent) {
      return (
        <div className={buttonContainerClass}>
          {showSubmit && !iframeAttemptRecorded && (
            <button
              ref={submitBtnRef}
              onClick={handleSubmit}
              className="bg-[#0EA5E9] hover:bg-[#DB5788] text-white px-6 py-2 text-sm font-medium rounded-md flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
              style={{
                minWidth: "120px",
                height: "38px"
              }}
            >
              Submit
            </button>
          )}
          
          {/* Show status if attempt already recorded */}
          {iframeAttemptRecorded && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Submitted {iframeScore !== null ? `(Score: ${iframeScore})` : ''}
            </div>
          )}
          
          {/* Always show Next button for iframe content */}
          {renderNextButton(isNextEnabled ? false : true)}
        </div>
      );
    }

    // Fallback - should never reach here
    return null;
  };

  // ---------------------------
  // Mobile components
  // ---------------------------
  const mobileActionsExist =
    currentContent.type?.startsWith("assignment") ||
    isGoogleFormType(currentContent.type);

  const MobileActionBar = () => {
    if (!mobileActionsExist) return null;

    return (
      <div className="md:hidden w-full bg-white px-4 py-3 flex flex-col gap-3">
        {currentContent.type?.startsWith("assignment") ? (
          assignmentStatus ? (
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white px-4 py-2 rounded-md text-sm font-medium shadow"
              style={{ height: "38px" }}
            >
              View Assignment Status
            </button>
          ) : (
            <FileUploaderRecorder
              assignmentStatus={assignmentStatus}
              onUploadSuccess={handleAssignmentSubmissionSuccess}
            />
          )
        ) : null}

        {isGoogleFormType(currentContent.type) && (
          <GoogleFormControl
            onNext={handleNextSubconcept}
            completionStatus={currentContent.completionStatus}
            subconceptType={currentContent.type}
          />
        )}
      </div>
    );
  };

  const FloatingNextButton = () => {
    const nextExists = stages?.length > 0;

    if (!nextExists) return null;
    return (
      <button
        id="mobile-next-btn"
        className="md:hidden fixed bottom-10 right-10 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition active:scale-95 cursor-pointer"
        style={{
          backgroundColor: "#bfbfbf",
          opacity: 0.5,
          pointerEvents: "none"
        }}
        onClick={() => {
          let unlockedBtn =
            document.getElementById("next-subconcept-btn-unlocked") ||
            document.querySelector("#btn-unlocked #next-subconcept-btn");

          if (unlockedBtn) {
            unlockedBtn.click();
            return;
          }

          let lockedBtn =
            document.getElementById("next-subconcept-btn") ||
            document.querySelector("#btn-locked #next-subconcept-btn");

          if (lockedBtn) {
            lockedBtn.click();

            setTimeout(() => {
              unlockedBtn =
                document.getElementById("next-subconcept-btn-unlocked") ||
                document.querySelector("#btn-unlocked #next-subconcept-btn");

              if (unlockedBtn) unlockedBtn.click();
            }, 500);

            return;
          }

          console.warn("Next button not found yet");
        }}
      >
        <ChevronRight size={28} className="text-white" />
      </button>
    );
  };

  // ---------------------------
  // Loading state
  // ---------------------------
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

  // ---------------------------
  // Main render
  // ---------------------------
  const ContentAreaComponent = ContentArea;

  return (
    <CourseContext.Provider value={courseContextValue}>
      <div className="flex flex-col md:flex-row h-screen bg-white overflow-hidden">
        {/* Sidebar Desktop */}
        <div className="hidden md:block fixed left-0 top-0 h-screen w-72 z-30">
          <Sidebar
            programName={programName}
            onSelectSubconcept={(
              url,
              type,
              id,
              stageId,
              unitId,
              subconceptId,
              subconceptMaxscore,
              completionStatus
            ) => {
              // Only update if content actually changed
              if (id !== currentContent.id) {
                setCurrentContent({
                  url,
                  type,
                  id,
                  stageId: stageId || currentContent.stageId,
                  unitId: unitId || currentContent.unitId,
                  subconceptId: subconceptId || currentContent.subconceptId,
                  completionStatus: completionStatus || currentContent.completionStatus,
                  subconceptMaxscore: Number(subconceptMaxscore || 0),
                });
                // Reset iframe state when selecting new content
                setIframeScore(null);
                setIframeAttemptRecorded(false);
                setShowSubmit(false);
                setIsNextEnabled(false);
              }
            }}
            currentActiveId={currentContent.id}
            stages={stages}
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col md:ml-72">
          <div
            className="bg-white flex justify-center items-center p-4"
            style={{
              height: window.innerWidth >= 768 ? "80vh" : "40vh",
              transition: "height 0.2s ease-in-out",
            }}
          >
            <div className="w-full max-w-5xl rounded-xl shadow-md overflow-hidden bg-white h-full">
              <ContentAreaComponent />
            </div>
          </div>

          {/* MOBILE ACTION BAR */}
          <MobileActionBar />

          {/* MOBILE SIDEBAR */}
          <div
            className="md:hidden flex-shrink-0 bg-white overflow-y-auto border-t border-gray-300"
            style={{ height: mobileActionsExist ? "48vh" : "55vh" }}
          >
            <Sidebar
              programName={programName}
              onSelectSubconcept={(
                url,
                type,
                id,
                stageId,
                unitId,
                subconceptId,
                subconceptMaxscore,
                completionStatus
              ) => {
                // Only update if content actually changed
                if (id !== currentContent.id) {
                  setCurrentContent({
                    url,
                    type,
                    id,
                    stageId: stageId || currentContent.stageId,
                    unitId: unitId || currentContent.unitId,
                    subconceptId: subconceptId || currentContent.subconceptId,
                    completionStatus: completionStatus || currentContent.completionStatus,
                    subconceptMaxscore: Number(subconceptMaxscore || 0),
                  });
                  // Reset iframe state when selecting new content
                  setIframeScore(null);
                  setIframeAttemptRecorded(false);
                  setShowSubmit(false);
                  setIsNextEnabled(false);
                }
              }}
              currentActiveId={currentContent.id}
              stages={stages}
            />
          </div>

          {/* DESKTOP BUTTONS */}
          <div className="hidden md:flex justify-center mt-4">
            <ControlButtons />
          </div>
        </div>
      </div>

      {/* FLOATING NEXT on MOBILE */}
      <FloatingNextButton />

      {showAssignmentModal && (
        <AssignmentModal
          onClose={() => setShowAssignmentModal(false)}
          submissionDate={assignmentStatus?.submittedDate}
          status={assignmentStatus?.status}
          fileUrl={assignmentStatus?.submittedFile?.downloadUrl}
          correctedFile={assignmentStatus?.correctedFile}
          correctedDate={assignmentStatus?.correctedDate}
          remarks={assignmentStatus?.remarks}
          score={assignmentStatus?.score}
        />
      )}
    </CourseContext.Provider>
  );
};

export default CoursePage;