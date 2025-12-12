// Part 1 of 3 - CoursePage.tsx (imports + state + helpers + effects)
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
  console.log("🔵 CoursePage: Component rendering");
  
  // Render counter
  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log(`🔵 CoursePage Render #${renderCount.current}`);

  const location = useLocation();
  const navigate = useNavigate();
  const { programId } = useParams();
  const { user } = useUserContext();

  console.log("🔵 CoursePage: Props and hooks", {
    programId,
    userId: user?.userId,
    userType: user?.userType,
    locationPathname: location.pathname,
  });

  // ---------------------------
  // State (kept same fields as original)
  // ---------------------------
  const [stages, setStages] = useState<any[]>([]);
  const [programName, setProgramName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showIframe, setShowIframe] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [assignmentStatus, setAssignmentStatus] = useState<any>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [canGoNext, setCanGoNext] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);

  const submitBtnRef = useRef<HTMLButtonElement>(null);

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

  console.log("🔵 CoursePage: Current state", {
    stagesLength: stages.length,
    programName,
    loading,
    currentContentId: currentContent.id,
    currentContentType: currentContent.type,
    currentContentUrl: currentContent.url?.substring(0, 50) + '...',
    assignmentStatus: !!assignmentStatus,
    showAssignmentModal,
    canGoNext,
    remainingTime,
  });

  // ---------------------------
  // STABILITY FIX: Memoize stages so children (Sidebar / NextSubconcept) get a stable ref
  // We use stages.length as the dependency so changes to content that preserve length won't re-memo unnecessarily.
  // ---------------------------
  const stableStages = useMemo(() => stages, [stages.length]);

  // ---------------------------
  // STABILITY FIX: courseContextValue must be stable and only change on essential keys.
  // Track only currentContent.id, stableStages.length, programName, user.userId, programId, canGoNext, remainingTime
  // ---------------------------
  const courseContextValue = useMemo(
    () => {
      console.log("🔵 CoursePage: Recreating courseContextValue");
      return {
        currentContent,
        setCurrentContent,
        stages: stableStages,
        setStages,
        programName,
        user,
        programId,
        canGoNext,
        setCanGoNext,
        remainingTime,
        setRemainingTime,
      };
    },
    [
      currentContent.id,
      stableStages.length,
      programName,
      user?.userId,
      programId,
      canGoNext,
      remainingTime,
    ]
  );

  // ---------------------------
  // Helpers (stable)
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
      "pdfasppt", // normalize
    ];
    return !nonIframeTypes.includes(String(contentType).toLowerCase());
  }, []);

  // ---------------------------
  // Assignment status fetching (stable)
  // ---------------------------
  const fetchAssignmentStatus = useCallback(async () => {
    try {
      console.log("🔵 CoursePage: fetchAssignmentStatus called", {
        userId: user?.userId,
        subconceptId: currentContent?.subconceptId,
      });
      
      if (!user?.userId || !currentContent?.subconceptId) return;

      const res = await axios.get(`${API_BASE_URL}/assignments/user-assignment`, {
        params: { userId: user.userId, subconceptId: currentContent.subconceptId },
      });

      if (res.data?.status === "not_found") {
        console.log("🔵 CoursePage: Assignment not found");
        setAssignmentStatus(null);
      } else {
        console.log("🔵 CoursePage: Assignment status fetched", res.data);
        setAssignmentStatus(res.data);
      }
    } catch (err) {
      console.error("🔵 CoursePage: Error fetching assignment status:", err);
      setAssignmentStatus(null);
    }
  }, [user?.userId, currentContent?.subconceptId]);

  const handleAssignmentSubmissionSuccess = useCallback(() => {
    console.log("🔵 CoursePage: handleAssignmentSubmissionSuccess called", {
      subconceptId: currentContent.subconceptId,
    });
    
    // Update completion status in local state
    setStages((prevStages) => {
      const newStages = prevStages.map((stage) => ({
        ...stage,
        units: stage.units.map((unit) => ({
          ...unit,
          subconcepts: unit.subconcepts.map((sub) =>
            sub.subconceptId === currentContent.subconceptId
              ? { ...sub, completionStatus: "yes" }
              : sub
          ),
        })),
      }));
      console.log("🔵 CoursePage: Updated stages with completion");
      return newStages;
    });
    
    // Update current content completion status
    setCurrentContent(prev => {
      const newContent = {
        ...prev,
        completionStatus: "yes"
      };
      console.log("🔵 CoursePage: Updated currentContent with completion");
      return newContent;
    });
    
    // Fetch fresh assignment status after a small delay
    setTimeout(() => {
      fetchAssignmentStatus();
    }, 1500);
  }, [currentContent.subconceptId, fetchAssignmentStatus]);

  // ---------------------------
  // Handlers (memoized)
  // ---------------------------
  const handleSubmit = useCallback(() => {
    console.log("🔵 CoursePage: handleSubmit called");
    const iframe = document.getElementById("embeddedContent");
    if (iframe && iframe.tagName === "IFRAME") {
      (iframe as HTMLIFrameElement).contentWindow?.postMessage("submitClicked", "*");
    }
  }, []);

  const handleNextSubconcept = useCallback(async (nextSub) => {
    console.log("🔵 CoursePage: handleNextSubconcept called", {
      nextSubId: nextSub.subconceptId,
      nextSubType: nextSub.subconceptType,
      nextSubLink: nextSub.subconceptLink?.substring(0, 50) + '...',
    });
    
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

  // Keep a stable handler for Sidebar selection
  const handleSelectSubconcept = useCallback((
    url: string,
    type: string,
    id: string,
    stageId?: string,
    unitId?: string,
    subconceptId?: string,
    subconceptMaxscore?: number,
    completionStatus?: string
  ) => {
    console.log("🔵 CoursePage: handleSelectSubconcept called", {
      id,
      type,
      url: url?.substring(0, 50) + '...',
      stageId,
      unitId,
      subconceptId,
      completionStatus,
    });
    
    setCurrentContent(prev => ({
      url,
      type,
      id,
      stageId: stageId || prev.stageId,
      unitId: unitId || prev.unitId,
      subconceptId: subconceptId || prev.subconceptId,
      completionStatus: completionStatus || prev.completionStatus,
      subconceptMaxscore: Number(subconceptMaxscore || 0),
    }));
  }, []);

  // ---------------------------
  // Event listeners (preserve original behaviour)
  // ---------------------------
  useEffect(() => {
    console.log("🔵 CoursePage: Setting up contextmenu listener");
    const disableContext = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", disableContext);
    return () => {
      console.log("🔵 CoursePage: Cleaning up contextmenu listener");
      document.removeEventListener("contextmenu", disableContext);
    };
  }, []);

  useEffect(() => {
    console.log("🔵 CoursePage: Setting up message listener");
    const handleMessage = (event: MessageEvent) => {
        // 🚫 Ignore React DevTools nonsense messages
  if (event.data?.source === "react-devtools-bridge") return;

  // 🚫 Ignore anything that's not a simple string
  if (typeof event.data !== "string") return;
      console.log("🔵 CoursePage: Received message", event.data);
      if (event.data === "enableSubmit") {
        console.log("🔵 CoursePage: Setting showSubmit to true");
        setShowSubmit(true);
      } else if (event.data === "disableSubmit") {
        console.log("🔵 CoursePage: Setting showSubmit to false");
        setShowSubmit(false);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      console.log("🔵 CoursePage: Cleaning up message listener");
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    console.log("🔵 CoursePage: Setting up video90 listener");
    const unlock = () => {
      console.log("🔵 CoursePage: video90 event received, unlocking next button");
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
        (mobileBtn as HTMLElement).style.backgroundColor = "#0EA5E9";
      }
    };

    window.addEventListener("video90", unlock as EventListener);
    return () => {
      console.log("🔵 CoursePage: Cleaning up video90 listener");
      window.removeEventListener("video90", unlock as EventListener);
    };
  }, []);

  // ---------------------------
  // UI state effects: iframe visibility + log currentContent updates + mobile button reset
  // ---------------------------

  useEffect(() => {
    console.log("🔵 CoursePage: Checking iframe visibility", {
      type: currentContent.type,
      url: currentContent.url?.substring(0, 50) + '...',
      subconceptId: currentContent.subconceptId,
    });
    
    const shouldShow = shouldShowIframe(currentContent.type);
    console.log("🔵 CoursePage: Setting showIframe to", shouldShow);
    setShowIframe(shouldShow);
    setShowSubmit(false);
  }, [currentContent.type, currentContent.url, currentContent.subconceptId, shouldShowIframe]);

  useEffect(() => {
    console.log("🔵 CoursePage: CurrentContent updated:", {
      id: currentContent.id,
      type: currentContent.type,
      url: currentContent.url?.substring(0, 50) + '...',
      completionStatus: currentContent.completionStatus,
    });
  }, [currentContent]);

  useEffect(() => {
    console.log("🔵 CoursePage: Resetting mobile button for content", {
      id: currentContent.id,
      type: currentContent.type,
    });
    
    const mobileBtn = document.getElementById("mobile-next-btn");

    if (!mobileBtn) {
      console.log("🔵 CoursePage: Mobile button not found");
      return;
    }

    const type = String(currentContent.type).toLowerCase();

    if (type === "video") {
      console.log("🔵 CoursePage: Video content, disabling mobile button");
      (mobileBtn as HTMLElement).style.opacity = "0.5";
      mobileBtn.style.pointerEvents = "none";
      (mobileBtn as HTMLElement).style.backgroundColor = "#bfbfbf";
    } else {
      console.log("🔵 CoursePage: Non-video content, enabling mobile button");
      (mobileBtn as HTMLElement).style.opacity = "1";
      mobileBtn.style.pointerEvents = "auto";
      (mobileBtn as HTMLElement).style.backgroundColor = "#0EA5E9";
    }
  }, [currentContent.id, currentContent.type]);

  // ---------------------------
  // Data fetch effect (programId & user.userId)
  // ---------------------------
  useEffect(() => {
    console.log("🔵 CoursePage: useEffect [programId, user?.userId] triggered", {
      programId,
      userId: user?.userId,
      hasUserId: !!user?.userId,
      hasProgramId: !!programId,
    });
    
    const fetchData = async () => {
      try {
        console.log("🔵 CoursePage: Starting data fetch");
        setLoading(true);

        const res = await axios.get(
          `${API_BASE_URL}/programconceptsmappings/${user?.userId}/program/${programId}/complete`
        );

        const data = res.data;
        const stagesData = data.stages || [];
        
        console.log("🔵 CoursePage: Data fetched successfully", {
          stagesCount: stagesData.length,
          programName: data.programName,
        });

        setStages(stagesData);
        setProgramName(data.programName || "Program");

        const initialSubconcept = getInitialSubconcept(stagesData);
        if (initialSubconcept) {
          const { stage, unit, sub } = initialSubconcept;
          console.log("🔵 CoursePage: Setting initial subconcept", {
            subconceptId: sub.subconceptId,
            subconceptType: sub.subconceptType,
            stageId: stage.stageId,
            unitId: unit.unitId,
          });

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
        } else {
          console.log("🔵 CoursePage: No initial subconcept found");
        }
      } catch (err) {
        console.error("🔵 CoursePage: Error fetching course data:", err);
      } finally {
        console.log("🔵 CoursePage: Setting loading to false");
        setLoading(false);
      }
    };

    if (programId && user?.userId) {
      fetchData();
    } else {
      console.log("🔵 CoursePage: Missing programId or userId, skipping fetch", {
        programId,
        userId: user?.userId,
      });
    }
  }, [programId, user?.userId, /* stable deps */]);

  // ---------------------------
  // Persist last viewed subconcept to localStorage
  // ---------------------------
  useEffect(() => {
    if (currentContent?.subconceptId) {
      console.log("🔵 CoursePage: Saving last viewed subconcept to localStorage", {
        subconceptId: currentContent.subconceptId,
      });
      localStorage.setItem("lastViewedSubconcept", currentContent.subconceptId);
    }
  }, [currentContent?.subconceptId]);

  // ---------------------------
  // Assignment status effect
  // ---------------------------
  useEffect(() => {
    console.log("🔵 CoursePage: useEffect for assignment status triggered", {
      type: currentContent?.type,
      subconceptId: currentContent?.subconceptId,
      userId: user?.userId,
      isAssignment: currentContent?.type?.toLowerCase().startsWith("assignment"),
    });
    
    if (currentContent?.type?.toLowerCase().startsWith("assignment")) {
      console.log("🔵 CoursePage: Fetching assignment status");
      fetchAssignmentStatus();
    } else {
      console.log("🔵 CoursePage: Not an assignment, clearing assignment status");
      setAssignmentStatus(null);
    }
  }, [currentContent?.type, currentContent?.subconceptId, user?.userId, fetchAssignmentStatus]);

  // ---------------------------
  // Part 1 ends here.
  // Next message will contain render helper components, mobile actions, floating button, ControlButtons, final JSX and export.
  // Part 2 of 3 coming next...
  // ---------------------------

  // Part 2 of 3 - CoursePage.tsx (render helpers, control components, mobile actions, floating next button)
// Continue inside the same CoursePage component (do NOT re-declare the component)

  // ---------------------------
  // Render helpers & memoized components
  // ---------------------------

  // ContentArea: memoized JSX for main content area (iframe or ContentRenderer)
  const ContentArea = useMemo(() => {
    console.log("🔵 CoursePage: ContentArea rendering");
    const type = String(currentContent.type).toLowerCase();
    const isAssessment = type === "assessment";
    const isCompleted = String(currentContent.completionStatus).toLowerCase() === "yes";
    const isLockedGoogleForm = isAssessment && isCompleted;

    if (showIframe) {
      if (isLockedGoogleForm) {
        console.log("🔵 CoursePage: Showing locked Google Form message");
        return (
          <div className="w-full h-full flex items-center justify-center text-gray-700 font-medium">
            You have already submitted this form.
          </div>
        );
      }

      console.log("🔵 CoursePage: Showing iframe with URL", currentContent.url?.substring(0, 50) + '...');
      return (
        <iframe
          id="embeddedContent"
          src={currentContent.url}
          title="Embedded Content"
          className="w-full h-full"
          allow="autoplay"
        />
      );
    }

    console.log("🔵 CoursePage: Showing ContentRenderer");
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
  }, [currentContent, showIframe]);

  // Render Next button wrapper (keeps stable reference)
  const renderNextButton = useCallback((disabled = false) => {
    console.log("🔵 CoursePage: renderNextButton called", { disabled });
    return (
      <NextSubconceptButton
        stages={stableStages}
        currentContentId={currentContent.id}
        onNext={handleNextSubconcept}
        disabled={disabled}
      />
    );
  }, [stableStages, currentContent.id, handleNextSubconcept]);

  // ControlButtons: top-level buttons shown on desktop
  const ControlButtons = useCallback(() => {
    console.log("🔵 CoursePage: ControlButtons rendering", {
      showIframe,
      showSubmit,
      currentContentType: currentContent.type,
      hasAssignmentStatus: !!assignmentStatus,
    });

    const type = String(currentContent.type || "").toLowerCase();

    // iframe submit action (shown when iframe host requests it)
    const submitButton = showIframe && showSubmit ? (
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
    ) : null;

    // assignment handling
    if (type.startsWith("assignment")) {
      if (assignmentStatus) {
        return (
          <>
            {submitButton}
            <div className="mt-6 flex flex-row items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
              >
                View Assignment Status
              </button>
              {renderNextButton()}
            </div>
          </>
        );
      }

      return (
        <>
          {submitButton}
          <div className="mt-6 flex flex-row items-center justify-center gap-3 flex-wrap">
            <FileUploaderRecorder
              assignmentStatus={assignmentStatus}
              onUploadSuccess={handleAssignmentSubmissionSuccess}
            />
            {renderNextButton()}
          </div>
        </>
      );
    }

    // google form / assessment handling
    if (isGoogleFormType(currentContent.type)) {
      return (
        <>
          {submitButton}
          <GoogleFormControl
            onNext={handleNextSubconcept}
            completionStatus={currentContent.completionStatus}
            subconceptType={currentContent.type}
          />
        </>
      );
    }

    // video handling - locked/unlocked button container
    if (type === "video") {
      return (
        <>
          {submitButton}
          <div className="mt-6 flex flex-row items-center justify-center gap-3 flex-wrap">
            <div id="btn-locked">
              {renderNextButton(true)}
            </div>
            <div id="btn-unlocked" style={{ display: "none" }}>
              {renderNextButton(false)}
            </div>
          </div>
        </>
      );
    }

    // default: just show next
    return (
      <>
        {submitButton}
        <div className="mt-6 flex flex-row items-center justify-center gap-3 flex-wrap">
          {renderNextButton(false)}
        </div>
      </>
    );
  }, [
    showIframe,
    showSubmit,
    currentContent.type,
    currentContent.completionStatus,
    assignmentStatus,
    isGoogleFormType,
    renderNextButton,
    handleNextSubconcept,
    handleAssignmentSubmissionSuccess,
  ]);

  // MobileActionBar: for small screens
  const mobileActionsExist =
    String(currentContent.type || "").startsWith("assignment") ||
    isGoogleFormType(currentContent.type);

  const MobileActionBar = useCallback(() => {
    console.log("🔵 CoursePage: MobileActionBar rendering", {
      mobileActionsExist,
      currentContentType: currentContent.type,
      hasAssignmentStatus: !!assignmentStatus,
    });
    
    if (!mobileActionsExist) {
      console.log("🔵 CoursePage: No mobile actions, returning null");
      return null;
    }

    return (
      <div className="md:hidden w-full bg-white px-4 py-3 flex flex-col gap-3">
        {String(currentContent.type || "").startsWith("assignment") ? (
          assignmentStatus ? (
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white px-4 py-2 rounded-md text-sm font-medium shadow"
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
  }, [
    mobileActionsExist,
    currentContent.type,
    currentContent.completionStatus,
    assignmentStatus,
    isGoogleFormType,
    handleNextSubconcept,
    handleAssignmentSubmissionSuccess,
  ]);

  // FloatingNextButton - mobile floating action to proxy the next button click
  const FloatingNextButton = useCallback(() => {
    console.log("🔵 CoursePage: FloatingNextButton rendering", {
      stagesLength: stableStages?.length,
      currentContentId: currentContent.id,
    });
    
    const nextExists = stableStages?.length > 0;

    if (!nextExists) {
      console.log("🔵 CoursePage: No stages, FloatingNextButton returning null");
      return null;
    }
    
    console.log("🔵 CoursePage: Rendering FloatingNextButton");
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
          console.log("🔵 CoursePage: FloatingNextButton clicked");
          let unlockedBtn =
            document.getElementById("next-subconcept-btn-unlocked") ||
            document.querySelector("#btn-unlocked #next-subconcept-btn");

          if (unlockedBtn) {
            console.log("🔵 CoursePage: Clicking unlocked button");
            (unlockedBtn as HTMLElement).click();
            return;
          }

          let lockedBtn =
            document.getElementById("next-subconcept-btn") ||
            document.querySelector("#btn-locked #next-subconcept-btn");

          if (lockedBtn) {
            console.log("🔵 CoursePage: Clicking locked button");
            (lockedBtn as HTMLElement).click();

            setTimeout(() => {
              unlockedBtn =
                document.getElementById("next-subconcept-btn-unlocked") ||
                document.querySelector("#btn-unlocked #next-subconcept-btn");

              if (unlockedBtn) {
                console.log("🔵 CoursePage: Clicking unlocked button after delay");
                (unlockedBtn as HTMLElement).click();
              }
            }, 500);

            return;
          }

          console.warn("🔵 CoursePage: Next button not found yet");
        }}
      >
        <ChevronRight size={28} className="text-white" />
      </button>
    );
  }, [stableStages?.length, currentContent.id]);

  // ---------------------------
  // Part 2 ends here.
  // Next message will contain final JSX (main render), loading fallback and assignment modal rendering, and final export.
  // ---------------------------


// Part 3 of 3 — Final JSX Render + Assignment Modal + Export
// (This continues inside CoursePage component)

// ---------------------------
// Loading State
// ---------------------------
if (loading) {
  console.log("🔵 CoursePage: Showing loading state");
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

console.log("🔵 CoursePage: Main render - rendering JSX");

// ---------------------------
// Main JSX Return
// ---------------------------
return (
  <CourseContext.Provider value={courseContextValue}>
    <div className="flex flex-col md:flex-row h-screen bg-white overflow-hidden">

      {/* ▓▓ Desktop Sidebar ▓▓ */}
      <div className="hidden md:block fixed left-0 top-0 h-screen w-72 z-30">
        <Sidebar
          programName={programName}
          onSelectSubconcept={handleSelectSubconcept}
          currentActiveId={currentContent.id}
          stages={stableStages}
        />
      </div>

      {/* ▓▓ MAIN CONTENT AREA ▓▓ */}
      <div className="flex-1 flex flex-col md:ml-72">

        {/* Content Viewer (Video/PDF/Iframe/etc.) */}
        <div
          className="bg-white flex justify-center items-center p-4"
          style={{
            height: window.innerWidth >= 768 ? "80vh" : "40vh",
            transition: "height 0.2s ease-in-out",
          }}
        >
          <div className="w-full max-w-5xl rounded-xl shadow-md overflow-hidden bg-white h-full">
            {ContentArea}
          </div>
        </div>

        {/* ▓▓ MOBILE ACTION BAR (Assign/Submit/Next) ▓▓ */}
        <MobileActionBar />

        {/* ▓▓ MOBILE SIDEBAR ▓▓ */}
        <div
          className="md:hidden flex-shrink-0 bg-white overflow-y-auto border-t border-gray-300"
          style={{ height: mobileActionsExist ? "48vh" : "55vh" }}
        >
          <Sidebar
            programName={programName}
            onSelectSubconcept={handleSelectSubconcept}
            currentActiveId={currentContent.id}
            stages={stableStages}
          />
        </div>

        {/* ▓▓ DESKTOP NEXT / SUBMIT / ASSIGN BUTTONS ▓▓ */}
        <div className="hidden md:flex justify-center mt-4">
          <ControlButtons />
        </div>
      </div>
    </div>

    {/* ▓▓ MOBILE FLOATING NEXT BUTTON ▓▓ */}
    <FloatingNextButton />

    {/* ▓▓ ASSIGNMENT MODAL ▓▓ */}
    {showAssignmentModal && (
      <AssignmentModal
        onClose={() => {
          console.log("🔵 CoursePage: Closing assignment modal");
          setShowAssignmentModal(false);
        }}
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

