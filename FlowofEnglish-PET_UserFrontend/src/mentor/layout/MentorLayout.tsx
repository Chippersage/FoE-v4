// @ts-nocheck
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import MentorSideNav from "../components/MentorSideNav";
import { Menu, X } from "lucide-react";

export default function MentorLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* MOBILE MENU BUTTON */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md p-2 rounded-md"
        onClick={() => setOpen(true)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* MOBILE CLOSE BUTTON */}
      {open && (
        <button
          className="lg:hidden fixed top-4 right-4 z-50 bg-gray-100 p-2 rounded-md"
          onClick={() => setOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {/* BACKDROP WHEN SIDEBAR OPEN */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
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

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-0 lg:ml-64 p-4 pt-14">
        <Outlet />
      </div>
    </div>
  );
}
