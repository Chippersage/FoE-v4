import { Route, Routes } from "react-router-dom";
import LoginForm from "./_auth/forms/LoginForm.tsx";
import { HomePage } from "./_root/pages/HomePage.tsx";
import SubConceptsPage from "./_root/pages/SubConceptsPage.tsx";
import AuthLayout from "./_auth/AuthLayout.tsx";
import RootLayout from "./_root/RootLayout";
import SingleSubconcept from "./_root/pages/SingleSubconcept.tsx";

export default function App() {

  return (
    <>
      <main className="flex h-screen">
        <Routes>
          {/* public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/sign-in" element={<LoginForm />} />
          </Route>

          {/* Redirect root path "/" to either /home or /login based on authentication */}
          {/* <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />
            }
          /> */}

          {/* private routes */}
          <Route element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/subconcepts/:unitId" element={<SubConceptsPage />} />
            <Route path="/subconcept/:subconceptId" element={<SingleSubconcept />} />
          </Route>
        </Routes>
      </main>
    </>
  );
}
