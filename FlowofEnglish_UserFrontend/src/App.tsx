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

export default function App() {
  const { isAuthenticated } = useUserContext();
  const selectedCohortWithProgram = localStorage.getItem(
    "selectedCohortWithProgram"
  );
  const user = localStorage.getItem("user");

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
                user ? (
                  <Navigate
                    to={selectedCohortWithProgram ? "/home" : "/select-cohort"}
                  />
                ) : (
                  <LoginForm />
                )
              }
            />
          </Route>

          {/* Protected routes with headers */}
          <Route element={<RootLayout />}>
            {/* Cohort selection page */}
            <Route
              path="/select-cohort"
              element={
                user ? (
                  selectedCohortWithProgram ? (
                    <Navigate to="/home" />
                  ) : (
                    <CohortSelectionPage />
                  )
                ) : (
                  <Navigate to="/sign-in" />
                )
              }
            />

            {/* Main protected routes */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/subconcepts/:unitId" element={<SubConceptsPage />} />
            <Route
              path="/subconcept/:subconceptId"
              element={<SingleSubconcept />}
            />
          </Route>

          {/* Redirect root to appropriate page */}
          <Route
            path="/"
            element={
              user ? (
                selectedCohortWithProgram ? (
                  <Navigate to="/home" />
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
