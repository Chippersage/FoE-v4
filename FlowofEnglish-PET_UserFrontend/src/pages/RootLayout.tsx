// @ts-nocheck
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

const NAVBAR_HEIGHT = "h-14"; // 56px

const RootLayout = () => {
  const location = useLocation();

  const hideNavbarRoutes = ["/sign-in"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  const isMentorRoute = location.pathname.startsWith("/mentor");
  const [isMentorSidebarOpen, setIsMentorSidebarOpen] = useState(false);

  const toggleMentorSidebar = () => {
    setIsMentorSidebarOpen(prev => !prev);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      
      {!hideNavbar && (
        <div className={`shrink-0 ${NAVBAR_HEIGHT}`}>
          <Navbar
            toggleSidebar={isMentorRoute ? toggleMentorSidebar : undefined}
          />
        </div>
      )}

      {/* IMPORTANT: no overflow-hidden here */}
      <div className="flex-1 min-h-0">
        <Outlet />
      </div>

    </div>
  );
};

export default RootLayout;
