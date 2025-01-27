import Dashboard from "@/components/Dashboard.tsx";
import Header2 from "../../components/Header2.tsx";
import { useEffect, useState } from "react";
import WelcomeModal from "@/components/modals/WelcomeModal.tsx";
import { useUserContext } from "@/context/AuthContext.tsx";

export const HomePage = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const { user } = useUserContext();
  const selectedProgramId = localStorage.getItem("selectedProgramId");

  const backgroundUrl = selectedProgramId === "PET-Level-1" ? "/images/18.svg" : "/images/index.png";

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
        {/* Background Image */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-80 w-full shadow-inner-black"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        >
          {/* Shadow Overlay */}
          {/* <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/10" /> */}
        </div>

        {/* Center Image */}
        {selectedProgramId !== "PET-Level-1" &&
        <div className="fixed inset-0 flex items-center justify-center">
          <img
            src="/images/main_image.png"
            alt="Center Image"
            className="w-[20%] h-auto"
          />
        </div>
        }
        {/* Flying Bird GIF */}
        {/* <div className="absolute w-screen z-50 animate-fly">
            <img
              src="/images/pajaro.gif"
              alt="Flying Bird"
              className="w-32 h-auto"
            />
          </div> */}

        <div className="relative z-10 flex flex-1 no-scrollbar overflow-scroll min-h-screen">
          <Header2 />
          <Dashboard />
        </div>

        {showWelcome && user.userName && user.program.programName && (
          <WelcomeModal
            userName={user.userName}
            programName={user.program.programName}
            onClose={() => setShowWelcome(false)}
          />
        )}
      </div>
    </>
  );
};
