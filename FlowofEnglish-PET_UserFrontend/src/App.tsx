// @ts-nocheck
import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useUserContext } from "./context/AuthContext";
import Loader from "./components/Loader";
import MentorLayout from "./mentor/layout/MentorLayout";

/* -------------------- Auth & Core Pages -------------------- */
const LogInPage = lazy(() => import("./_auth/forms/LoginForm"));
const CohortSelectionPage = lazy(() => import("./pages/CohortSelectionPage"));
const CoursePage = lazy(() => import("./pages/CoursePage"));
const ViewProgressPage = lazy(() => import("./pages/ViewProgressPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const RootLayout = lazy(() => import("./pages/RootLayout"));

/* -------------------- Mentor Pages -------------------- */
const MentorDashboard = lazy(() => import("./mentor/pages/MentorDashboard"));
const StudentOverviewPage = lazy(() =>
  import("./mentor/pages/StudentOverviewPage")
);
const ViewLearnersPage = lazy(() =>
  import("./mentor/pages/ViewLearnersPage")
);
const ViewSubmissions = lazy(() =>
  import("./mentor/pages/ViewSubmissions")
);
const CohortReports = lazy(() =>
  import("./mentor/pages/CohortReports")
);
const CohortDetails = lazy(() =>
  import("./mentor/pages/CohortDetails")
);

const App: React.FC = () => {
  const { user } = useUserContext();

  const isValidUserType =
    user?.userType?.toLowerCase() === "learner" ||
    user?.userType?.toLowerCase() === "mentor";

  const isAuthenticatedAndValid = Boolean(user?.userId && isValidUserType);

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* ===================== Login ===================== */}
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

        {/* ===================== Root Layout ===================== */}
        <Route element={<RootLayout />}>
          {/* -------- Cohort Selection -------- */}
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

          {/* ===================== Course Page ===================== */}
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

          {/* -------- Learner Progress -------- */}
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

          {/* -------- Mentor Submissions (standalone) -------- */}
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

          {/* ===================== Mentor Routes ===================== */}
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
            {/* Dashboard */}
            <Route path="/mentor/dashboard" element={<MentorDashboard />} />

            <Route
              path="/mentor/:cohortId/:programId/dashboard"
              element={<MentorDashboard />}
            />

            {/* Learners */}
            <Route
              path="/mentor/:cohortId/:programId/learners"
              element={<ViewLearnersPage />}
            />

            {/* Reports */}
            <Route
              path="/mentor/:cohortId/:programId/reports"
              element={<CohortReports />}
            />

            {/* Assignments */}
            <Route
              path="/mentor/:cohortId/:programId/assignments"
              element={<ViewSubmissions />}
            />

            {/* Learner Overview */}
            <Route
              path="/mentor/:cohortId/:programId/learner/:userId"
              element={<StudentOverviewPage />}
            />

            {/* Cohort Details */}
            <Route
              path="/mentor/:cohortId/:programId/cohort-details"
              element={<CohortDetails />}
            />
          </Route>
        </Route>

        {/* ===================== Default Redirect ===================== */}
        <Route
          path="/"
          element={
            <Navigate
              to={isAuthenticatedAndValid ? "/select-cohort" : "/sign-in"}
            />
          }
        />

        {/* ===================== 404 ===================== */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default App;
