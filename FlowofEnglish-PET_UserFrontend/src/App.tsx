// @ts-nocheck
import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CircularProgress } from "@mui/material";

import { useUserContext } from "./context/AuthContext";
import { SessionProvider } from "./context/TimerContext";

/* -------------------- Auth -------------------- */
import AuthLayout from "./_auth/AuthLayout";
import LoginForm from "./_auth/forms/LoginForm";

/* -------------------- Core Layout -------------------- */
import RootLayout from "./pages/RootLayout";
import CohortSelectionPage from "./pages/CohortSelectionPage";
import ViewProgressPage from "./pages/ViewProgressPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoadingOverlay from "./components/LoadingOverlay";

/* -------------------- Course -------------------- */
import CourseLayout from "./pages/course/CourseLayout";
import CoursePage from "./pages/course/CoursePage";

/* -------------------- Mentor -------------------- */
import MentorCohortLayout from "./mentor/layouts/MentorCohortLayout";
import MentorDashboard from "./mentor/pages/MentorDashboard";
import UnifiedLearnersPage from "./mentor/pages/UnifiedLearnersPage";
import MentorReportsPage from "./mentor/pages/MentorReportsPage";
import ViewSubmissions from "./mentor/pages/ViewSubmissions";
import LearnerDetailPage from "./mentor/pages/LearnerDetailPage";
import LearnersProgressDashboard from "./mentor/pages/LearnersProgressDashboard";
import LearnersActivityMonitor from "./mentor/pages/LearnersActivityMonitor";

export default function App() {
  const { user, isLoading, isChangingCohort } = useUserContext();

  const selectedCohortWithProgram =
    localStorage.getItem("selectedCohortWithProgram");

  const userType = user?.userType?.toLowerCase();
  const isLearner = userType === "learner";
  const isMentor = userType === "mentor";
  const isAuthenticated = Boolean(user?.userId && (isLearner || isMentor));

  /* Disable right click */
  useEffect(() => {
    const disable = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", disable);
    return () => document.removeEventListener("contextmenu", disable);
  }, []);

  if (isLoading) return <LoadingOverlay />;

  return (
    <SessionProvider>
      <main className="flex h-screen flex-col">
        {/* Cohort switching overlay */}
        {isChangingCohort && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
            <div className="text-center">
              <CircularProgress className="mb-4" />
              <p className="text-lg font-medium text-gray-700">
                Switching cohort…
              </p>
            </div>
          </div>
        )}

        <Routes>
          {/* Auth */}
          <Route element={<AuthLayout />}>
            <Route
              path="/sign-in"
              element={
                isAuthenticated ? (
                  <Navigate to="/select-cohort" />
                ) : (
                  <LoginForm />
                )
              }
            />
          </Route>

          {/* Protected */}
          <Route
            element={
              isAuthenticated ? <RootLayout /> : <Navigate to="/sign-in" />
            }
          >
            <Route
              path="/select-cohort"
              element={<CohortSelectionPage />}
            />

            {/* Learner */}
            <Route element={<CourseLayout />}>
              <Route path="/course/:programId" element={<CoursePage />} />
              <Route
                path="/course/:programId/stage/:stageId/unit/:unitId/concept/:conceptId"
                element={<CoursePage />}
              />
            </Route>

            <Route path="/view-progress" element={<ViewProgressPage />} />
          </Route>

          {/* Mentor */}
          <Route
            path="/mentor"
            element={
              isAuthenticated && isMentor ? (
                <MentorCohortLayout />
              ) : (
                <Navigate to="/sign-in" />
              )
            }
          >
            <Route path=":cohortId/:programId/dashboard" element={<MentorDashboard />} />
            <Route path=":cohortId/learners" element={<UnifiedLearnersPage />} />
            <Route path=":cohortId/:programId/reports" element={<MentorReportsPage />} />
            <Route path=":cohortId/assignments" element={<ViewSubmissions />} />
            <Route path=":cohortId/learner/:learnerId/:programId?" element={<LearnerDetailPage />} />
            <Route path=":cohortId/analytics" element={<LearnersProgressDashboard />} />
            <Route path=":cohortId/activity" element={<LearnersActivityMonitor />} />
          </Route>

          {/* Root */}
          <Route path="/" element={<Navigate to="/select-cohort" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </SessionProvider>
  );
}