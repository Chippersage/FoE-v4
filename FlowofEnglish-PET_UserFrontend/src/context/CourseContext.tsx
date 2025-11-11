// @ts-nocheck
import React, { createContext, useContext } from "react";

export interface CurrentContent {
  url: string;
  type: string;
  id: string;
  stageId: string;
  unitId: string;
  subconceptId: string;
}

export interface CourseContextType {
  currentContent: CurrentContent;
  setCurrentContent: (content: CurrentContent) => void;
  stages: any[];
  setStages: React.Dispatch<React.SetStateAction<any[]>>;
  programName: string;
  user: any;
  programId: string | undefined;
}

// Create the context
const CourseContext = createContext<CourseContextType | undefined>(undefined);

// Hook to use the context safely
export const useCourseContext = (): CourseContextType => {
  const context = useContext(CourseContext);
  if (!context) throw new Error("useCourseContext must be used within a CourseContext.Provider");
  return context;
};

export default CourseContext;
