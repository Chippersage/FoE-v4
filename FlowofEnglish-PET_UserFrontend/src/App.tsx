// @ts-nocheck
import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CircularProgress } from "@mui/material";

import { useUserContext } from "./context/AuthContext";
<<<<<<< Updated upstream
import Loader from "./components/Loader";

// Lazy load pages (performance optimization)
const LogInPage = lazy(() => import("./_auth/forms/LoginForm"));
const CohortSelectionPage = lazy(() => import("./pages/CohortSelectionPage"));
const CoursePage = lazy(() => import("./pages/CoursePage"));
const ViewProgressPage = lazy(() => import("./pages/ViewProgressPage"));
const ViewSubmissions = lazy(() => import("./pages/ViewSubmissions"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const RootLayout = lazy(() => import("./pages/RootLayout"));

// Mentor pages
const MentorDashboard = lazy(() => import("./mentor/pages/MentorDashboard"));
const StudentProgress = lazy(() => import("./mentor/pages/StudentProgress"));
=======
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
>>>>>>> Stashed changes

/* -------------------- Mentor -------------------- */
import MentorCohortLayout from "./mentor/layouts/MentorCohortLayout";
import MentorDashboard from "./mentor/pages/MentorDashboard";
import UnifiedLearnersPage from "./mentor/pages/UnifiedLearnersPage";
import MentorReportsPage from "./mentor/pages/MentorReportsPage";
import LearnersProgressDashboard from "./mentor/pages/LearnersProgressDashboard";
import LearnersActivityMonitor from "./mentor/pages/LearnersActivityMonitor";
import LearnerDetailPage from "./mentor/pages/LearnerDetailPage";
import ViewSubmissions from "./mentor/pages/ViewSubmissions";

<<<<<<< Updated upstream
  // Validate allowed user roles
  const isValidUserType =
    user?.userType?.toLowerCase() === "learner" ||
    user?.userType?.toLowerCase() === "mentor";

  // Final condition for protected routes
  const isAuthenticatedAndValid = user?.userId && isValidUserType;

  return (
    <Suspense fallback={<Loader />}>
      <Routes>

        {/* ------------- LOGIN ROUTE ------------- */}
        <Route
          path="/sign-in"
          element={
            isAuthenticatedAndValid ? (
              <Navigate to="/select-cohort" />
            ) : (
              <LogInPage />
            )
          }
        />

        {/* ------------ PROTECTED ROUTES WRAPPED IN LAYOUT ------------ */}
        <Route element={<RootLayout />}>
          
          {/* Accessible by mentor + learner */}
          <Route
            path="/select-cohort"
            element={isAuthenticatedAndValid ? <CohortSelectionPage /> : <Navigate to="/sign-in" />}
          />

          <Route
            path="/course/:programId"
            element={isAuthenticatedAndValid ? <CoursePage /> : <Navigate to="/sign-in" />}
          />

          {/* USER PROGRESS PAGE (DIFFERENT FEATURE, KEEP IT) */}
          <Route
            path="/view-progress"
            element={isAuthenticatedAndValid ? <ViewProgressPage /> : <Navigate to="/sign-in" />}
          />

          {/* ------------ MENTOR ONLY ROUTES ------------ */}
          <Route
            path="/view-submissions"
            element={isAuthenticatedAndValid && user?.userType?.toLowerCase() === "mentor"
              ? <ViewSubmissions />
              : <Navigate to="/sign-in" />}
          />

          <Route
            path="/mentor/dashboard"
            element={isAuthenticatedAndValid && user?.userType?.toLowerCase() === "mentor"
              ? <MentorDashboard />
              : <Navigate to="/sign-in" />}
          />

          <Route
            path="/mentor/student/:userId"
            element={isAuthenticatedAndValid && user?.userType?.toLowerCase() === "mentor"
              ? <StudentProgress />
              : <Navigate to="/sign-in" />}
          />
        </Route>

        {/* DEFAULT REDIRECT */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticatedAndValid ? "/select-cohort" : "/sign-in"} />}
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
=======
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
            <Route path="/mentor/dashboard" element={<MentorDashboard />} />
            <Route
              path="/mentor/:cohortId/:programId/dashboard"
              element={<MentorDashboard />}
            />
            <Route
              path=":cohortId/learners"
              element={<UnifiedLearnersPage />}
            />
            <Route
              path=":cohortId/:programId/reports"
              element={<MentorReportsPage />}
            />
            <Route
              path=":cohortId/assignments"
              element={<ViewSubmissions />}
            />

            {/* Optional deep links */}
            <Route
              path=":cohortId/learner/:learnerId/:programId?"
              element={<LearnerDetailPage />}
            />
            <Route
              path=":cohortId/analytics"
              element={<LearnersProgressDashboard />}
            />
            <Route
              path=":cohortId/activity"
              element={<LearnersActivityMonitor />}
            />
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
>>>>>>> Stashed changes
  );
}
