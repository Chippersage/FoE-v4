// @ts-nocheck
import React from 'react';
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
  return (
    <div className="flex flex-col md:flex-row h-screen bg-white overflow-hidden">
      {/* DESKTOP SIDEBAR - FIXED POSITION, STABLE */}
      <div className="hidden md:block fixed left-0 top-0 h-screen w-72 z-30">
        <Sidebar />
      </div>
      
      {/* MAIN CONTENT AREA - CoursePage renders here via Outlet */}
      <div className="flex-1 flex flex-col md:ml-72">
        <Outlet />
      </div>
    </div>
  );
};

// CRITICAL: Memoize the layout to prevent re-renders
export default React.memo(CourseLayout);