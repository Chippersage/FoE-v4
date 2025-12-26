// @ts-nocheck
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import ContentRenderer from "../components/ContentRenderer";
import NextSubconceptButton from "../components/NextSubconceptButton";
import { FileUploaderRecorder } from "../components/AssignmentComponents/FileUploaderRecorder";
import AssignmentModal from "../components/modals/AssignmentModal";
import { useUserContext } from "../context/AuthContext";
import { getInitialSubconcept } from "../utils/courseProgressUtils";
import CourseContext from "../context/CourseContext";
import GoogleFormControl from "../components/GoogleFormControl";
import { ChevronRight } from "lucide-react";

// DEMO USER IMPORTS
import { 
  isDemoUser, 
  isUnitAllowedForDemo,
  isStageAllowedForDemo,
  DEMO_USER_MESSAGE,
  getProgramType,
} from "../config/demoUsers";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// TypeScript interfaces
interface Subconcept {
  subconceptId: string;
  subconceptLink: string;
  subconceptType: string;
  subconceptMaxscore?: string | number;
  completionStatus: string;
  stageId?: string;
  unitId?: string;
  isLockedForDemo?: boolean;
  subconceptName?: string;
  subconceptDesc?: string;
}

interface Unit {
  unitId: string;
  unitName: string;
  unitLink?: string;
  subconcepts: Subconcept[];
  completionStatus?: string;
}

interface Stage {
  stageId: string;
  stageName: string;
  units: Unit[];
}

interface CurrentContent {
  url: string;
  type: string;
  id: string;
  stageId: string;
  unitId: string;
  subconceptId: string;
  subconceptMaxscore: number;
  completionStatus: string;
  isLockedForDemo: boolean;
}

interface AssignmentStatus {
  status?: string;
  submittedDate?: string;
  submittedFile?: { downloadUrl: string };
  correctedFile?: any;
  correctedDate?: string;
  remarks?: string;
  score?: number;
}

interface ScoreData {
  score: number;
  total: number;
}

// Simple Score Overlay Component - JUST SHOWS SCORE
const ScoreOverlay = ({ 
  score, 
  total 
}: { 
  score: number; 
  total: number; 
}) => {
  return (
    <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-6 z-10">
      <div className="text-center max-w-md">
        <div className="mb-4">
          <div className="w-32 h-32 rounded-full mx-auto flex items-center justify-center mb-4 relative"
               style={{
                 background: `conic-gradient(#0EA5E9 ${(score/total) * 100}%, #f0f0f0 ${(score/total) * 100}% 100%)`
               }}>
            <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-800">
                {score}/{total}
              </span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Score
          </h2>
          
          <p className="text-gray-600">
            {score} out of {total} {total === 1 ? 'question' : 'questions'} correct
          </p>
        </div>
      </div>
    </div>
  );
};

const CoursePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { programId } = useParams<{ programId: string }>();
  const { user } = useUserContext();

  const [stages, setStages] = useState<Stage[]>([]);
  const [programName, setProgramName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showIframe, setShowIframe] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [assignmentStatus, setAssignmentStatus] = useState<AssignmentStatus | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [canGoNext, setCanGoNext] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);
  const [iframeScore, setIframeScore] = useState<number | null>(null);
  const [iframeAttemptRecorded, setIframeAttemptRecorded] = useState(false);
  const [isNextEnabled, setIsNextEnabled] = useState(false);
  
  // Add states for score overlay
  const [showScoreOverlay, setShowScoreOverlay] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);

  // Add demo user state
  const [isDemoUserMode, setIsDemoUserMode] = useState(false);
  const [programType, setProgramType] = useState<string>('');

  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [currentContent, setCurrentContent] = useState<CurrentContent>({
    url: "",
    type: "video",
    id: "",
    stageId: "",
    unitId: "",
    subconceptId: "",
    subconceptMaxscore: 0,
    completionStatus: "",
    isLockedForDemo: false,
  });

  // Check if current user is demo user and set program type
  useEffect(() => {
    if (user?.userId) {
      setIsDemoUserMode(isDemoUser(user.userId));
    }
    if (programId) {
      setProgramType(getProgramType(programId));
    }
  }, [user?.userId, programId]);

  // Helper: Find the first accessible content for demo users
  const findFirstAccessibleContent = (stagesData: Stage[]) => {
    if (!isDemoUserMode || !programId) {
      return getInitialSubconcept(stagesData);
    }

    console.log("Finding first accessible content for demo user...");
    
    if (programType === 'PET-1') {
      // PET-1: Find first accessible unit
      for (const stage of stagesData) {
        for (const unit of stage.units || []) {
          if (isUnitAllowedForDemo(unit.unitId)) {
            // Find first subconcept in this unit
            const firstSub = unit.subconcepts?.[0];
            if (firstSub) {
              console.log(`Found accessible unit: ${unit.unitId} - ${unit.unitName}`);
              return { stage, unit, sub: firstSub };
            }
          }
        }
      }
    } else if (programType === 'PET-2') {
      // PET-2: Find first accessible stage
      for (const stage of stagesData) {
        if (isStageAllowedForDemo(stage.stageId)) {
          // Find first unit in this stage
          const firstUnit = stage.units?.[0];
          if (firstUnit) {
            // Find first subconcept in this unit
            const firstSub = firstUnit.subconcepts?.[0];
            if (firstSub) {
              console.log(`Found accessible stage: ${stage.stageId} - ${stage.stageName}`);
              return { stage, unit: firstUnit, sub: firstSub };
            }
          }
        }
      }
    }
    
    // If no accessible content found for demo user
    console.log("No accessible content found for demo user");
    return null;
  };

  // Simplified: No filtering of stages, let Sidebar handle it
  const filterStagesForDemoUser = (stagesData: Stage[]): Stage[] => {
    // Return original data without modification
    // Sidebar will handle demo user display logic
    return stagesData;
  };

  // Create a custom hook for recording attempts
  const useRecordAttempt = () => {
    const recordAttempt = useCallback(async (score?: number) => {
      try {
        if (!user?.userId || !currentContent?.subconceptId) return null;

        // Check if demo user trying to attempt
        if (isDemoUserMode) {
          alert(DEMO_USER_MESSAGE);
          throw new Error("Demo user not allowed to attempt");
        }

        const selectedCohortRaw = localStorage.getItem("selectedCohort");
        const selectedCohort = selectedCohortRaw ? JSON.parse(selectedCohortRaw) : null;
        const cohortId = selectedCohort?.cohortId || "";
        const sessionId = localStorage.getItem("sessionId") || "";

        if (!sessionId || !cohortId || !programId || !user?.userId) return;

        const userAttemptScore = score || 0;

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
          userAttemptScore: userAttemptScore,
        };

        const response = await axios.post(`${API_BASE_URL}/user-attempts`, payload);
        return response.data;
      } catch (err) {
        console.error("Error recording user attempt:", err);
        throw err;
      }
    }, [user, currentContent, programId, isDemoUserMode]);

    return { recordAttempt };
  };

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
      isDemoUserMode,
      programType,
      showScoreOverlay,
      setShowScoreOverlay,
      scoreData,
      setScoreData,
    }),
    [
      currentContent, stages, programName, user, programId, 
      canGoNext, remainingTime, iframeScore, iframeAttemptRecorded, 
      isNextEnabled, isDemoUserMode, programType,
      showScoreOverlay, scoreData
    ]
  );

  // Helper functions
  const isGoogleFormType = (type: string) => {
    if (!type) return false;
    const normalized = String(type).toLowerCase();
    return normalized === "googleform" || normalized === "assessment";
  };

  const shouldShowIframe = (contentType: string) => {
    const nonIframeTypes = [
      "video", "audio", "pdf", "image",
      "assignment_video", "assignment_audio", "assignment_pdf", "assignment_image",
      "assessment", "youtube", "mtf", "mcq", "word", "pdfAsPpt",
    ];
    return !nonIframeTypes.includes(contentType);
  };

  // Assignment status handling
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
    // Check if demo user trying to submit
    if (isDemoUserMode) {
      alert(DEMO_USER_MESSAGE);
      return;
    }
    
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
  }, [currentContent.subconceptId, fetchAssignmentStatus, isDemoUserMode]);

  // Event handlers
  const handleSubmit = () => {
    // Check if demo user
    if (isDemoUserMode) {
      alert(DEMO_USER_MESSAGE);
      return;
    }
    
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage("submitClicked", "*");
    }
  };

  const handleNextSubconcept = async (nextSub: Subconcept & { stageId?: string; unitId?: string; isLockedForDemo?: boolean }) => {
    // Check if demo user trying to access locked content
    if (isDemoUserMode && nextSub.isLockedForDemo) {
      alert(DEMO_USER_MESSAGE);
      return;
    }
    
    setCurrentContent({
      url: nextSub.subconceptLink,
      type: nextSub.subconceptType,
      id: nextSub.subconceptId,
      stageId: nextSub.stageId || "",
      unitId: nextSub.unitId || "",
      subconceptId: nextSub.subconceptId,
      completionStatus: nextSub.completionStatus,
      subconceptMaxscore: Number(nextSub.subconceptMaxscore || 0),
      isLockedForDemo: nextSub.isLockedForDemo || false
    });
    
    setIframeScore(null);
    setIframeAttemptRecorded(false);
    setShowSubmit(false);
    setIsNextEnabled(false);
    setShowScoreOverlay(false);
    setScoreData(null);
  };

  const renderNextButton = (disabled = false) => (
    <NextSubconceptButton
      stages={stages}
      currentContentId={currentContent.id}
      onNext={handleNextSubconcept}
      disabled={disabled || (isDemoUserMode && currentContent.isLockedForDemo)}
      isDemoUser={isDemoUserMode}
    />
  );

  // Helper function to update completion status
  const updateCompletionStatus = useCallback(() => {
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
  }, [currentContent.subconceptId]);

  // useEffect for event listeners
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("Received message from iframe:", event.data);
      
      // Check if demo user trying to interact
      if (isDemoUserMode) {
        alert(DEMO_USER_MESSAGE);
        return;
      }
      
      if (event.data === "enableSubmit" && !showSubmit) {
        setShowSubmit(true);
        setIsNextEnabled(false);
      } else if (event.data === "disableSubmit" && showSubmit) {
        setShowSubmit(false);
      } else if (event.data === "confirmSubmission") {
        if (!iframeAttemptRecorded && iframeScore === null) {
          // Use a default for now
          const fallbackScore = currentContent.subconceptMaxscore || 1;
          const totalQuestions = 1; // Default
          
          setScoreData({ score: fallbackScore, total: totalQuestions });
          
          recordAttempt(fallbackScore)
            .then(() => {
              setIframeAttemptRecorded(true);
              setShowSubmit(false);
              setIsNextEnabled(true);
              setShowScoreOverlay(true);
              
              updateCompletionStatus();
            })
            .catch((error) => {
              console.error("Failed to record attempt:", error);
              setIsNextEnabled(false);
              // Still show score overlay even if backend fails
              setShowScoreOverlay(true);
            });
        }
      } else if (typeof event.data === "object" && event.data.type === "scoreData") {
        const rawScore = event.data.payload.userAttemptScore;
        
        // FIX: Get total questions from HTML's arrQuestionObjects.length
        // HTML sends correct score, we need to get total questions
        let totalQuestions = 1; // Default
        
        // The HTML calculates correctAnswerCount from arrQuestionObjects.length
        // We need to get the actual total from the HTML
        // Let's use subconceptMaxscore as fallback for total questions
        if (currentContent.subconceptMaxscore > 0) {
          totalQuestions = currentContent.subconceptMaxscore;
        }
        
        console.log(`Score received: ${rawScore} (Assuming total: ${totalQuestions})`);
        
        setIframeScore(rawScore);
        setScoreData({ score: rawScore, total: totalQuestions });
        
        if (!iframeAttemptRecorded) {
          recordAttempt(rawScore)
            .then(() => {
              setIframeAttemptRecorded(true);
              setShowSubmit(false);
              setIsNextEnabled(true);
              setShowScoreOverlay(true);
              
              updateCompletionStatus();
            })
            .catch((error) => {
              console.error("Failed to record attempt:", error);
              setIsNextEnabled(false);
              // Still show score overlay even if backend fails
              setShowScoreOverlay(true);
            });
        }
      }
    };
    
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    showSubmit, 
    iframeScore, 
    iframeAttemptRecorded, 
    currentContent, 
    recordAttempt, 
    isDemoUserMode,
    updateCompletionStatus
  ]);

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

  // useEffect for content and UI state
  useEffect(() => {
    const shouldShow = shouldShowIframe(currentContent.type);
    setShowIframe(prev => prev !== shouldShow ? shouldShow : prev);
    setShowSubmit(false);
    setIframeScore(null);
    setIframeAttemptRecorded(false);
    setIsNextEnabled(false);
    setShowScoreOverlay(false);
    setScoreData(null);
  }, [currentContent.type]);

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

  // useEffect for data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${API_BASE_URL}/programconceptsmappings/${user?.userId}/program/${programId}/complete`
        );

        const data = res.data;
        const stagesData: Stage[] = data.stages || [];

        // Apply demo user filtering if needed
        let processedStages = stagesData;
        if (isDemoUserMode) {
          processedStages = filterStagesForDemoUser(stagesData);
        }

        setStages(processedStages);
        setProgramName(data.programName || "Program");

        // Find initial content - DIFFERENT LOGIC FOR DEMO USERS
        let initialContent = null;
        
        if (isDemoUserMode) {
          // For demo users: Find first accessible content
          initialContent = findFirstAccessibleContent(processedStages);
          
          // If no accessible content found for demo user
          if (!initialContent) {
            console.error("No accessible content found for demo user");
            // Don't set any content, show the locked state
            setLoading(false);
            return;
          }
        } else {
          // For regular users: Use existing logic
          initialContent = getInitialSubconcept(processedStages);
        }

        if (initialContent) {
          const { stage, unit, sub } = initialContent;

          // Check if this content is locked for demo
          const isLockedForDemo = isDemoUserMode 
            ? (programType === 'PET-1' ? !isUnitAllowedForDemo(unit.unitId) : 
               programType === 'PET-2' ? !isStageAllowedForDemo(stage.stageId) : false)
            : false;

          setCurrentContent({
            url: sub.subconceptLink,
            type: sub.subconceptType,
            id: sub.subconceptId,
            stageId: stage.stageId,
            unitId: unit.unitId,
            subconceptId: sub.subconceptId,
            subconceptMaxscore: Number(sub.subconceptMaxscore || 0),
            completionStatus: sub.completionStatus,
            isLockedForDemo: isLockedForDemo
          });
        }
      } catch (err) {
        console.error("Error fetching course data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (programId && user?.userId) fetchData();
  }, [programId, user?.userId, isDemoUserMode, programType]);

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

  // Component rendering functions
  const ContentArea = useMemo(() => {
    const Component = () => {
      const isAssessment = String(currentContent.type).toLowerCase() === "assessment";
      const isCompleted = String(currentContent.completionStatus).toLowerCase() === "yes";
      const isLockedGoogleForm = isAssessment && isCompleted;

      // Show "No Access" screen if demo user has no accessible content
      if (isDemoUserMode && !currentContent.url && stages.length > 0) {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-8">
            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">No Access to This Course</h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
              As a demo user, you don't have access to any content in this course.
              Please contact support or try a different program.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Demo Mode Details:</strong>
              </p>
              <p className="text-xs text-yellow-700">
                Program: {programId} • Type: {programType}
              </p>
            </div>
            <button
              onClick={() => navigate("/select-cohort")}
              className="mt-6 bg-[#0EA5E9] hover:bg-[#0284c7] text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Back to Programs
            </button>
          </div>
        );
      }

      // Show lock overlay for demo users on locked content
      if (isDemoUserMode && currentContent.isLockedForDemo) {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-8">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Content Locked for Demo</h3>
            <p className="text-gray-500 text-center max-w-md mb-4">{DEMO_USER_MESSAGE}</p>
          </div>
        );
      }

      if (showIframe) {
        if (isLockedGoogleForm) {
          return (
            <div className="w-full h-full flex items-center justify-center text-gray-700 font-medium">
              You have already submitted this form.
            </div>
          );
        }

        return (
          <div className="relative w-full h-full">
            <iframe
              ref={iframeRef}
              id="embeddedContent"
              src={currentContent.url}
              title="Embedded Content"
              className="w-full h-full"
              allow="autoplay"
              key={`iframe-${currentContent.subconceptId}`}
              style={{
                opacity: showScoreOverlay ? 0.1 : 1,
                pointerEvents: showScoreOverlay ? 'none' : 'auto'
              }}
            />
            {showScoreOverlay && scoreData && (
              <ScoreOverlay 
                score={scoreData.score}
                total={scoreData.total}
              />
            )}
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
            key={`renderer-${currentContent.subconceptId}`}
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
  }, [
    currentContent, 
    showIframe, 
    isDemoUserMode, 
    programId, 
    programType, 
    stages, 
    navigate, 
    showScoreOverlay, 
    scoreData
  ]);

  const ControlButtons = () => {
    const isAssignment = currentContent.type?.toLowerCase().startsWith("assignment");
    const isGoogleForm = isGoogleFormType(currentContent.type);
    const isVideo = currentContent.type?.toLowerCase() === "video";
    const isOtherContent = !isAssignment && !isGoogleForm && !isVideo && !showIframe;
    const isIframeContent = showIframe;

    const buttonContainerClass = "mt-6 flex flex-row items-center justify-center gap-3 flex-wrap";

    // Show demo mode message for locked content
    if (isDemoUserMode && currentContent.isLockedForDemo) {
      return (
        <div className={buttonContainerClass}>
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-md text-sm">
            <strong>Demo Mode:</strong> This content is locked. You can only preview specific units/stages.
          </div>
        </div>
      );
    }

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
                isDemoUser={isDemoUserMode}
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
            isDemoUser={isDemoUserMode}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className={buttonContainerClass}>
          <div id="btn-locked">{renderNextButton(true)}</div>
          <div id="btn-unlocked" style={{ display: "none" }}>{renderNextButton(false)}</div>
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

    if (isIframeContent) {
      return (
        <div className={buttonContainerClass}>
          {showSubmit && !iframeAttemptRecorded && !showScoreOverlay && (
            <button
              ref={submitBtnRef}
              onClick={handleSubmit}
              className="bg-[#0EA5E9] hover:bg-[#DB5788] text-white px-6 py-2 text-sm font-medium rounded-md flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
              style={{ minWidth: "120px", height: "38px" }}
            >
              Submit
            </button>
          )}
          
          {(iframeAttemptRecorded || showScoreOverlay) && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {showScoreOverlay && scoreData ? (
                `Score: ${scoreData.score}/${scoreData.total}`
              ) : iframeScore !== null ? (
                `Score: ${iframeScore}`
              ) : (
                'Submitted'
              )}
            </div>
          )}
          
          {renderNextButton(isNextEnabled ? false : true)}
        </div>
      );
    }

    return null;
  };

  // Mobile components
  const mobileActionsExist =
    currentContent.type?.startsWith("assignment") ||
    isGoogleFormType(currentContent.type);

  const MobileActionBar = () => {
    if (!mobileActionsExist) return null;

    if (isDemoUserMode && currentContent.isLockedForDemo) {
      return (
        <div className="md:hidden w-full bg-yellow-50 px-4 py-3">
          <p className="text-yellow-800 text-sm">
            <strong>Demo Mode:</strong> This content is locked for preview.
          </p>
        </div>
      );
    }

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
              isDemoUser={isDemoUserMode}
            />
          )
        ) : null}

        {isGoogleFormType(currentContent.type) && (
          <GoogleFormControl
            onNext={handleNextSubconcept}
            completionStatus={currentContent.completionStatus}
            subconceptType={currentContent.type}
            isDemoUser={isDemoUserMode}
          />
        )}
      </div>
    );
  };

  const FloatingNextButton = () => {
    const nextExists = stages?.length > 0;
    if (!nextExists) return null;
    
    const isDisabledForDemo = isDemoUserMode && currentContent.isLockedForDemo;
    
    return (
      <button
        id="mobile-next-btn"
        className="md:hidden fixed bottom-10 right-10 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition active:scale-95 cursor-pointer"
        style={{
          backgroundColor: isDisabledForDemo ? "#fbbf24" : "#bfbfbf",
          opacity: isDisabledForDemo ? 1 : 0.5,
          pointerEvents: isDisabledForDemo ? "auto" : "none"
        }}
        onClick={() => {
          if (isDisabledForDemo) {
            alert(DEMO_USER_MESSAGE);
            return;
          }
          
          const unlockedBtn = document.getElementById("next-subconcept-btn-unlocked") ||
            document.querySelector("#btn-unlocked #next-subconcept-btn");
          if (unlockedBtn) {
            (unlockedBtn as HTMLElement).click();
            return;
          }

          const lockedBtn = document.getElementById("next-subconcept-btn") ||
            document.querySelector("#btn-locked #next-subconcept-btn");
          if (lockedBtn) {
            (lockedBtn as HTMLElement).click();
            setTimeout(() => {
              const unlockedAfter = document.getElementById("next-subconcept-btn-unlocked") ||
                document.querySelector("#btn-unlocked #next-subconcept-btn");
              if (unlockedAfter) (unlockedAfter as HTMLElement).click();
            }, 500);
          }
        }}
      >
        <ChevronRight size={28} className="text-white" />
      </button>
    );
  };

  // Loading state
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

  // Show "No Access" screen if demo user has no content loaded
  if (isDemoUserMode && !currentContent.url && stages.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
        <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
          <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mb-6 mx-auto">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
            No Access Available
          </h2>
          <p className="text-gray-600 text-center mb-6">
            As a demo user, you don't have access to any content in the <strong>{programName}</strong> course.
            The content you can access depends on your demo permissions.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">Demo Restrictions:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Program: {programId}</li>
              <li>• Type: {programType}</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/select-cohort")}
              className="bg-[#0EA5E9] hover:bg-[#0284c7] text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Choose Different Program
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors"
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  const ContentAreaComponent = ContentArea;

  return (
    <CourseContext.Provider value={courseContextValue}>
      {/* REMOVED: Demo User Banner from top of page */}
      
      <div className="flex flex-col md:flex-row h-screen bg-white overflow-hidden">
        {/* Sidebar Desktop */}
        <div className="hidden md:block fixed left-0 top-0 h-screen w-72 z-30">
          <Sidebar
            programName={programName}
            onSelectSubconcept={(
              url: string,
              type: string,
              id: string,
              stageId?: string,
              unitId?: string,
              subconceptId?: string,
              subconceptMaxscore?: number,
              completionStatus?: string,
              isLockedForDemo?: boolean
            ) => {
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
                  isLockedForDemo: isLockedForDemo || false
                });
                setIframeScore(null);
                setIframeAttemptRecorded(false);
                setShowSubmit(false);
                setIsNextEnabled(false);
                setShowScoreOverlay(false);
                setScoreData(null);
              }
            }}
            currentActiveId={currentContent.id}
            stages={stages}
            isDemoUser={isDemoUserMode}
            programId={programId}
            programType={programType}
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
            className="md:hidden flex-shrink-0 bg-white overflow-y-auto"
            style={{ height: mobileActionsExist ? "48vh" : "55vh" }}
          >
            <Sidebar
              programName={programName}
              onSelectSubconcept={(
                url: string,
                type: string,
                id: string,
                stageId?: string,
                unitId?: string,
                subconceptId?: string,
                subconceptMaxscore?: number,
                completionStatus?: string,
                isLockedForDemo?: boolean
              ) => {
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
                    isLockedForDemo: isLockedForDemo || false
                  });
                  setIframeScore(null);
                  setIframeAttemptRecorded(false);
                  setShowSubmit(false);
                  setIsNextEnabled(false);
                  setShowScoreOverlay(false);
                  setScoreData(null);
                }
              }}
              currentActiveId={currentContent.id}
              stages={stages}
              isDemoUser={isDemoUserMode}
              programId={programId}
              programType={programType}
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