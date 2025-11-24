// @ts-nocheck
import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useUserContext } from "./context/AuthContext";
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

const App: React.FC = () => {
  const { user } = useUserContext();

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
  );
};

export default App;
