// import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "@/context/AuthContext";
import "../Styles/Header2.css";
// Import the logout image
import logoutImage from "../assets/Img/logout.png";

const Header2 = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/v1/users/logout",
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Clear user info and setUser to null after logout
      localStorage.removeItem("authToken");
      localStorage.removeItem("userType");
      localStorage.removeItem("user");
      // Cookies.remove("JSESSIONID", { path: "/" });
      // Navigate the user to the login page
      navigate("/sign-in");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="page-row header2 mt-20">
      <h3
        className="hellohead"
        style={{ fontSize: "18px", fontWeight: "normal", color: "#262525" }}
      >
        {user ? `Hello, ${user.userName}` : "Hello, Guest"}
      </h3>
      <h3
        className="hellohead mx-auto"
        style={{ fontSize: "18px", fontWeight: "normal", color: "#262525" }}
      >
        {user ? `Continue, ${user.program.programName}` : "Continue as Guest"}{" "}
        {/* Show "Continue as Guest" if user is null */}
      </h3>
      <div className="logout-button">
        {user && (
          <img
            src={logoutImage} // Set the source to the logout image
            alt="Logout"
            className="logout-icon"
            onClick={handleLogout} // Attach the logout handler to the image
            style={{ width: "40px", height: "30px", cursor: "pointer" }} // Set size and make clickable
          />
        )}
      </div>
    </div>
  );
};

export default Header2;
