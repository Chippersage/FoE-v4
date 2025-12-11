// @ts-nocheck
import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useUserContext } from "./context/AuthContext";
import Loader from "./components/Loader";
import MentorLayout from "./mentor/layout/MentorLayout";

const LogInPage = lazy(() => import("./_auth/forms/LoginForm"));
const CohortSelectionPage = lazy(() => import("./pages/CohortSelectionPage"));
const CoursePage = lazy(() => import("./pages/CoursePage"));
const ViewProgressPage = lazy(() => import("./pages/ViewProgressPage"));
const ViewSubmissions = lazy(() => import("./mentor/pages/ViewSubmissions"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const RootLayout = lazy(() => import("./pages/RootLayout"));

const MentorDashboard = lazy(() => import("./mentor/pages/MentorDashboard"));
const StudentOverviewPage = lazy(() =>
  import("./mentor/pages/StudentOverviewPage")
);

// New page
const ViewLearnersPage = lazy(() =>
  import("./mentor/pages/ViewLearnersPage")
);

const App: React.FC = () => {
  const { user } = useUserContext();

  const isValidUserType =
    user?.userType?.toLowerCase() === "learner" ||
    user?.userType?.toLowerCase() === "mentor";

  const isAuthenticatedAndValid = user?.userId && isValidUserType;

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Login */}
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

        {/* Root layout */}
        <Route element={<RootLayout />}>
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

          {/* Old submissions viewer */}
          <Route
            path="/view-submissions"
            element={
              isAuthenticatedAndValid &&
              user?.userType?.toLowerCase() === "mentor" ? (
                <ViewSubmissions />
              ) : (
                <Navigate to="/sign-in" />
              )
            }
          />

          {/* -----------------------
               Mentor Routes
             ----------------------- */}
          <Route
            element={
              isAuthenticatedAndValid &&
              user?.userType?.toLowerCase() === "mentor" ? (
                <MentorLayout />
              ) : (
                <Navigate to="/sign-in" />
              )
            }
          >
            {/* Static dashboard (fallback) */}
            <Route path="/mentor/dashboard" element={<MentorDashboard />} />

            {/* Dynamic dashboard */}
            <Route
              path="/mentor/:cohortId/:programId/dashboard"
              element={<MentorDashboard />}
            />

            {/* View Learners Page */}
            <Route
              path="/mentor/:cohortId/:programId/learners"
              element={<ViewLearnersPage />}
            />

            {/* New learner overview page */}
            <Route
              path="/mentor/:cohortId/:programId/learner/:userId"
              element={<StudentOverviewPage />}
            />

            {/* Assignments for specific cohort and program */}
            <Route
              path="/mentor/:cohortId/:programId/assignments"
              element={<ViewSubmissions />}
            />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route
          path="/"
          element={
            <Navigate
              to={isAuthenticatedAndValid ? "/select-cohort" : "/sign-in"}
            />
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default App;
