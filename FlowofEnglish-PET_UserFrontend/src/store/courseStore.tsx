// @ts-nocheck
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/* -------------------- Types -------------------- */

export interface Subconcept {
  subconceptId: string;
  subconceptLink: string;
  subconceptType: string;
  subconceptMaxscore?: string | number;
  completionStatus: string;
}

export interface Unit {
  unitId: string;
  unitName: string;
  unitLink?: string;
  subconcepts: Subconcept[];
}

export interface Stage {
  stageId: string;
  stageName: string;
  units: Unit[];
}

interface CourseStore {
  programId: string | null;
  programName: string;
  stages: Stage[];

  isLoading: boolean;
  error: string | null;

  loadCourse: (programId: string, userId: string) => Promise<void>;
  clearCourse: () => void;

  getSubconceptById: (
    subconceptId: string
  ) => (Subconcept & { stageId: string; unitId: string }) | undefined;

  getNextSubconcept: (
    currentSubconceptId: string
  ) => (Subconcept & { stageId: string; unitId: string }) | undefined;

  markSubconceptCompleted: (subconceptId: string) => void;
}

/* -------------------- Store -------------------- */

const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      programId: null,
      programName: "",
      stages: [],
      isLoading: false,
      error: null,

      /* -------- Load Course -------- */

      loadCourse: async (programId: string, userId: string) => {
        try {
          set({ isLoading: true, error: null });

          const res = await axios.get(
            `${API_BASE_URL}/programconceptsmappings/${userId}/program/${programId}/complete`
          );

          set({
            programId,
            programName: res.data.programName || "Program",
            stages: res.data.stages || [],
            isLoading: false,
          });
        } catch (err: any) {
          set({
            error: err.message || "Failed to load course",
            isLoading: false,
          });
        }
      },

      clearCourse: () => {
        set({
          programId: null,
          programName: "",
          stages: [],
          error: null,
        });
      },

      /* -------- Get Subconcept -------- */

      getSubconceptById: (subconceptId: string) => {
        for (const stage of get().stages) {
          for (const unit of stage.units) {
            for (const sub of unit.subconcepts) {
              if (sub.subconceptId === subconceptId) {
                return {
                  ...sub,
                  stageId: stage.stageId,
                  unitId: unit.unitId,
                };
              }
            }
          }
        }
        return undefined;
      },

      /* -------- Get Next Subconcept -------- */

      getNextSubconcept: (currentSubconceptId: string) => {
        let found = false;

        for (const stage of get().stages) {
          for (const unit of stage.units) {
            for (const sub of unit.subconcepts) {
              if (found) {
                return {
                  ...sub,
                  stageId: stage.stageId,
                  unitId: unit.unitId,
                };
              }

              if (sub.subconceptId === currentSubconceptId) {
                found = true;
              }
            }
          }
        }

        return undefined;
      },

      /* -------- UI-only Completion -------- */

      markSubconceptCompleted: (subconceptId: string) => {
        set((state) => ({
          stages: state.stages.map((stage) => ({
            ...stage,
            units: stage.units.map((unit) => ({
              ...unit,
              subconcepts: unit.subconcepts.map((sub) =>
                sub.subconceptId === subconceptId
                  ? { ...sub, completionStatus: "yes" }
                  : sub
              ),
            })),
          })),
        }));
      },
    }),
    {
      name: "course-storage",
      partialize: (state) => ({
        programId: state.programId,
        programName: state.programName,
        stages: state.stages,
      }),
    }
  )
);

export default useCourseStore;
