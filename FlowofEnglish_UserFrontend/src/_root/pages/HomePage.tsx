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
          ? "/images/PET-background-1.png"
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
      <div className="relative w-full h-full no-scrollbar">
        {isLoading ? (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
          </div>
        ) : (
          <>
            {/* Background Image */}
            <div
              className="fixed inset-0 bg-cover bg-center bg-no-repeat bg-fixed w-full"
              style={{
                backgroundImage: `url(${backgroundUrl})`,
                marginTop: "100px",
              }}
            ></div>

            {/* Center Image */}
            {backgroundUrl === "/images/index.png" && (
              <div className="fixed inset-0 flex items-center justify-center">
                <img
                  src="/images/main_image.png"
                  alt="Center Image"
                  className="w-[20%] h-auto"
                />
              </div>
            )}

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
