// @ts-nocheck
import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useUserContext } from "./context/AuthContext";
import Loader from "./components/Loader";

// Lazy load all pages to prevent unnecessary imports in dev/prod
const LogInPage = lazy(() => import("./_auth/forms/LoginForm"));
const CohortSelectionPage = lazy(() => import("./pages/CohortSelectionPage"));
const CoursePage = lazy(() => import("./pages/CoursePage"));
const ViewProgressPage = lazy(() => import("./pages/ViewProgressPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const RootLayout = lazy(() => import("./pages/RootLayout"));

const App: React.FC = () => {
  const { user } = useUserContext();

  const isValidUserType =
    user?.userType?.toLowerCase() === "learner" ||
    user?.userType?.toLowerCase() === "mentor";

  const isAuthenticatedAndValid = user?.userId && isValidUserType;

  return (
    // Suspense ensures lazy-loaded components show a fallback loader
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* --- Authentication Route --- */}
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

        {/* --- Protected Layout --- */}
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
        </Route>

        {/* --- Default Root Redirect --- */}
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

        {/* --- Catch-all for 404 --- */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default App;
