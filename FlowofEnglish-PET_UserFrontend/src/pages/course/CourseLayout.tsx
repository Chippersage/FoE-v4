// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

/**
 * CourseLayout Component
 * 
 * CRITICAL ARCHITECTURAL FIX:
 * - Separates Sidebar from CoursePage
 * - Sidebar exists OUTSIDE the CoursePage render cycle
 * - Sidebar never re-renders when CoursePage content changes
 * - This is the KEY to fixing the 45-day re-render problem
 */
const CourseLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsSidebarOpen(prev => !prev);
    };

    // Listen for toggle events from navbar hamburger
    window.addEventListener('toggleCourseSidebar', handleToggleSidebar);

    return () => {
      window.removeEventListener('toggleCourseSidebar', handleToggleSidebar);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white overflow-hidden">
      {/* MOBILE SIDEBAR OVERLAY - Slides in from left when hamburger is clicked */}
      <div className={`md:hidden fixed inset-0 z-[100] transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="absolute inset-0 bg-transparent" onClick={closeSidebar} />
        <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
          {/* REMOVED the "Course Menu" heading and close button - just show sidebar directly */}
          <div className="h-full overflow-y-auto">
            <Sidebar />
          </div>
        </div>
      </div>
      
      {/* DESKTOP SIDEBAR - Fixed on left */}
      <div className="hidden md:block w-72 h-screen border-r border-gray-300 z-30 bg-white overflow-hidden">
        <div className="h-full flex flex-col">
          <Sidebar />
        </div>
      </div>
      
      {/* MAIN CONTENT AREA - CoursePage renders here via Outlet */}
      <div className="flex-1 flex flex-col h-screen md:h-screen overflow-hidden">
        <div className="flex-1 overflow-auto">
          {/* Pass sidebar state to child pages */}
          <Outlet context={{ isSidebarOpen, closeSidebar }} />
        </div>
      </div>
    </div>
  );
};

// CRITICAL: Memoize the layout to prevent re-renders
export default React.memo(CourseLayout);