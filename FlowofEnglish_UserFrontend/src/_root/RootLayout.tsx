import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { useState, useEffect, useRef } from "react";
import Header2 from "@/components/Header2";
import { useLocation } from "react-router-dom";

const RootLayout = () => {
  //   const {isLoading: isUserLoading} = useUserContext()
  const [cohortReminder, setCohortReminder] = useState(
    localStorage.getItem("cohortReminder")
  );
  const location = useLocation();
  const isHomePage = location.pathname === "/home";
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Scroll main content to top on location change
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  const handleOnClose = () => {
    localStorage.removeItem("cohortReminder");
    setCohortReminder(null);
  };

  return (
    // <SessionProvider>
    <div className="flex flex-col h-screen">
      {/* Fixed Headers Container */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">
        <Header />
        <Header2 />
      </div>

      {/* Content Container with Header Space */}
      <div
        ref={mainContentRef}
        className={`flex-1 overflow-y-auto ${
          isHomePage ? "mt-[120px] sm:mt-[160px]" : "mt-[100px]"
        }`}
      >
        {/* Announcement Banner */}
        {cohortReminder &&
          cohortReminder !== null &&
          cohortReminder !== undefined && (
            <AnnouncementBanner
              isVisible={true}
              onClose={handleOnClose}
              message={cohortReminder}
            />
          )}

        {/* Main Content */}
        <main
          className={`min-h-[calc(100vh-${
            isHomePage ? "160px" : "100px"
          })] pb-[100px] sm:pb-0`}
        >
          <Outlet />
        </main>
      </div>
    </div>
    // </SessionProvider>
  );
};

export default RootLayout;
