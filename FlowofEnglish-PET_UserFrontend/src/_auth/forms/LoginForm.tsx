// @ts-nocheck
import React, { useState } from "react";
import axios from "axios";
import {
  EyeIcon,
  EyeSlashIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/AuthContext";
import { ErrorModal } from "../../components/modals/ErrorModal";

const LoginPage = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("Learner");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showErrorModalOpen, setShowErrorModalOpen] = useState(false);
  const [errorModalData, setErrorModalData] = useState(null);

  const navigate = useNavigate();
  const { checkAuthUser } = useUserContext();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/users/signin`,
        { userId, userPassword: password, userType: userRole },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      const { userType, userDetails, assignmentStatistics } = res.data;
      const mergedUserDetails = {
        ...userDetails,
        assignmentStatistics,
        userType,
      };
      localStorage.setItem("user", JSON.stringify(mergedUserDetails));

      const isLoggedIn = await checkAuthUser();
      if (isLoggedIn) navigate("/select-cohort");
      else setError("Oops! Login failed. Please try again.");
    } catch (err) {
      const message =
        err.response?.data?.error || "An unexpected error occurred.";
      setError(message);

      // Handle specific deactivation or contact info errors
      if (
        err.response?.data?.deactivationDetails ||
        err.response?.data?.contactInfo
      ) {
        setErrorModalData({
          error: message,
          deactivationDetails: err.response.data.deactivationDetails,
          contactInfo: err.response.data.contactInfo,
        });
        setShowErrorModalOpen(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* --- ERROR MODAL --- */}
      {showErrorModalOpen && (
        <ErrorModal
          isOpen={showErrorModalOpen}
          onClose={() => setShowErrorModalOpen(false)}
          errorModalData={errorModalData || undefined}
        />
      )}

      {/* Centered container for card */}
      <div className="flex justify-center min-h-screen items-center bg-[#F8FAFB]">
        <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-8">
          {/* Logo + Title */}
          <div className="text-center mb-6">
            <img
              src="/icons/FoE_logo.png"
              alt="Company Logo"
              className="mx-auto w-16 h-16 sm:w-20 sm:h-20 object-contain mb-3"
            />
            <h1 className="text-2xl font-bold text-slate-800">
              Flow of English
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Master English, One Step at a Time
            </p>
          </div>

          {/* --- FORM STARTS HERE --- */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User ID Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your user ID"
                required
                className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-3 py-2 pr-10 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Access Level (Learner/Mentor) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Access Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Learner", "Mentor"].map((role) => (
                  <label
                    key={role}
                    className={`flex items-center justify-center py-2 rounded-md border cursor-pointer transition ${
                      userRole === role
                        ? "border-[#0EA5E9] bg-[#E0F7FE] text-[#0EA5E9]"
                        : "border-slate-300 hover:border-slate-400 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="userRole"
                      value={role}
                      checked={userRole === role}
                      onChange={() => setUserRole(role)}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      {role === "Learner" ? (
                        <AcademicCapIcon className="w-4 h-4 mr-1.5" />
                      ) : (
                        <BuildingOfficeIcon className="w-4 h-4 mr-1.5" />
                      )}
                      <span className="text-sm font-medium">{role}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2 text-center">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] disabled:bg-[#7DD3FC] text-white font-medium text-sm py-2 rounded-md transition"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Support Section */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-center space-y-2">
            <a
              href="mailto:support@chippersage.com?subject=Platform%20Support%20Request"
              className="text-[#0EA5E9] hover:text-[#0284C7] text-sm font-medium"
            >
              Need technical support?
            </a>
            <br />
            <a
              href="mailto:support@chippersage.com?subject=Platform%20Account%20Request"
              className="text-slate-600 hover:text-slate-700 text-sm"
            >
              Request new account access
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
