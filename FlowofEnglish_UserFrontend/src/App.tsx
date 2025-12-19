import { Navigate, Route, Routes } from "react-router-dom";
import { CircularProgress } from "@mui/material";
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
import MentorCohortLayout from "./mentor/layouts/MentorCohortLayout";
import MentorDashboard from "./mentor/pages/MentorDashboard";
import LearnersProgressDashboard from "./mentor/pages/LearnersProgressDashboard";
import LearnersActivityMonitor from "./mentor/pages/LearnersActivityMonitor";
import LearnerDetailPage from "./mentor/pages/LearnerDetailPage";
import MentorReportsPage from "./mentor/pages/MentorReportsPage";
import LearnersDetailsPage from "./mentor/pages/LearnersDetailsPage";
import UnifiedLearnersPage from "./mentor/pages/UnifiedLearnersPage";

export default function App() {
  const { user, isLoading, isChangingCohort } = useUserContext();
  const selectedCohortWithProgram = localStorage.getItem("selectedCohortWithProgram");

  // Normalize userType → supports ANY camelCase
  const normalizedUserType = user?.userType?.toLowerCase();
  const isLearner = normalizedUserType === "learner";
  const isMentor = normalizedUserType === "mentor";

  const isAuthenticated = !!user?.userId && (isLearner || isMentor);

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

         {/* NEW: Global loading overlay during cohort change */}
        {isChangingCohort && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
            <div className="text-center">
              <CircularProgress className="mb-4" />
              <p className="text-lg font-medium text-gray-700">Switching cohort...</p>
              <p className="text-sm text-gray-500">Loading new cohort data</p>
            </div>
          </div>
        )}

        <Routes>
          {/* Public routes (no headers) */}
          <Route element={<AuthLayout />}>
            <Route path="/sign-in" element={ isAuthenticated ? (
                  <Navigate to={ selectedCohortWithProgram ? "/dashboard" : "/select-cohort" }  />
                ) : (
                  <LoginForm />
                )
              }
            />
          </Route>

          {/* Protected routes with headers */}
          <Route
            element={
              isAuthenticated ? (
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
            <Route path="/subconcept/:subconceptId" element={<SingleSubconcept />} />
          </Route>

          {/* Mentor routes */}
          <Route
            path="/mentor"
            element={
              isAuthenticated && isMentor ? (
                <MentorCohortLayout />
              ) : (
                <Navigate to="/sign-in" />
              )
            }
          >
            <Route path=":cohortId/:programId/dashboard" element={<MentorDashboard />} />
            <Route path=":cohortId/learners" element={<UnifiedLearnersPage />} />
            <Route path=":cohortId/assignments" element={<AssignmentsPage />} />
            <Route path=":cohortId/:programId/reports" element={<MentorReportsPage />}/>
            {/* <Route path=":cohortId/learner/:learnerId/:programId?" element={<LearnerDetailPage />} />
            <Route path=":cohortId/learner/:learnerId/:programId?" element={<LearnersProgressDashboard />} />
            <Route path=":cohortId/activity" element={<LearnersActivityMonitor />} />
            <Route path=":cohortId/analytics" element={< LearnersProgressDashboard /> } />
            <Route path=":cohortId/cohort-details" element={...} />
            http://localhost:5173/mentor/COMM-SVCE-1/learner/Harikrishna05/CC-3 */}

          </Route>

          {/* Redirect root to appropriate page */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
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