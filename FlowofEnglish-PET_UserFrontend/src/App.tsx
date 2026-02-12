// @ts-nocheck
import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CircularProgress } from "@mui/material";

import { useUserContext } from "./context/AuthContext";
import { SessionProvider } from "./context/TimerContext";

/* -------------------- Auth & Core -------------------- */
import AuthLayout from "./_auth/AuthLayout";
import LoginForm from "./_auth/forms/LoginForm";
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
import AIEvalutionPage from "./mentor/pages/AIEvaluationPage";
import AIEvaluationPage from "./mentor/pages/AIEvaluationPage";

export default function App() {
  const { user, isLoading, isChangingCohort } = useUserContext();

  const selectedCohortWithProgram =
    localStorage.getItem("selectedCohortWithProgram");

  /* -------------------- Auth Logic -------------------- */
  const normalizedUserType = user?.userType?.toLowerCase();
  const isLearner = normalizedUserType === "learner";
  const isMentor = normalizedUserType === "mentor";

  const isAuthenticated = Boolean(user?.userId && (isLearner || isMentor));

  /* -------------------- Disable Right Click -------------------- */
  useEffect(() => {
    const disableRightClick = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", disableRightClick);
    return () =>
      document.removeEventListener("contextmenu", disableRightClick);
  }, []);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <SessionProvider>
      <main className="flex h-screen flex-col">
        {/* -------- Cohort Switch Loader -------- */}
        {isChangingCohort && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
            <div className="text-center">
              <CircularProgress className="mb-4" />
              <p className="text-lg font-medium text-gray-700">
                Switching cohort...
              </p>
              <p className="text-sm text-gray-500">
                Loading new cohort data
              </p>
            </div>
          </div>
        )}

        <Routes>
          {/* ===================== Auth ===================== */}
          <Route element={<AuthLayout />}>
            <Route
              path="/sign-in"
              element={
                isAuthenticated ? (
                  <Navigate
                    to={
                      selectedCohortWithProgram
                        ? "/select-cohort"
                        : "/select-cohort"
                    }
                  />
                ) : (
                  <LoginForm />
                )
              }
            />
          </Route>

          {/* ===================== Protected ===================== */}
          <Route
            element={
              isAuthenticated ? (
                <RootLayout />
              ) : (
                <Navigate to="/sign-in" />
              )
            }
          >
            {/* -------- Cohort Selection -------- */}
            <Route
              path="/select-cohort"
              element={
                selectedCohortWithProgram ? (
                  <Navigate to={isMentor ? "/mentor" : "/course"} />
                ) : (
                  <CohortSelectionPage />
                )
              }
            />

            {/* ===================== Learner ===================== */}
            <Route element={<CourseLayout />}>
              <Route
                path="/course/:programId"
                element={<CoursePage />}
              />
              <Route
                path="/course/:programId/stage/:stageId/unit/:unitId/concept/:conceptId"
                element={<CoursePage />}
              />
            </Route>

            <Route
              path="/view-progress"
              element={<ViewProgressPage />}
            />
          </Route>

          {/* ===================== Mentor ===================== */}
          <Route path="/mentor" element={ isAuthenticated && isMentor ? (<MentorCohortLayout /> ) : (
              <Navigate to="/sign-in" /> ) } >
            <Route path=":cohortId/:programId/dashboard" element={<MentorDashboard />} />
            <Route path=":cohortId/:programId/learners" element={<UnifiedLearnersPage />} />
            <Route path=":cohortId/:programId/assignments" element={<ViewSubmissions />} />
            <Route path=":cohortId/:programId/reports" element={<MentorReportsPage />} />
            <Route path=":cohortId/:programId/assignments/:assignmentId/ai-evaluate" element={<AIEvaluationPage />}/>
          </Route>


          {/* ===================== Root Redirect ===================== */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/select-cohort" />
              ) : (
                <Navigate to="/sign-in" />
              )
            }
          />

          {/* ===================== 404 ===================== */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </SessionProvider>
  );
}
