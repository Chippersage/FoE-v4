// @ts-nocheck
import React, { useEffect, useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { useUserContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import mainLogo from "@/assets/Img/main-logo.png";


export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [programs, setPrograms] = useState([]);
  const [isProgramsOpen, setIsProgramsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { checkAuthUser } = useUserContext();
  const navigate = useNavigate();
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedProgramName, setSelectedProgramName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [userRole, setUserRole] = useState("Learner");

  // Fetch programs from API when the component mounts
    useEffect(() => {
      const fetchPrograms = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/programs`);
          setPrograms(response.data);
          // console.log(response.data)
        } catch (err) {
          console.error("Error fetching programs:", err);
          setError("Unable to fetch programs. Please try again.");
        }
      };

      fetchPrograms();
    }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true);
    try {
      const login = await axios.post(
        `${API_BASE_URL}/users/login`,
        {
          userId: userId,
          userPassword: password,
          programId: selectedProgramId, // Send the selected program ID
          userType: userRole,
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
        // console.log("Invalid email or password, or Account doesn't exist");
        return;
      }

      console.log("User data from backend", login.data);

      const { sessionId, userType, userDetails, cohortReminder } = login.data;

      localStorage.setItem("authToken", sessionId);
      localStorage.setItem("userType", userType);
      (cohortReminder && cohortReminder !== null && cohortReminder !== undefined) && localStorage.setItem("cohortReminder", cohortReminder);
      localStorage.setItem("user", JSON.stringify(userDetails));

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        // console.log("Signin Successful!");
        navigate("/");
      } else {
        setError("Oops!, Login failed. Please try again.");
        // console.log("Oops!, Login failed. Please try again.");
      }
    } catch (error) {
      // @ts-ignore
      setError(error.response.data.error);
      // console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen md:bg-gray-100 w-full flex flex-col items-center md:p-4">
      <div className="mb-8 mt-8">
        <img src={mainLogo} alt="flowofenglish Logo" className="h-15" />
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-md md:p-8 p-4">
        <h2 className="md:text-3xl text-xl font-semibold text-center text-gray-800 mb-8">
          Login to your <br /> Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5bc3cd]"
              required
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5bc3cd]"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                // if (!programs.length) fetchPrograms();
                setIsProgramsOpen(!isProgramsOpen);
              }}
              className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5bc3cd]"
            >
              {selectedProgramName || "Select Program"}
            </button>
            {isProgramsOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg h-44 overflow-y-auto">
                {programs.map((program) => (
                  <div
                    // @ts-ignore
                    key={program?.programId}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      // @ts-ignore
                      setSelectedProgramId(program?.programId);

                      localStorage.setItem("selectedProgramId", program?.programId);
                      // @ts-ignore
                      setSelectedProgramName(program?.programName);
                      setIsProgramsOpen(false);
                    }}
                  >
                    {/* @ts-ignore */}
                    {program?.programName}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-sm text-gray-600 px-4">
            <label className="font-medium">Sign in as:</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="userRole"
                  value="Learner"
                  checked={userRole === "Learner"}
                  onChange={() => setUserRole("Learner")}
                  className="mr-2 rounded-sm border-gray-400 focus:ring-[#5bc3cd] text-sm"
                />
                Learner
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="userRole"
                  value="Mentor"
                  checked={userRole === "Mentor"}
                  onChange={() => setUserRole("Mentor")}
                  className="mr-2 rounded-sm border-gray-400 focus:ring-[#5bc3cd] text-sm"
                />
                Mentor
              </label>
            </div>
          </div>

          <p className="text-red-600 text-center text-sm font-medium mt-8">
            {error}
          </p>

          <button
            type="submit"
            className="w-full bg-[#5bc3cd] hover:bg-[#DB5788] text-white font-bold py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <a
            href="mailto:support@thechippersage.com?subject=Flow%20Of%20English%3A%20Help%20Request"
            className="text-[#5bc3cd] hover:underline block"
          >
            Need help? Click here
          </a>
          <a
            href="mailto:support@thechippersage.com?subject=Flow%20Of%20English%3A%20Create%20a%20new%20Account"
            className="text-[#5bc3cd] hover:underline block"
          >
            Want to signup? Click here
          </a>
        </div>
      </div>
    </div>
  );
}

