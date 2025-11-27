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
import MentorCohortLayout from "./mentor/layouts/MentorCohortLayout";
import MentorDashboard from "./mentor/pages/MentorDashboard";
import LearnersProgressDashboard from "./mentor/pages/LearnersProgressDashboard";
import LearnersActivityMonitor from "./mentor/pages/LearnersActivityMonitor";
import LearnerDetailPage from "./mentor/pages/LearnerDetailPage";
import MentorReportsPage from "./mentor/pages/MentorReportsPage";
import LearnersDetailsPage from "./mentor/pages/LearnersDetailsPage";

export default function App() {
  const { user, isLoading } = useUserContext();
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
            <Route path=":cohortId/progress" element={<LearnersProgressDashboard />} />
            <Route path=":cohortId/activity" element={<LearnersActivityMonitor />} />
            <Route path=":cohortId/learners" element={<LearnersDetailsPage />} />
            <Route path=":cohortId/assignments" element={<AssignmentsPage />} />
            <Route path=":cohortId/learner/:learnerId/:programId?" element={<LearnerDetailPage />} />
            <Route path=":cohortId/:programId/reports" element={<MentorReportsPage />}/>
            {/* <Route path=":cohortId/analytics" element={...} /> */}
            {/* <Route path=":cohortId/cohort-details" element={...} /> */}

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


/* import { Navigate, Route, Routes } from "react-router-dom";
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

export default function App() {
  const { user, isLoading } = useUserContext();
  const selectedCohortWithProgram = localStorage.getItem("selectedCohortWithProgram");

  // Normalize userType → supports ANY camelCase
  const normalizedUserType = user?.userType?.toLowerCase();
  const isLearner = normalizedUserType === "learner";
  const isMentor = normalizedUserType === "mentor";

  const isAuthenticated = !!user?.userId && (isLearner || isMentor);

  if (isLoading) return <LoadingOverlay />;

  return (
    <SessionProvider>
      <main className="flex h-screen flex-col">
        <Toaster position="bottom-center" reverseOrder={false} />

        <Routes>

          
          <Route element={<AuthLayout />}>
            <Route
              path="/sign-in"
              element={
                isAuthenticated ? (
                  selectedCohortWithProgram
                    ? (isMentor
                        ? <Navigate to={`/mentor/${JSON.parse(selectedCohortWithProgram).cohortId}/dashboard`} />
                        : <Navigate to="/dashboard" />
                      )
                    : <Navigate to="/select-cohort" />
                ) : (
                  <LoginForm />
                )
              }
            />
          </Route>

        
          <Route
            path="/select-cohort"
            element={
              isAuthenticated ? (
                selectedCohortWithProgram ? (
                  isMentor
                    ? <Navigate to={`/mentor/${JSON.parse(selectedCohortWithProgram).cohortId}/dashboard`} />
                    : <Navigate to="/dashboard" />
                ) : (
                  <CohortSelectionPage />
                )
              ) : (
                <Navigate to="/sign-in" />
              )
            }
          />

          
          <Route
            element={
              isAuthenticated && isLearner ? (
                <RootLayout />
              ) : (
                <Navigate to="/sign-in" />
              )
            }
          >
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/view-progress" element={<ViewProgressPage />} />
            <Route path="/subconcepts/:unitId" element={<SubConceptsPage />} />
            <Route path="/subconcept/:subconceptId" element={<SingleSubconcept />} />
            <Route
              path="/cohorts/:cohortId/assignments"
              element={<AssignmentsPage />}
            />
          </Route>

          
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
            
            <Route
              path=":cohortId/dashboard"
              element={<MentorDashboard />}
            />

            <Route
              path=":cohortId/progress"
              element={<LearnersProgressDashboard />}
            />

            <Route
              path=":cohortId/activity"
              element={<LearnersActivityMonitor />}
            />

            <Route
              path=":cohortId/learner/:learnerId/:programId?"
              element={<LearnerDetailPage />}
            />
          </Route>

          
          <Route
            path="/"
            element={
              isAuthenticated ? (
                
                selectedCohortWithProgram
                  ? (isMentor
                      ? <Navigate to={`/mentor/${JSON.parse(selectedCohortWithProgram).cohortId}/dashboard`} />
                      : <Navigate to="/dashboard" />
                    )
                  : <Navigate to="/select-cohort" />
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
}   */