// @ts-nocheck
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import MentorSideNav from "../components/MentorSideNav";
import Navbar from "../../components/Navbar";
import { Menu, X } from "lucide-react";
import { useUserContext } from "../../context/AuthContext";

export default function MentorLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useUserContext();

  const isMentor = user?.userType === "Mentor";
  const isMentorRoute = location.pathname.startsWith("/mentor");
  const hideLayoutHamburger = isMentor && isMentorRoute;

  return (
    <div className="flex min-h-screen bg-gray-50">

      <Navbar toggleSidebar={() => setOpen(true)} />

      {!hideLayoutHamburger && (
        <button
          className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md p-2 rounded-md"
          onClick={() => setOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {open && !hideLayoutHamburger && (
        <button
          className="lg:hidden fixed top-4 right-4 z-50 bg-gray-100 p-2 rounded-md"
          onClick={() => setOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 z-40
          w-64 h-screen
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <MentorSideNav onNavigate={() => setOpen(false)} />
      </div>

      <div className="flex-1 ml-0 lg:ml-64 p-4 pt-14">
        <Outlet />
      </div>
    </div>
  );
}
