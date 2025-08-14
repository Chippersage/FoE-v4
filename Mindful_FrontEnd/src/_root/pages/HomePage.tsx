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
      <div className="relative w-full h-full no-scrollbar bg-slate-50">
        {isLoading ? (
          <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600"></div>
              <p className="mt-4 text-slate-600 font-medium">Loading your learning dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Professional Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100"></div>
            
            {/* Professional header pattern */}
            <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-800/5 to-transparent"></div>

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
