// @ts-nocheck
import React, { useRef, useState, useEffect } from "react";
import { useCourseContext } from "../context/CourseContext";
import { useUserAttempt } from "../hooks/useUserAttempt";
import NextSubconceptButton from "./NextSubconceptButton";

/**
 * GoogleFormControl
 *
 * Handles the "I have submitted this Google Form" checkbox and Next button.
 * The user-attempt API triggers only once — when the user clicks "Go To Next"
 * for the first submission. Once submitted, it becomes locked.
 */
type GoogleFormControlProps = {
  onNext: (nextSubconcept: any) => void;
};

const GoogleFormControl: React.FC<GoogleFormControlProps> = ({ onNext }) => {
  const { currentContent, stages, user } = useCourseContext();
  const { recordAttempt } = useUserAttempt();

  const formCheckedRef = useRef(false);
  const formSubmittedRef = useRef(false);
  const [, forceRender] = useState(0);

  // Restore checkbox/submission state from localStorage
  useEffect(() => {
    if (!currentContent?.subconceptId) return;
    const saved = localStorage.getItem(`submitted_${currentContent.subconceptId}`);
    if (saved === "true") {
      formCheckedRef.current = true;
      formSubmittedRef.current = true;
    } else {
      formCheckedRef.current = false;
      formSubmittedRef.current = false;
    }
    forceRender((x) => x + 1);
  }, [currentContent?.subconceptId]);

  // Handles "Go To Next" click — records attempt only if first submission
  const handleNextClick = async (nextSub) => {
    try {
      // Only record if first-time submission
      if (formCheckedRef.current && !formSubmittedRef.current) {
        await recordAttempt({
          userId: user?.userId,
          subconceptId: currentContent.subconceptId,
          attemptStatus: "completed",
        });

        // Persist status to localStorage
        localStorage.setItem(`submitted_${currentContent.subconceptId}`, "true");
        formSubmittedRef.current = true;

        // Notify Sidebar about completion
        window.dispatchEvent(
          new CustomEvent("updateSidebarCompletion", {
            detail: { subconceptId: currentContent.subconceptId },
          })
        );

        console.log("Recorded user-attempt for assessment:", currentContent.subconceptId);
      }
    } catch (err) {
      console.error("Error recording user attempt:", err);
    } finally {
      // Navigate to next subconcept regardless of submission state
      onNext(nextSub);
    }
  };

  // Disable Next button unless form checked or already submitted
  const disabled = !formCheckedRef.current && !formSubmittedRef.current;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-3 mt-4">
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={formCheckedRef.current || formSubmittedRef.current}
          disabled={formSubmittedRef.current}
          onChange={(e) => {
            formCheckedRef.current = e.target.checked;
            forceRender((x) => x + 1);
          }}
          className="w-5 h-5 text-[#0EA5E9] border-gray-300 rounded focus:ring-[#0EA5E9]"
        />
        <span className="text-gray-700 text-sm">
          I have submitted this Google Form(You can Attempt only once.)
        </span>
      </label>

      <NextSubconceptButton
        stages={stages}
        currentContentId={currentContent.id}
        onNext={handleNextClick}
        disabled={disabled}
      />

      {formSubmittedRef.current && (
        <p className="text-gray-500 text-xs mt-2">
          Submitted
        </p>
      )}
    </div>
  );
};

export default React.memo(GoogleFormControl);
