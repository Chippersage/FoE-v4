// @ts-nocheck
import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { useParams } from "react-router-dom";
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
import { useUserAttempt } from "../hooks/useUserAttempt";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Memoized ContentArea component with minimal dependencies
const MemoizedContentArea = memo(({ 
  currentContent, 
  showIframe
}: any) => {
  const isAssessment = String(currentContent.type).toLowerCase() === "assessment";
  const isCompleted = String(currentContent.completionStatus).toLowerCase() === "yes";
  const isLockedGoogleForm = isAssessment && isCompleted;

  if (showIframe) {
    if (isLockedGoogleForm) {
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-700 font-medium">
          You have already submitted this form.
        </div>
      );
    }

    return (
      <div className="w-full h-full">
        <iframe
          id="embeddedContent"
          src={currentContent.url}
          title="Embedded Content"
          className="w-full h-full"
          allow="autoplay"
          key={currentContent.url}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <ContentRenderer
        type={currentContent.type}
        url={currentContent.url}
        title="Course Content"
        className="w-full h-full"
      />

      {isLockedGoogleForm && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center text-gray-700 font-medium">
          You have already submitted this form.
        </div>
      )}
    </div>
  );
});

// Desktop ControlButtons - memoized to prevent re-renders
const DesktopControlButtons = memo(({
  showSubmit,
  handleSubmit,
  isSubmitting,
  currentContent,
  assignmentStatus,
  setShowAssignmentModal,
  handleAssignmentSubmissionSuccess,
  renderNextButton,
  isGoogleFormType,
  handleNextSubconcept
}: any) => {
  return (
    <div className="hidden md:flex flex-col items-center gap-4 mt-4">
      {/* Submit Button for iframe activities */}
      {showSubmit && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white px-6 py-2.5 font-medium text-base rounded-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            <>
              Submit
            </>
          )}
        </button>
      )}

      {/* Other action buttons */}
      <div className="flex flex-row items-center justify-center gap-3 flex-wrap">
        {currentContent.type?.toLowerCase().startsWith("assignment") ? (
          assignmentStatus ? (
            <>
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
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
          )
        ) : isGoogleFormType(currentContent.type) ? (
          <GoogleFormControl
            onNext={handleNextSubconcept}
            completionStatus={currentContent.completionStatus}
            subconceptType={currentContent.type}
          />
        ) : currentContent.type?.toLowerCase() === "video" ? (
          <>
            <div id="btn-locked">
              {renderNextButton(true)}
            </div>
            <div id="btn-unlocked" style={{ display: "none" }}>
              {renderNextButton(false)}
            </div>
          </>
        ) : (
          renderNextButton(false)
        )}
      </div>
    </div>
  );
});

// Mobile ControlButtons - memoized to prevent re-renders
const MobileControlButtons = memo(({
  showSubmit,
  handleSubmit,
  isSubmitting,
  currentContent,
  assignmentStatus,
  setShowAssignmentModal,
  handleAssignmentSubmissionSuccess,
  renderNextButton,
  isGoogleFormType,
  handleNextSubconcept
}: any) => {
  return (
    <div className="md:hidden w-full bg-white px-4 py-3 border-t border-gray-200 flex flex-col gap-3">
      {/* Submit Button for iframe activities */}
      {showSubmit && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#5bc3cd] hover:bg-[#DB5788] text-white px-6 py-3 font-medium text-base rounded-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            <>
              Submit
            </>
          )}
        </button>
      )}

      {/* Other action buttons */}
      {currentContent.type?.toLowerCase().startsWith("assignment") ? (
        assignmentStatus ? (
          <div className="flex flex-row items-center justify-between gap-2">
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="flex-1 bg-[#5bc3cd] hover:bg-[#DB5788] text-white px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              View Assignment Status
            </button>
            <div className="flex-1">
              {renderNextButton()}
            </div>
          </div>
        ) : (
          <>
            <FileUploaderRecorder
              assignmentStatus={assignmentStatus}
              onUploadSuccess={handleAssignmentSubmissionSuccess}
            />
            <div className="w-full">
              {renderNextButton()}
            </div>
          </>
        )
      ) : isGoogleFormType(currentContent.type) ? (
        <GoogleFormControl
          onNext={handleNextSubconcept}
          completionStatus={currentContent.completionStatus}
          subconceptType={currentContent.type}
        />
      ) : currentContent.type?.toLowerCase() === "video" ? (
        <div className="flex flex-row items-center justify-center gap-2">
          <div id="btn-locked" className="flex-1">
            {renderNextButton(true)}
          </div>
          <div id="btn-unlocked" style={{ display: "none" }} className="flex-1">
            {renderNextButton(false)}
          </div>
        </div>
      ) : (
        <div className="w-full">
          {renderNextButton(false)}
        </div>
      )}
    </div>
  );
});

const CoursePage: React.FC = () => {
  const { programId } = useParams();
  const { user } = useUserContext();
  
  // Initialize the hook at the TOP LEVEL
  const { recordAttempt } = useUserAttempt();

  const [stages, setStages] = useState<any[]>([]);
  const [programName, setProgramName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showIframe, setShowIframe] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [assignmentStatus, setAssignmentStatus] = useState<any>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Use refs for values that shouldn't trigger re-renders
  const currentIframeUrlRef = useRef("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageListenerSetRef = useRef(false);
  const currentContentRef = useRef<any>(null);
  const isProcessingScoreRef = useRef(false);

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

  // Update ref when currentContent changes
  useEffect(() => {
    currentContentRef.current = currentContent;
  }, [currentContent]);

  const courseContextValue = useMemo(
    () => ({
      currentContent,
      setCurrentContent,
      stages,
      setStages,
      programName,
      user,
      programId,
      canGoNext: true,
      setCanGoNext: () => {},
      remainingTime: 0,
      setRemainingTime: () => {},
    }),
    [currentContent, stages, programName, user, programId]
  );

  // ---------------------------
  // Helper functions
  // ---------------------------
  const isGoogleFormType = useCallback((type: string) => {
    if (!type) return false;
    const normalized = String(type).toLowerCase();
    return normalized === "googleform" || normalized === "assessment";
  }, []);

  const shouldShowIframe = useCallback((contentType: string) => {
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
  }, []);

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
    
    setTimeout(() => {
      fetchAssignmentStatus();
    }, 1500);
  }, [currentContent.subconceptId, fetchAssignmentStatus]);

  // ---------------------------
  // Event handlers
  // ---------------------------
  const handleNextSubconcept = useCallback(async (nextSub) => {
    // Reset submit state when moving to next content
    setShowSubmit(false);
    setIsSubmitting(false);
    setIframeLoaded(false);
    isProcessingScoreRef.current = false;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
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
  }, []);

  const renderNextButton = useCallback((disabled = false) => (
    <NextSubconceptButton
      stages={stages}
      currentContentId={currentContent.id}
      onNext={handleNextSubconcept}
      disabled={disabled}
    />
  ), [stages, currentContent.id, handleNextSubconcept]);

  // Handler for iframe score submission
  const handleIframeScore = useCallback(async (score: number) => {
    console.log('🎯 handleIframeScore called with score:', score);
    
    // Clear the timeout if score is received
    if (timeoutRef.current) {
      console.log('🕒 Clearing timeout since score received');
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Check if already processing score
    if (isProcessingScoreRef.current) {
      console.log('⏳ Already processing score, skipping duplicate');
      return;
    }
    
    // Set processing flag
    isProcessingScoreRef.current = true;
    
    try {
      console.log('🚀 Submitting iframe score via API:', score);
      
      await recordAttempt({
        user,
        programId,
        currentContent: currentContentRef.current,
        overrideScore: score
      });
      
      console.log('✅ Score submission successful');
      
      // Update completion status
      setStages((prevStages) =>
        prevStages.map((stage) => ({
          ...stage,
          units: stage.units.map((unit) => ({
            ...unit,
            subconcepts: unit.subconcepts.map((sub) =>
              sub.subconceptId === currentContentRef.current.subconceptId
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
      
      setShowSubmit(false); // Hide submit button after successful submission
      setIsSubmitting(false); // Reset submitting state
      console.log('🏁 UI updated successfully');
      
    } catch (err) {
      console.error('❌ Failed to submit iframe score:', err);
      alert('Failed to submit score. Please try again.');
      setIsSubmitting(false); // Reset on error too
    } finally {
      // Reset processing flag after a delay
      setTimeout(() => {
        isProcessingScoreRef.current = false;
      }, 1000);
    }
  }, [user, programId, recordAttempt]);

  // ---------------------------
  // Message handler for iframe communication
  // ---------------------------
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("📨 Message from iframe:", event.data);
      
      // Handle enable/disable submit messages
      if (event.data === "enableSubmit") {
        console.log("✅ Enabling submit button (from iframe)");
        setShowSubmit(true);
      } else if (event.data === "disableSubmit") {
        console.log("❌ Disabling submit button (from iframe)");
        setShowSubmit(false);
      }
      // Handle score data from iframe
      else if (event.data?.type === "scoreData") {
        console.log("🎯 ScoreData received:", event.data);
        let score = event.data.payload?.userAttemptScore;
        
        if (typeof score !== "number") score = event.data.payload?.score;
        if (typeof score !== "number") score = event.data.payload?.totalScore;
        if (typeof score !== "number") score = event.data.score;
        
        if (typeof score === "number") {
          console.log("📊 Processing iframe score:", score);
          handleIframeScore(score);
        } else {
          console.warn("⚠️ No valid score found in ScoreData");
        }
      }
      // Handle direct score object
      else if (typeof event.data === "object" && typeof event.data.score === "number") {
        console.log("📦 Direct score object:", event.data.score);
        handleIframeScore(event.data.score);
      }
      // Handle string score
      else if (typeof event.data === "string" && !isNaN(parseFloat(event.data))) {
        console.log("🔢 String score:", event.data);
        handleIframeScore(parseFloat(event.data));
      }
      // Handle iframe loaded
      else if (event.data === "iframeLoaded" || event.data === "ready") {
        console.log("🔵 Iframe loaded/ready");
        setIframeLoaded(true);
      }
    };
    
    if (!messageListenerSetRef.current) {
      window.addEventListener("message", handleMessage);
      messageListenerSetRef.current = true;
      console.log("👂 Message listener activated");
    }
    
    return () => {
      window.removeEventListener("message", handleMessage);
      messageListenerSetRef.current = false;
    };
  }, [handleIframeScore]);

  // ---------------------------
  // Handle submit button click for iframes
  // ---------------------------
  const handleSubmit = useCallback(async () => {
    console.log("🖱️ Submit button clicked for iframe");
    
    const iframe = document.getElementById("embeddedContent");
    if (!iframe || iframe.tagName !== "IFRAME") {
      console.error("❌ No iframe found");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("🚀 Requesting score from iframe...");
      
      // Send submitClicked to iframe
      (iframe as HTMLIFrameElement).contentWindow?.postMessage("submitClicked", "*");
      
      // Also try alternative message after a delay
      setTimeout(() => {
        (iframe as HTMLIFrameElement).contentWindow?.postMessage("calculateScore", "*");
      }, 100);
      
      // Set a timeout for safety
      timeoutRef.current = setTimeout(() => {
        if (isSubmitting && !isProcessingScoreRef.current) {
          console.warn("⏰ Iframe timeout - no score received in 15 seconds");
          // Show error and allow retry
          alert("Iframe didn't respond. Please check the content and try again.");
          setIsSubmitting(false);
        }
      }, 15000);
      
    } catch (err: any) {
      console.error("❌ Error sending submit message to iframe:", err);
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  // ---------------------------
  // Handle iframe load event
  // ---------------------------
  useEffect(() => {
    const handleIframeLoad = () => {
      console.log("🔵 Iframe loaded");
      setIframeLoaded(true);
      
      // Send a message to iframe to identify ourselves
      const iframe = document.getElementById("embeddedContent");
      if (iframe && iframe.tagName === "IFRAME") {
        setTimeout(() => {
          (iframe as HTMLIFrameElement).contentWindow?.postMessage({
            type: "parentReady",
            timestamp: new Date().toISOString()
          }, "*");
        }, 500);
      }
    };
    
    const iframe = document.getElementById("embeddedContent");
    if (iframe && iframe.tagName === "IFRAME") {
      iframe.addEventListener("load", handleIframeLoad);
    }
    
    return () => {
      if (iframe && iframe.tagName === "IFRAME") {
        iframe.removeEventListener("load", handleIframeLoad);
      }
    };
  }, [currentContent.url]);

  // ---------------------------
  // Handle content type changes
  // ---------------------------
  useEffect(() => {
    const shouldShow = shouldShowIframe(currentContent.type);
    setShowIframe(shouldShow);
    
    // Only reset submit state if URL actually changed
    if (currentContent.url !== currentIframeUrlRef.current) {
      setShowSubmit(false);
      setIsSubmitting(false);
      setIframeLoaded(false);
      isProcessingScoreRef.current = false;
      // Clear timeout on content change
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      currentIframeUrlRef.current = currentContent.url;
    }
  }, [currentContent.type, currentContent.url, currentContent.subconceptId, shouldShowIframe]);

  // ---------------------------
  // Other useEffect hooks
  // ---------------------------
  useEffect(() => {
    const disableContext = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableContext);
    return () => document.removeEventListener("contextmenu", disableContext);
  }, []);

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
  }, [currentContent.id, currentContent.type]);

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
          
          currentIframeUrlRef.current = sub.subconceptLink;
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
  // Floating Next Button
  // ---------------------------
  const FloatingNextButton = memo(() => {
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
        }}
      >
        <ChevronRight size={28} className="text-white" />
      </button>
    );
  });

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
  return (
    <CourseContext.Provider value={courseContextValue}>
      <div className="grid grid-cols-1 md:grid-cols-[288px_1fr] h-screen bg-white overflow-hidden">
        
        {/* Sidebar Desktop */}
        <div className="hidden md:block h-screen overflow-y-auto border-r border-gray-200">
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
            ) =>
              setCurrentContent({
                url,
                type,
                id,
                stageId: stageId || currentContent.stageId,
                unitId: unitId || currentContent.unitId,
                subconceptId: subconceptId || currentContent.subconceptId,
                completionStatus: completionStatus || currentContent.completionStatus,
                subconceptMaxscore: Number(subconceptMaxscore || 0),
              })
            }
            currentActiveId={currentContent.id}
            stages={stages}
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex flex-col h-screen overflow-hidden">
          <div
            className="bg-white flex justify-center items-center p-4 w-full"
            style={{
              height: window.innerWidth >= 768 ? "80vh" : "40vh",
            }}
          >
            <div className="w-full max-w-5xl rounded-xl shadow-md overflow-hidden bg-white h-full">
              <MemoizedContentArea
                currentContent={currentContent}
                showIframe={showIframe}
              />
            </div>
          </div>

          {/* MOBILE CONTROL BUTTONS */}
          <MobileControlButtons
            showSubmit={showSubmit}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            currentContent={currentContent}
            assignmentStatus={assignmentStatus}
            setShowAssignmentModal={setShowAssignmentModal}
            handleAssignmentSubmissionSuccess={handleAssignmentSubmissionSuccess}
            renderNextButton={renderNextButton}
            isGoogleFormType={isGoogleFormType}
            handleNextSubconcept={handleNextSubconcept}
          />

          {/* MOBILE SIDEBAR */}
          <div
            className="md:hidden flex-shrink-0 bg-white overflow-y-auto border-t border-gray-300"
            style={{ height: "48vh" }}
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
              ) =>
                setCurrentContent({
                  url,
                  type,
                  id,
                  stageId: stageId || currentContent.stageId,
                  unitId: unitId || currentContent.unitId,
                  subconceptId: subconceptId || currentContent.subconceptId,
                  completionStatus: completionStatus || currentContent.completionStatus,
                  subconceptMaxscore: Number(subconceptMaxscore || 0),
                })
              }
              currentActiveId={currentContent.id}
              stages={stages}
            />
          </div>

          {/* DESKTOP BUTTONS */}
          <DesktopControlButtons
            showSubmit={showSubmit}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            currentContent={currentContent}
            assignmentStatus={assignmentStatus}
            setShowAssignmentModal={setShowAssignmentModal}
            handleAssignmentSubmissionSuccess={handleAssignmentSubmissionSuccess}
            renderNextButton={renderNextButton}
            isGoogleFormType={isGoogleFormType}
            handleNextSubconcept={handleNextSubconcept}
          />
        </div>

        {/* FLOATING NEXT on MOBILE */}
        <FloatingNextButton />
      </div>

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