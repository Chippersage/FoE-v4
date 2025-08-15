// @ts-nocheck
import React, { useEffect, useState } from "react";
import { EyeIcon, EyeSlashIcon, BuildingOfficeIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { useUserContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import mainLogo from "@/assets/Img/main-logo.png";
import { ErrorModal } from "@/components/ErrorModal";


export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  // const [programs, setPrograms] = useState([]);
  // const [isProgramsOpen, setIsProgramsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { checkAuthUser } = useUserContext();
  const navigate = useNavigate();
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedProgramName, setSelectedProgramName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [userRole, setUserRole] = useState("Learner");
  const [showErrorModalOpen, setShowErrorModalOpen] = useState(false);
    const [errorModalData, setErrorModalData] = useState(
      null
    );

  // Fetch programs from API when the component mounts
    // useEffect(() => {
    //   const fetchPrograms = async () => {
    //     try {
    //       const response = await axios.get(`${API_BASE_URL}/programs`);
    //       setPrograms(response.data);
    //       // console.log(response.data)
    //     } catch (err) {
    //       console.error("Error fetching programs:", err);
    //       setError("Unable to fetch programs. Please try again.");
    //     }
    //   };

    //   fetchPrograms();
    // }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true);
    try {
      const login = await axios.post(
        `${API_BASE_URL}/users/signin`,
        {
          userId: userId,
          userPassword: password,
          // programId: selectedProgramId, // Send the selected program ID
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

      // const { sessionId, userType, userDetails, cohortReminder } = login.data;
      const { userType, userDetails, assignmentStatistics } = login.data;

      // localStorage.setItem("tempSessionId", tempSessionId);
      // localStorage.setItem("userType", userType);
      // (cohortReminder && cohortReminder !== null && cohortReminder !== undefined) && localStorage.setItem("cohortReminder", cohortReminder);
      const mergedUserDetails = {
        ...userDetails,
        assignmentStatistics: assignmentStatistics || null, // optional chaining to be safe
        userType
      };

      localStorage.setItem("user", JSON.stringify(mergedUserDetails));


      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        // console.log("Signin Successful!");
        navigate("/select-cohort");
      } else {
        setError("Oops!, Login failed. Please try again.");
        // console.log("Oops!, Login failed. Please try again.");
      }
    } catch (error) {
      // @ts-ignore
      let errorMessage = "An unexpected error occurred.";
      let deactivationDetails = "";
      let contactInfo = "";

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;

        // Optional: you can structure this however your backend sends data
        deactivationDetails = error.response.data.deactivationDetails;
        contactInfo = error.response.data.contactInfo;
      } else if (error.request) {
        errorMessage = "No response from server. Please try again later.";
      } else {
        errorMessage = error.message || "Unexpected error occurred.";
      }

      // Only show ErrorModal if there are additional details beyond just the error message
      if (deactivationDetails || contactInfo) {
        setErrorModalData({
          error: errorMessage,
          deactivationDetails,
          contactInfo,
        });
        setShowErrorModalOpen(true);
      }

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
    <>
      {showErrorModalOpen && (
        <ErrorModal
          isOpen={showErrorModalOpen}
          onClose={() => setShowErrorModalOpen(false)}
          errorModalData={errorModalData || undefined}
        />
      )}
      
      {/* Clean Professional Corporate Login Design */}
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 w-full">
        <div className="w-full max-w-md">
          {/* Simple Professional Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4">
              <img src="/icons/mindful_logo_circle.png" alt="Company Logo" className="w-24 h-24 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">mindfultalk.in</h1>
            <p className="text-slate-600 text-sm">Advancing Professional Excellence</p>
          </div>

          {/* Clean Professional Login Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Welcome Back
              </h2>
              <p className="text-slate-600">Sign in to continue your learning journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Professional User ID Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  placeholder="Enter your user ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 text-slate-900 placeholder-slate-400"
                  required
                />
              </div>

              {/* Professional Password Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 text-slate-900 placeholder-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Professional Role Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Access Level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    userRole === "Learner" 
                      ? "border-orange-500 bg-orange-50 text-orange-700" 
                      : "border-slate-300 hover:border-slate-400 text-slate-700"
                  }`}>
                    <input
                      type="radio"
                      name="userRole"
                      value="Learner"
                      checked={userRole === "Learner"}
                      onChange={() => setUserRole("Learner")}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <AcademicCapIcon className="w-5 h-5 mr-2" />
                      <span className="font-medium">Learner</span>
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    userRole === "Mentor" 
                      ? "border-orange-500 bg-orange-50 text-orange-700" 
                      : "border-slate-300 hover:border-slate-400 text-slate-700"
                  }`}>
                    <input
                      type="radio"
                      name="userRole"
                      value="Mentor"
                      checked={userRole === "Mentor"}
                      onChange={() => setUserRole("Mentor")}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                      <span className="font-medium">Mentor</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Professional Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-sm"
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Professional Support Links */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex flex-col space-y-3 text-center">
                <a
                  href="mailto:support@mindfultalk.in?subject=Platform%20Support%20Request"
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors duration-200"
                >
                  Need technical support?
                </a>
                <a
                  href="mailto:support@mindfultalk.in?subject=Platform%20Account%20Request"
                  className="text-slate-600 hover:text-slate-700 text-sm transition-colors duration-200"
                >
                  Request new account access
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

