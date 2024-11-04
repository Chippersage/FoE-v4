import Dashboard from "@/components/Dashboard.tsx";
import Header2 from "../../components/Header2.tsx";
import { useEffect, useState } from "react";
import WelcomeModal from "@/components/WelcomeModal.tsx";
import { useUserContext } from "@/context/AuthContext.tsx";

export const HomePage = () => {

    const [showWelcome, setShowWelcome] = useState(false);
    const { user } = useUserContext();

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
        <div className="flex flex-1 custom-scrollbar-2 overflow-scroll">
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
      </>
    );
}