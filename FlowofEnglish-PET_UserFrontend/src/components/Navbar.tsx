"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import imageLogo from "../assets/images/mindful_logo_circle.png";

type NavbarProps = {
  toggleSidebar: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const userName = "Shajad"; // You can replace this dynamically later

  const menuItems = [
    { title: "Profile" },
    { title: "View Progress" },
    { title: "About Program" },
    { title: "Help" },
    { title: "Terms of Use" },
  ];

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="flex items-center justify-between px-4 py-2 h-14">
        {/* Sidebar Toggle (Visible on Mobile) */}
        <button
          onClick={toggleSidebar}
          className="md:hidden text-gray-700 text-2xl font-bold"
        >
          ☰
        </button>

        {/* Branding */}
        <div className="flex items-center gap-2">
          <img
            src={imageLogo}
            alt="Logo"
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-lg font-semibold text-gray-800">mindfultalk.in</h1>
        </div>

        {/* Right Section: Username + Avatar */}
        <div className="flex items-center gap-3 relative">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm text-gray-500">Welcome back,</span>
            <span className="text-sm font-medium text-gray-800">{userName}</span>
          </div>

          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold shadow-md cursor-pointer select-none"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            {userName.charAt(0).toUpperCase()}
          </div>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
                className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                onMouseEnter={() => setMenuOpen(true)}
                onMouseLeave={() => setMenuOpen(false)}
              >
                {menuItems.map((item, idx) => (
                  <button
                    key={idx}
                    className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    {item.title}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
