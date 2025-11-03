// @ts-nocheck
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

const RootLayout = () => {
  const location = useLocation();

  // Hide Navbar only on auth pages
  const hideNavbarRoutes = ["/sign-in"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      {!hideNavbar && <Navbar />}
      {/* Add top padding if navbar is visible (since it's fixed) */}
      <main className={`${!hideNavbar ? "pt-16" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;