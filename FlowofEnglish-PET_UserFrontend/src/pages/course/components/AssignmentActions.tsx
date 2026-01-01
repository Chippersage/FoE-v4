// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { FileUploaderRecorder } from "../../../components/AssignmentComponents/FileUploaderRecorder";
import AssignmentModal from "../../../components/modals/AssignmentModal";
import useCourseStore from "../../../store/courseStore";
import { useUserContext } from "../../../context/AuthContext";
import { Loader2 } from "lucide-react";

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
  const { cohort, user } = useUserContext();
  const { markSubconceptCompleted, getSubconceptById, programId } =
    useCourseStore();

  const [uploaded, setUploaded] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentStatus, setAssignmentStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [hasFetchedStatus, setHasFetchedStatus] = useState(false);
  
  // Add refs to prevent double actions
  const isFetchingStatusRef = useRef(false);
  const isOpeningModalRef = useRef(false);

  const isCompleted = completionStatus?.toLowerCase() === "yes";
  const sub = getSubconceptById(subconceptId);

  // Fetch assignment status on mount if completed
  useEffect(() => {
    if ((isCompleted || uploaded) && !hasFetchedStatus && user?.userId && !isFetchingStatusRef.current) {
      fetchAssignmentStatus();
    }
  }, [isCompleted, uploaded, user?.userId]);

  if (!sub || !programId || !cohort?.cohortId || !user?.userId) return null;

  /* ---------------- Fetch Assignment Status ---------------- */

  const fetchAssignmentStatus = async () => {
    // Prevent multiple simultaneous fetches
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
      console.error("Error fetching assignment status", err);
      setAssignmentStatus(null);
    } finally {
      setLoadingStatus(false);
      isFetchingStatusRef.current = false;
    }
  };

  /* ---------------- Upload Success ---------------- */

  const handleUploadSuccess = async () => {
    // Prevent multiple success handlers
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

  /* ---------------- Handle View Status Click ---------------- */

  const handleViewStatusClick = async () => {
    // Prevent double clicking on view status button
    if (isOpeningModalRef.current || loadingStatus) return;
    
    try {
      isOpeningModalRef.current = true;
      setShowAssignmentModal(true);
      
      // Only fetch if we don't have status yet
      if (!assignmentStatus) {
        await fetchAssignmentStatus();
      }
    } finally {
      // Reset after a short delay to prevent rapid clicking
      setTimeout(() => {
        isOpeningModalRef.current = false;
      }, 500);
    }
  };

  /* ---------------- Render ---------------- */

  // Show uploader if not completed and no assignment exists
  const showUploader = !isCompleted && !uploaded && !assignmentStatus;

  // Show view status button if completed, uploaded, or assignment exists
  const showViewStatus = isCompleted || uploaded || assignmentStatus;

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