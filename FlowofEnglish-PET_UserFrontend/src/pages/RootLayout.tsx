// @ts-nocheck
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

const RootLayout = () => {
  const location = useLocation();

  // Hide Navbar only on auth pages
  const hideNavbarRoutes = ["/sign-in"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  // For mentor sidebar toggle (if mentor route)
  const isMentorRoute = location.pathname.startsWith("/mentor");
  const [isMentorSidebarOpen, setIsMentorSidebarOpen] = useState(false);

  const toggleMentorSidebar = () => {
    setIsMentorSidebarOpen(!isMentorSidebarOpen);
    // You would also need to handle mentor sidebar display here
    console.log("Toggle mentor sidebar");
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {!hideNavbar && (
        <Navbar 
          toggleSidebar={isMentorRoute ? toggleMentorSidebar : undefined}
        />
      )}
      {/* Main content area that will scroll */}
      <main className={`flex-1 overflow-y-auto ${!hideNavbar ? "pt-14" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;