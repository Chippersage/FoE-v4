import { Navigate, Route, Routes } from "react-router-dom";
import LoginForm from "./_auth/forms/LoginForm.tsx";
import { HomePage } from "./_root/pages/HomePage.tsx";
import SubConceptsPage from "./_root/pages/SubConceptsPage.tsx";
import AuthLayout from "./_auth/AuthLayout.tsx";
import RootLayout from "./_root/RootLayout";
import SingleSubconcept from "./_root/pages/SingleSubconcept.tsx";
import { useEffect } from "react";
import { useUserContext } from "./context/AuthContext.tsx";
import CohortSelectionPage from "./_root/pages/CohortSelectionPage.tsx";
import Header from "./components/Header.tsx";
import Header2 from "./components/Header2.tsx";
import { SessionProvider } from "./context/TimerContext.tsx";
import NotFoundPage from "./components/NotFoundPage.tsx";

export default function App() {
  
  const { isAuthenticated, selectedCohortWithProgram } = useUserContext();

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
      {/* Show headers only when user is authenticated */}
      {isAuthenticated && (
        <>
          <Header />
          <Header2 />
        </>
      )}

      <Routes>
        {/* Public routes (no headers here) */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<LoginForm />} />
        </Route>

        {/* Cohort selection page (headers should appear) */}
        <Route
          path="/select-cohort"
          element={
            isAuthenticated ? (
              <CohortSelectionPage />
            ) : (
              <Navigate to="/sign-in" />
            )
          }
        />

        {/* Redirect root to appropriate page */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
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

        {/* Private routes (headers appear) */}
        <Route element={<RootLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/subconcepts/:unitId" element={<SubConceptsPage />} />
          <Route
            path="/subconcept/:subconceptId"
            element={<SingleSubconcept />}
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
  </SessionProvider>
);


  // return (
  //   <>
  //     <main className="flex h-screen">
  //       <Routes>
  //         {/* public routes */}
  //         <Route element={<AuthLayout />}>
  //           <Route path="/sign-in" element={<LoginForm />} />
  //         </Route>

  //         {/* intermediate page after login */}
  //         <Route
  //           path="/select-cohort"
  //           element={
  //             <ProtectedRoute>
  //               <CohortSelectionPage />
  //             </ProtectedRoute>
  //           }
  //         />

  //         {/* Redirect root to either cohort selection or sign-in */}
  //         <Route
  //           path="/"
  //           element={
  //             <Navigate to={isAuthenticated ? "/select-cohort" : "/sign-in"} />
  //           }
  //         />

  //         {/* private routes */}
  //         <Route element={<RootLayout />}>
  //           <Route index element={<HomePage />} />
  //           <Route path="/subconcepts/:unitId" element={<SubConceptsPage />} />
  //           <Route
  //             path="/subconcept/:subconceptId"
  //             element={<SingleSubconcept />}
  //           />
  //         </Route>
  //       </Routes>
  //     </main>
  //   </>
  // );
}
