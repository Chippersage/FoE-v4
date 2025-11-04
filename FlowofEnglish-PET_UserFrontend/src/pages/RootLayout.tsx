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
    <div className="h-screen flex flex-col bg-slate-50"> {/* Changed to flex-col and h-screen */}
      {!hideNavbar && <Navbar />}
      {/* Main content area that will scroll */}
      <main className={`flex-1 overflow-y-auto ${!hideNavbar ? "pt-16" : ""}`}> {/* Added flex-1 and overflow-y-auto */}
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;