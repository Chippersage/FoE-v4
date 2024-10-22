import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useUserContext } from "../../context/AuthContext";
import logo from "../../assets/Img/main-logo.png";
import "../../Styles/Login.css";
import axios from "axios";

const LoginForm = () => {
  const { checkAuthUser } = useUserContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch programs from API when the component mounts
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/v1/programs"
        );
        setPrograms(response.data); // assuming the response is the array of programs
      } catch (err) {
        console.error("Error fetching programs:", err);
        setError("Unable to fetch programs. Please try again.");
      }
    };

    fetchPrograms();
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const login = await axios.post(
        "http://localhost:8080/api/v1/users/login",
        {
          userId: email,
          userPassword: password,
          programId: selectedProgramId, // Send the selected program ID
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!login.data) {
        setError("Oops!, Something went wrong. Please try again.");
        console.log("Invalid email or password, or Account doesn't exist");
        return;
      }

      console.log("User data from backend", login.data);

      const { sessionId, userType, userDetails } = login.data;

      localStorage.setItem("authToken", sessionId);
      localStorage.setItem("userType", userType);
      localStorage.setItem("user", JSON.stringify(userDetails));

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        console.log("Signin Successful!");
        navigate("/");
      } else {
        setError("Oops!, Login failed. Please try again.");
        console.log("Oops!, Login failed. Please try again.");
      }
    } catch (error) {
      setError("Oops!, Login failed. Please try again.");
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    email.trim() !== "" && password.trim() !== "" && selectedProgramId !== "";

  return (
    <div className="main_login">
      <div className="login_card">
        <div className="login-card-body">
          <div className="login-img-div">
            <img src={logo} alt="Logo" />
          </div>
          <form className="login-form" onSubmit={handleLogin}>
            <h2 className="login-main_heading">Log In</h2>
            <div className="login-position-relative">
              <input
                type="text"
                id="login_email"
                placeholder="Enter Your userid"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {/* <span
                className="info-icon"
                data-tooltip="The email that you used during the sign-up process."
              >
                <FontAwesomeIcon icon={faInfoCircle} />
              </span> */}
            </div>
            <div className="login-position-relative">
              <input
                type={showPassword ? "text" : "password"}
                id="login_password"
                placeholder="Enter Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {/* <span
                className="info-icon"
                data-tooltip="Your password must be at least 8 characters long."
              >
                <FontAwesomeIcon icon={faInfoCircle} />
              </span> */}
              <span
                className="login-eye-toggle-password"
                onClick={togglePasswordVisibility}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>

            {/* Program Select Field */}
            <div className="login-position-relative">
              <select
                id="login_programs"
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a Program
                </option>
                {programs.map((program) => (
                  <option key={program.uuid} value={program.programId}>
                    {program.programName}
                  </option>
                ))}
              </select>
              <span
                className="info-icon"
                data-tooltip="Select the program you are enrolled in."
              >
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
            </div>

            {error && <div className="text-danger text-center">{error}</div>}
            <div className="login-button-main">
              <button
                type="submit"
                className="login-btn-sub"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
