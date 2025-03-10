// @ts-nocheck
// import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "@/context/AuthContext";
import "../Styles/Header2.css";
import { useSession } from "@/context/TimerContext";
// Import the logout image

const Header2 = () => {
  const { user, selectedCohort, setIsAuthenticated } = useUserContext();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const { resetSession } = useSession();


  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/users/logout`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      setIsAuthenticated(false);
      // Clear user info and setUser to null after logout
      localStorage.removeItem("authToken");
      localStorage.removeItem("userType");
      localStorage.removeItem("user");
      localStorage.removeItem("hasSeenWelcome");
      localStorage.removeItem("cohortReminder");
      localStorage.removeItem("selectedProgramId");
      localStorage.removeItem("allUnitsOfCurrentStage");
      localStorage.removeItem("currentUnit");
      localStorage.removeItem("isProgramCompletionAlreadyCelebrated");
      localStorage.removeItem("userData");
      localStorage.removeItem("userId");
      resetSession()
      // Cookies.remove("JSESSIONID", { path: "/" });
      // Navigate the user to the login page
      navigate("/sign-in");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="header2 mt-[66px]">
      <div className="flex items-center justify-start flex-1 text-nowrap">
        <img
          src={"/icons/User-icons/home-icon.png"}
          alt="Home"
          onClick={() => navigate("/")}
          style={{
            width: "25px",
            height: "25px",
            cursor: "pointer",
            marginRight: "5px",
          }}
          title="Go to Home"
        />
        <h3 className="hellohead text-white font-openSans">
          {user ? `Welcome, ${user.userName}` : "Welcome, Guest"}
        </h3>
      </div>
      <div className="sm:flex flex-1 hidden">
        <h3 className="hellohead mx-auto text-white font-openSans">
          {selectedCohort
            ? `${user?.program?.programName}`
            : ""}
          {/* Show "Continue as Guest" if user is null */}
        </h3>
      </div>
      <div className="logout-button flex-1 flex justify-end">
        {user && (
          <span
            onClick={handleLogout}
            className="text-white cursor-pointer font-openSans"
          >
            Logout
          </span>

          // <img
          //   src={"/icons/User-icons/exit.png"} // Set the source to the logout image
          //   alt="Logout"
          //   className="logout-icon"
          //   onClick={handleLogout} // Attach the logout handler to the image
          //   style={{ width: "30px", height: "30px", cursor: "pointer" }} // Set size and make clickable
          //   title="Logout"
          // />
        )}
      </div>
    </div>
  );
};

export default Header2;
