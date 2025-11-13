// @ts-nocheck
import React, { useRef, useState, useEffect } from "react";
import NextSubconceptButton from "./NextSubconceptButton";
import { useCourseContext } from "../context/CourseContext";
import { useUserAttempt } from "../hooks/useUserAttempt";

/**
 * GoogleFormControl
 *
 * Handles the checkbox + next button for Google Forms (assessment type).
 * Uses completionStatus sent from CoursePage.
 * When user checks and clicks Next, user-attempt API will be triggered.
 */

type GoogleFormControlProps = {
  onNext: (nextSubconcept: any) => void;
  completionStatus: string;      // "yes" or "no"
  subconceptType: string;        // "assessment" | "googleform"
};

const GoogleFormControl: React.FC<GoogleFormControlProps> = ({
  onNext,
  completionStatus,
  subconceptType,
}) => {
  const { stages, currentContent } = useCourseContext();
  const { recordAttempt } = useUserAttempt();

  // Detect if the form was already submitted based on completionStatus
  const alreadySubmitted =
    String(subconceptType).toLowerCase() === "assessment" &&
    String(completionStatus).toLowerCase() === "yes";

  // Local checkbox state
  const [checked, setChecked] = useState(false);

  // Whenever subconcept changes or completionStatus changes,
  // set checkbox accordingly
  useEffect(() => {
    if (alreadySubmitted) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [alreadySubmitted, currentContent.subconceptId]);

  // Disable next button if no check and not submitted already
  const disabledNext = !checked && !alreadySubmitted;

  // Handles next click: record attempt if first time, then navigate
  const handleNextClick = async (nextSub) => {
    try {
      if (!alreadySubmitted && checked) {
        await recordAttempt();
      }
    } catch (err) {
      console.error("Error when recording attempt for Google Form:", err);
    } finally {
      onNext(nextSub);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-3 mt-4">
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={checked}
          disabled={alreadySubmitted}
          onChange={(e) => setChecked(e.target.checked)}
          className="w-5 h-5 text-[#0EA5E9] border-gray-300 rounded focus:ring-[#0EA5E9]"
        />
        <span className="text-gray-700 text-sm">
          I have submitted this Google Form (You can Attempt only once.)
        </span>
      </label>

      <NextSubconceptButton
        stages={stages}
        currentContentId={currentContent.id}
        onNext={handleNextClick}
        disabled={disabledNext}
      />
    </div>
  );
};

export default React.memo(GoogleFormControl);
