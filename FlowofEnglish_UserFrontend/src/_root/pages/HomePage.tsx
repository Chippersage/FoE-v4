// @ts-nocheck
import Dashboard from "@/components/Dashboard.tsx";
import Header2 from "../../components/Header2.tsx";
import { useEffect, useState } from "react";
import WelcomeModal from "@/components/modals/WelcomeModal.tsx";
import { useUserContext } from "@/context/AuthContext.tsx";

export const HomePage = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const { user, selectedCohortWithProgram } = useUserContext();
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null); // Start with null
  const [isLoading, setIsLoading] = useState(true); // Loader state
  // const selectedProgramId = localStorage.getItem("selectedProgramId");
  console.log(selectedCohortWithProgram);

  useEffect(() => {
    // const selectedProgramId = localStorage.getItem("selectedProgramId");

    if (selectedCohortWithProgram) {
      // If `selectedProgramId` is not set, wait for `user` to load
      // if (user && user.program && user.program.programId) {
      //   const programId = user.program.programId;
      //   localStorage.setItem("selectedProgramId", programId);

      // Set background URL dynamically
      setBackgroundUrl(
        selectedCohortWithProgram?.program?.programId.startsWith("PET")
          ? "/images/PET-background-1.png"
          : "/images/index.png"
      );

      setIsLoading(false); // Background determined, stop loading
    }
  }, [selectedCohortWithProgram]);

  // const backgroundUrl =
  //   selectedProgramId === "PET-Level-1"
  //     ? "/images/PET-background-1.png"
  //     : "/images/index.png";

  useEffect(() => {
    // Check if the welcome modal has already been shown
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");

    if (!hasSeenWelcome) {
      setShowWelcome(true); // Show the modal
      localStorage.setItem("hasSeenWelcome", "true"); // Set the flag so it doesn’t show again
    }
  }, []);

  return (
    <>
      <div className="relative w-full min-h-full no-scrollbar">
        {/* Show Loader until backgroundUrl is ready */}
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

            <div className="relative z-10 flex flex-1 no-scrollbar overflow-scroll min-h-screen">
              {/* <Header2 /> */}
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
