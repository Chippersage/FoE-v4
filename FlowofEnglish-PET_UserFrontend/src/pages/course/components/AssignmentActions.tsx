// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FileUploaderRecorder } from "../../../components/AssignmentComponents/FileUploaderRecorder";
import AssignmentModal from "../../../components/modals/AssignmentModal";
import useCourseStore from "../../../store/courseStore";
import { useUserContext } from "../../../context/AuthContext";
import { Loader2, RefreshCw } from "lucide-react";

interface Props {
  subconceptId: string;
  completionStatus?: string;
  isMobile?: boolean;
}

const AssignmentActions: React.FC<Props> = ({
  subconceptId,
  completionStatus,
  isMobile = false
}) => {
  const { cohort: contextCohort, user } = useUserContext();
  const { cohortId: cohortIdFromParams } = useParams();
  const { markSubconceptCompleted, getSubconceptById, programId } =
    useCourseStore();

  const [uploaded, setUploaded] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentStatus, setAssignmentStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [hasFetchedStatus, setHasFetchedStatus] = useState(false);
  const [localCohort, setLocalCohort] = useState<any>(null);
  const [isCheckingCohort, setIsCheckingCohort] = useState(true);
  
  const isFetchingStatusRef = useRef(false);
  const isOpeningModalRef = useRef(false);

  // Try to get cohort from multiple sources in priority order
  useEffect(() => {
    // Priority 1: URL parameters
    if (cohortIdFromParams) {
      setLocalCohort({ cohortId: cohortIdFromParams });
      setIsCheckingCohort(false);
      return;
    }
    
    // Priority 2: User context
    if (contextCohort?.cohortId) {
      setLocalCohort(contextCohort);
      setIsCheckingCohort(false);
      return;
    }
    
    // Priority 3: localStorage
    const storedCohort = localStorage.getItem("selectedCohort");
    if (storedCohort) {
      try {
        const parsedCohort = JSON.parse(storedCohort);
        if (parsedCohort?.cohortId) {
          setLocalCohort(parsedCohort);
          setIsCheckingCohort(false);
          return;
        }
      } catch (e) {
        // Silently handle parse errors
      }
    }
    
    // Priority 4: URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const queryCohortId = urlParams.get("cohortId");
    if (queryCohortId) {
      setLocalCohort({ cohortId: queryCohortId });
      setIsCheckingCohort(false);
      return;
    }
    
    setIsCheckingCohort(false);
  }, [contextCohort, cohortIdFromParams]);

  // Get subconcept data
  const sub = getSubconceptById(subconceptId);

  // Use cohort from the best available source
  const cohort = contextCohort || localCohort || (cohortIdFromParams ? { cohortId: cohortIdFromParams } : null);

  const isCompleted = completionStatus?.toLowerCase() === "yes";

  // Fetch assignment status when needed
  useEffect(() => {
    if ((isCompleted || uploaded) && !hasFetchedStatus && user?.userId && !isFetchingStatusRef.current && sub && programId) {
      fetchAssignmentStatus();
    }
  }, [isCompleted, uploaded, hasFetchedStatus, user?.userId, sub, programId, subconceptId]);

  // Don't render if missing critical data
  if (!sub || !programId || !user?.userId) {
    return null;
  }

  // Fetch assignment status from API
  const fetchAssignmentStatus = async () => {
    if (isFetchingStatusRef.current) return;
    
    try {
      isFetchingStatusRef.current = true;
      setLoadingStatus(true);
      setHasFetchedStatus(true);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/assignments/user-assignment?userId=${user.userId}&subconceptId=${subconceptId}`
      );

      const data = await res.json();

      if (data?.status === "not_found") {
        setAssignmentStatus(null);
      } else {
        setAssignmentStatus(data);
      }
    } catch (err) {
      setAssignmentStatus(null);
    } finally {
      setLoadingStatus(false);
      isFetchingStatusRef.current = false;
    }
  };

  // Handle successful upload
  const handleUploadSuccess = async () => {
    if (uploaded) return;
    
    markSubconceptCompleted(subconceptId);
    setUploaded(true);
    await fetchAssignmentStatus();

    window.dispatchEvent(
      new CustomEvent("updateSidebarCompletion", {
        detail: { subconceptId },
      })
    );
  };

  // Handle view status button click
  const handleViewStatusClick = async () => {
    if (isOpeningModalRef.current || loadingStatus) return;
    
    try {
      isOpeningModalRef.current = true;
      setShowAssignmentModal(true);
      
      if (!assignmentStatus && !hasFetchedStatus) {
        await fetchAssignmentStatus();
      }
    } finally {
      setTimeout(() => {
        isOpeningModalRef.current = false;
      }, 500);
    }
  };

  // Retry fetching cohort data
  const handleRetryCohort = () => {
    setIsCheckingCohort(true);
    setLocalCohort(null);
    
    setTimeout(() => {
      const storedCohort = localStorage.getItem("selectedCohort");
      if (storedCohort) {
        try {
          const parsedCohort = JSON.parse(storedCohort);
          if (parsedCohort?.cohortId) {
            setLocalCohort(parsedCohort);
          }
        } catch (e) {
          // Silently handle parse errors
        }
      }
      setIsCheckingCohort(false);
    }, 500);
  };

  // Determine what to render based on current state
  const showUploader = !isCompleted && !uploaded && !assignmentStatus && cohort?.cohortId;
  const showViewStatus = isCompleted || uploaded || assignmentStatus;
  const showCohortWarning = !isCompleted && !uploaded && !assignmentStatus && !cohort?.cohortId;

  // Show loading state while checking for cohort
  if (isCheckingCohort) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-2">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Loading assignment...</span>
      </div>
    );
  }

  // Mobile rendering
  if (isMobile) {
    return (
      <div className="w-full">
        {showUploader && (
          <div className="w-full">
            <FileUploaderRecorder
              assignmentStatus={null}
              onUploadSuccess={handleUploadSuccess}
              uploadMeta={{
                programId,
                cohortId: cohort.cohortId,
                stageId: sub.stageId,
                unitId: sub.unitId,
                subconceptId: sub.subconceptId,
              }}
              isMobile={true}
            />
          </div>
        )}

        {showCohortWarning && (
          <div className="w-full p-3 text-center bg-yellow-50 rounded-md">
            <div className="text-sm text-yellow-600 mb-1">
              Unable to load assignment
            </div>
            <button
              onClick={handleRetryCohort}
              className="flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-700"
            >
              <RefreshCw size={12} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {showViewStatus && (
          <button
            className="w-full py-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-md text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleViewStatusClick}
            disabled={loadingStatus || isOpeningModalRef.current}
          >
            {loadingStatus && <Loader2 size={14} className="animate-spin" />}
            <span className="truncate">
              {loadingStatus ? "Loading..." : "View Status"}
            </span>
          </button>
        )}

        {showAssignmentModal && (
          <AssignmentModal
            onClose={() => setShowAssignmentModal(false)}
            loading={loadingStatus}
            submissionDate={assignmentStatus?.submittedDate}
            status={assignmentStatus?.status}
            fileUrl={assignmentStatus?.submittedFile?.downloadUrl}
            correctedFile={assignmentStatus?.correctedFile}
            correctedDate={assignmentStatus?.correctedDate}
            remarks={assignmentStatus?.remarks}
            score={assignmentStatus?.score}
            isMobile={true}
          />
        )}
      </div>
    );
  }

  // Desktop rendering
  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-row items-center gap-4">
        {showUploader && (
          <FileUploaderRecorder
            assignmentStatus={null}
            onUploadSuccess={handleUploadSuccess}
            uploadMeta={{
              programId,
              cohortId: cohort.cohortId,
              stageId: sub.stageId,
              unitId: sub.unitId,
              subconceptId: sub.subconceptId,
            }}
          />
        )}

        {showCohortWarning && (
          <div className="px-4 py-2 bg-yellow-50 rounded-md">
            <div className="flex items-center gap-2">
              <div className="text-sm text-yellow-600">
                Assignment loading...
              </div>
              <button
                onClick={handleRetryCohort}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
              >
                <RefreshCw size={12} />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {showViewStatus && (
          <button
            className="h-10 bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-4 rounded-md text-sm font-medium transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleViewStatusClick}
            disabled={loadingStatus || isOpeningModalRef.current}
          >
            {loadingStatus && <Loader2 size={16} className="animate-spin" />}
            {loadingStatus ? "Loading..." : "View Assignment Status"}
          </button>
        )}
      </div>

      {showAssignmentModal && (
        <AssignmentModal
          onClose={() => setShowAssignmentModal(false)}
          loading={loadingStatus}
          submissionDate={assignmentStatus?.submittedDate}
          status={assignmentStatus?.status}
          fileUrl={assignmentStatus?.submittedFile?.downloadUrl}
          correctedFile={assignmentStatus?.correctedFile}
          correctedDate={assignmentStatus?.correctedDate}
          remarks={assignmentStatus?.remarks}
          score={assignmentStatus?.score}
        />
      )}
    </div>
  );
};

export default AssignmentActions;