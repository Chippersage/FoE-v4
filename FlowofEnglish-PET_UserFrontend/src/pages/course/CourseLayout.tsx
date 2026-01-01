// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import useCourseEntryRedirect from '../course/hooks/useCourseEntryRedirect';

/**
 * CourseLayout Component
 * 
 * - Sidebar & CoursePage scroll independently
 * - Sidebar does NOT re-render on content change
 */
const CourseLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Get URL parameters for redirect logic
  const { programId, stageId, unitId, conceptId } = useParams<{
    programId: string;
    stageId?: string;
    unitId?: string;
    conceptId?: string;
  }>();

  // This hook handles auto-redirect to first not completed subconcept
  // It runs on ALL devices (desktop and mobile)
  useCourseEntryRedirect({
    enabled: Boolean(programId),
  });

  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsSidebarOpen(prev => !prev);
    };

    window.addEventListener('toggleCourseSidebar', handleToggleSidebar);
    return () => {
      window.removeEventListener('toggleCourseSidebar', handleToggleSidebar);
    };
  }, []);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-0 bg-white">

      {/* MOBILE SIDEBAR OVERLAY */}
      <div
        className={`md:hidden fixed inset-0 z-[100] transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute inset-0 bg-transparent" onClick={closeSidebar} />
        <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
          <div className="h-full min-h-0 overflow-y-auto">
            <Sidebar />
          </div>
        </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:block w-72 h-full min-h-0 border-r border-gray-300 bg-white">
        <div className="h-full min-h-0 overflow-y-auto">
          <Sidebar />
        </div>
      </div>

      {/* COURSE CONTENT */}
      <div className="flex-1 flex flex-col h-full min-h-0">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Outlet context={{ isSidebarOpen, closeSidebar }} />
        </div>
      </div>

    </div>
  );
};

export default React.memo(CourseLayout);