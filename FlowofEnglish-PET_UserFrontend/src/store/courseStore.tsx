// @ts-nocheck
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Type definitions (copy from your CoursePage)
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

interface CourseStore {
  // Course structure
  programId: string | null;
  programName: string;
  stages: Stage[];
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadCourse: (programId: string, userId: string) => Promise<void>;
  clearCourse: () => void;
  
  // Helper getters
  getStage: (stageId: string) => Stage | undefined;
  getUnit: (stageId: string, unitId: string) => Unit | undefined;
  getSubconcept: (stageId: string, unitId: string, subconceptId: string) => Subconcept | undefined;
  getSubconceptById: (subconceptId: string) => (Subconcept & { stageId: string; unitId: string }) | undefined;
  getNextSubconcept: (currentSubconceptId: string) => (Subconcept & { stageId: string; unitId: string }) | undefined;
  
  // Demo user helpers
  isUnitAccessibleForDemo: (unitId: string) => boolean;
  isStageAccessibleForDemo: (stageId: string) => boolean;
}

const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      programId: null,
      programName: '',
      stages: [],
      isLoading: false,
      error: null,
      
      loadCourse: async (programId: string, userId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await axios.get(
            `${API_BASE_URL}/programconceptsmappings/${userId}/program/${programId}/complete`
          );
          
          const data = response.data;
          set({
            programId,
            programName: data.programName || "Program",
            stages: data.stages || [],
            isLoading: false
          });
        } catch (error: any) {
          console.error("Error loading course:", error);
          set({ 
            error: error.message || "Failed to load course",
            isLoading: false 
          });
        }
      },
      
      clearCourse: () => {
        set({ 
          programId: null,
          programName: '',
          stages: [],
          error: null 
        });
      },
      
      // Getters
      getStage: (stageId: string) => {
        return get().stages.find(stage => stage.stageId === stageId);
      },
      
      getUnit: (stageId: string, unitId: string) => {
        const stage = get().getStage(stageId);
        return stage?.units.find(unit => unit.unitId === unitId);
      },
      
      getSubconcept: (stageId: string, unitId: string, subconceptId: string) => {
        const unit = get().getUnit(stageId, unitId);
        return unit?.subconcepts.find(sub => sub.subconceptId === subconceptId);
      },
      
      getSubconceptById: (subconceptId: string) => {
        const { stages } = get();
        for (const stage of stages) {
          for (const unit of stage.units || []) {
            for (const sub of unit.subconcepts || []) {
              if (sub.subconceptId === subconceptId) {
                return { 
                  ...sub, 
                  stageId: stage.stageId, 
                  unitId: unit.unitId 
                };
              }
            }
          }
        }
        return undefined;
      },
      
      getNextSubconcept: (currentSubconceptId: string) => {
        const { stages } = get();
        let found = false;
        
        for (const stage of stages) {
          for (const unit of stage.units || []) {
            for (const sub of unit.subconcepts || []) {
              if (found) {
                return { 
                  ...sub, 
                  stageId: stage.stageId, 
                  unitId: unit.unitId 
                };
              }
              if (sub.subconceptId === currentSubconceptId) {
                found = true;
              }
            }
          }
        }
        return undefined; // No next subconcept
      },
      
      // Demo user helpers (these are static - based on your demo config)
      isUnitAccessibleForDemo: (unitId: string) => {
        // This should use your existing demo config logic
        // For now, returning true - you'll replace with actual logic
        return true;
      },
      
      isStageAccessibleForDemo: (stageId: string) => {
        // This should use your existing demo config logic
        // For now, returning true - you'll replace with actual logic
        return true;
      }
    }),
    {
      name: 'course-storage',
      partialize: (state) => ({ 
        programId: state.programId,
        programName: state.programName,
        stages: state.stages
      })
    }
  )
);

export default useCourseStore;