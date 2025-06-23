import { Navigate, Route, Routes } from "react-router-dom";
import LoginForm from "./_auth/forms/LoginForm";
import { HomePage } from "./_root/pages/HomePage";
import SubConceptsPage from "./_root/pages/SubConceptsPage";
import AuthLayout from "./_auth/AuthLayout";
import RootLayout from "./_root/RootLayout";
import SingleSubconcept from "./_root/pages/SingleSubconcept";
import { useEffect } from "react";
import { useUserContext } from "./context/AuthContext";
import CohortSelectionPage from "./_root/pages/CohortSelectionPage";
import { SessionProvider } from "./context/TimerContext";
import NotFoundPage from "./components/NotFoundPage";
import { Toaster } from "react-hot-toast";
import AssignmentsPage from "./_root/pages/AssignmentsPage";
import ViewProgressPage from "./_root/pages/ViewProgressPage";
import LoadingOverlay from "./components/LoadingOverlay";

export default function App() {
  const { user, isLoading } = useUserContext();
  const selectedCohortWithProgram = localStorage.getItem(
    "selectedCohortWithProgram"
  );

  const isValidUserType =
    user?.userType?.toLowerCase() === "learner" ||
    user?.userType?.toLowerCase() === "mentor" ||
    user?.userType?.toLowerCase() === "Learner" ||
    user?.userType?.toLowerCase() === "Mentor";

  const isAuthenticatedAndValid = user?.userId && isValidUserType;
  console.log(isAuthenticatedAndValid);

  useEffect(() => {
    // @ts-ignore
    const disableRightClick = (e) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", disableRightClick);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
    };
  }, []);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <SessionProvider>
      <main className="flex h-screen flex-col">
        <Toaster position="bottom-center" reverseOrder={false} />

        <Routes>
          {/* Public routes (no headers) */}
          <Route element={<AuthLayout />}>
            <Route
              path="/sign-in"
              element={
                isAuthenticatedAndValid ? (
                  <Navigate
                    to={
                      selectedCohortWithProgram
                        ? "/dashboard"
                        : "/select-cohort"
                    }
                  />
                ) : (
                  <LoginForm />
                )
              }
            />
          </Route>

          {/* Protected routes with headers */}
          <Route
            element={
              isAuthenticatedAndValid ? (
                <RootLayout />
              ) : (
                <Navigate to="/sign-in" />
              )
            }
          >
            {/* Cohort selection page */}
            <Route
              path="/select-cohort"
              element={
                selectedCohortWithProgram ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <CohortSelectionPage />
                )
              }
            />

            {/* Main protected routes */}
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/view-progress" element={<ViewProgressPage />} />
            <Route path="/subconcepts/:unitId" element={<SubConceptsPage />} />
            <Route
              path="/subconcept/:subconceptId"
              element={<SingleSubconcept />}
            />
            <Route
              path="/cohorts/:cohortId/assignments"
              element={<AssignmentsPage />}
            />
          </Route>

          {/* Redirect root to appropriate page */}
          <Route
            path="/"
            element={
              isAuthenticatedAndValid ? (
                selectedCohortWithProgram ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Navigate to="/select-cohort" />
                )
              ) : (
                <Navigate to="/sign-in" />
              )
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </SessionProvider>
  );
}
