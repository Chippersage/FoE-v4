// @ts-nocheck
import { Navigate, Route, Routes } from "react-router-dom";
import LogInPage from "./_auth/forms/LoginForm";
import CohortSelectionPage from "./pages/CohortSelectionPage";
import CoursePage from "./pages/CoursePage";
import ViewProgressPage from "./pages/ViewProgressPage";
import NotFoundPage from "./pages/NotFoundPage";
import { useUserContext } from "./context/AuthContext";

const App: React.FC = () => {
  const { user } = useUserContext();

  // Validate user type
  const isValidUserType =
    user?.userType?.toLowerCase() === "learner" ||
    user?.userType?.toLowerCase() === "mentor";

  // Check if authenticated and valid
  const isAuthenticatedAndValid = user?.userId && isValidUserType;

  return (
    <Routes>
      {/* Public Route - Login */}
      <Route
        path="/sign-in"
        element={
          isAuthenticatedAndValid ? (
            <Navigate to="/course" />
          ) : (
            <LogInPage />
          )
        }
      />

      {/* Cohort Selection (you can keep this page if needed) */}
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

      {/* Course Page */}
      <Route
        path="/course"
        element={
          isAuthenticatedAndValid ? (
            <CoursePage />
          ) : (
            <Navigate to="/sign-in" />
          )
        }
      />

      {/* View Progress */}
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

      {/* Default Root Redirect */}
      <Route
        path="/"
        element={
          isAuthenticatedAndValid ? (
            <Navigate to="/course" />
          ) : (
            <Navigate to="/sign-in" />
          )
        }
      />

      {/* 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;