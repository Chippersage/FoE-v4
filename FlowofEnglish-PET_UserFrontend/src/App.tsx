// @ts-nocheck
import { Navigate, Route, Routes } from "react-router-dom";
import LogInPage from "./_auth/forms/LoginForm";
import CohortSelectionPage from "./pages/CohortSelectionPage";
import CoursePage from "./pages/CoursePage";
import ViewProgressPage from "./pages/ViewProgressPage";
import NotFoundPage from "./pages/NotFoundPage";
import RootLayout from "./pages/RootLayout";
import { useUserContext } from "./context/AuthContext";

const App: React.FC = () => {
  const { user } = useUserContext();

  const isValidUserType =
    user?.userType?.toLowerCase() === "learner" ||
    user?.userType?.toLowerCase() === "mentor";

  const isAuthenticatedAndValid = user?.userId && isValidUserType;

  return (
    <Routes>
      {/* Auth Route */}
      <Route
        path="/sign-in"
        element={
          isAuthenticatedAndValid ? <Navigate to="/select-cohort" /> : <LogInPage />
        }
      />

      {/* All protected pages inside RootLayout */}
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

        {/* ✅ Added programId parameter here */}
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

      {/* Default Root */}
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

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
