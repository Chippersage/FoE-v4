// @ts-nocheck
import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useUserContext } from "./context/AuthContext";
import Loader from "./components/Loader";

// Lazy load all pages
const LogInPage = lazy(() => import("./_auth/forms/LoginForm"));
const CohortSelectionPage = lazy(() => import("./pages/CohortSelectionPage"));
const CoursePage = lazy(() => import("./pages/CoursePage"));
const ViewProgressPage = lazy(() => import("./pages/ViewProgressPage"));
const AssignmentsPage = lazy(() => import("./pages/AssignmentsPage"));
const ViewSubmissions = lazy(() => import("./pages/ViewSubmissions"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const RootLayout = lazy(() => import("./pages/RootLayout"));

const App: React.FC = () => {
  const { user } = useUserContext();

  // Validate user role
  const isValidUserType =
    user?.userType?.toLowerCase() === "learner" ||
    user?.userType?.toLowerCase() === "mentor";

  // Authentication + role check
  const isAuthenticatedAndValid = user?.userId && isValidUserType;

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* ---------------- AUTHENTICATION ---------------- */}
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

        {/* ---------------- PROTECTED LAYOUT ---------------- */}
        <Route element={<RootLayout />}>
          {/* Select cohort before proceeding */}
          <Route
            path="/select-cohort"
            element={
              isAuthenticatedAndValid ? (
                <CohortSelectionPage />
              ) : (
                <Navigate to="/sign-in" />
              )
            }
          />

          {/* Course page (main learning area) */}
          <Route
            path="/course/:programId"
            element={
              isAuthenticatedAndValid ? (
                <CoursePage />
              ) : (
                <Navigate to="/sign-in" />
              )
            }
          />

          {/* View Progress page */}
          <Route
            path="/view-progress"
            element={
              isAuthenticatedAndValid ? (
                <ViewProgressPage />
              ) : (
                <Navigate to="/sign-in" />
              )
            }
          />

          {/* Assignments page */}
          <Route
            path="/assignments"
            element={
              isAuthenticatedAndValid ? (
                <AssignmentsPage />
              ) : (
                <Navigate to="/sign-in" />
              )
            }
          />

          {/* Submissions page */}
          <Route
            path="/view-submissions"
            element={
              isAuthenticatedAndValid ? (
                <ViewSubmissions />
              ) : (
                <Navigate to="/sign-in" />
              )
            }
          />
        </Route>

        {/* ---------------- DEFAULT ROOT REDIRECT ---------------- */}
        <Route
          path="/"
          element={
            isAuthenticatedAndValid ? (
              <Navigate to="/select-cohort" />
            ) : (
              <Navigate to="/sign-in" />
            )
          }
        />

        {/* ---------------- 404 CATCH ---------------- */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default App;
