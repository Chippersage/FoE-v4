// @ts-nocheck
import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useUserContext } from "./context/AuthContext";
import Loader from "./components/Loader";
import MentorLayout from "./mentor/layout/MentorLayout";

/* -------------------- Auth & Core Pages -------------------- */
const LogInPage = lazy(() => import("./_auth/forms/LoginForm"));
const CohortSelectionPage = lazy(() => import("./pages/CohortSelectionPage"));
const CoursePage = lazy(() => import("./pages/course/CoursePage"));
const ViewProgressPage = lazy(() => import("./pages/ViewProgressPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const RootLayout = lazy(() => import("./pages/RootLayout"));
const CourseLayout = lazy(() => import("./pages/course/CourseLayout"));

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

          {/* ===================== COURSE ROUTES ===================== */}
          <Route element={<CourseLayout />}>
            {/* ENTRY ROUTE (decision only) */}
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

            {/* REAL CONTENT ROUTE */}
            <Route
              path="/course/:programId/stage/:stageId/unit/:unitId/concept/:conceptId"
              element={
                isAuthenticatedAndValid ? (
                  <CoursePage />
                ) : (
                  <Navigate to="/sign-in" />
                )
              }
            />
          </Route>

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

          {/* -------- Mentor Submissions -------- */}
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
            <Route path="/mentor/dashboard" element={<MentorDashboard />} />
            <Route
              path="/mentor/:cohortId/:programId/dashboard"
              element={<MentorDashboard />}
            />
            <Route
              path="/mentor/:cohortId/:programId/learners"
              element={<ViewLearnersPage />}
            />
            <Route
              path="/mentor/:cohortId/:programId/reports"
              element={<CohortReports />}
            />
            <Route
              path="/mentor/:cohortId/:programId/assignments"
              element={<ViewSubmissions />}
            />
            <Route
              path="/mentor/:cohortId/:programId/learner/:userId"
              element={<StudentOverviewPage />}
            />
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
