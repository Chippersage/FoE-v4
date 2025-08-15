// @ts-nocheck
import Dashboard from "@/components/Dashboard";
import { useEffect, useState } from "react";
import WelcomeModal from "@/components/modals/WelcomeModal";
import { useUserContext } from "@/context/AuthContext";
import DashboardTour from "@/components/tours/DashboardTour.js";

export const HomePage = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const { user, selectedCohortWithProgram } = useUserContext();
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (selectedCohortWithProgram) {
      setBackgroundUrl(
        selectedCohortWithProgram?.program?.programId.startsWith("PET")
          ? "/images/PET-New-Bg.jpg"
          : "/images/index.png"
      );
      setIsLoading(false);
    }
  }, [selectedCohortWithProgram]);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setShowWelcome(true);
      localStorage.setItem("hasSeenWelcome", "true");
    }
  }, []);

  return (
    <>
      <div className="relative w-full h-full no-scrollbar bg-white">
        {isLoading ? (
          <div className="fixed inset-0 flex items-center justify-center bg-white">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-orange-500"></div>
              <p className="mt-4 text-slate-600 font-medium">Loading your learning dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Professional Clean Background */}
            <div className="fixed inset-0 bg-slate-50"></div>
            
            {/* Subtle top border */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-orange-500"></div>

            <div className="relative z-10 h-full">
              <Dashboard />
            </div>

            {showWelcome && user?.userName && user?.program?.programName && (
              <WelcomeModal
                userName={user.userName}
                programName={user.program.programName}
                onClose={() => setShowWelcome(false)}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};
