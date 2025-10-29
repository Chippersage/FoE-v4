// @ts-nocheck
import React, { useState } from "react";
import axios from "axios";
import { EyeIcon, EyeSlashIcon, BuildingOfficeIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
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

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/users/signin`,
        { userId, userPassword: password, userType: userRole },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      const { userType, userDetails, assignmentStatistics } = res.data;
      const mergedUserDetails = { ...userDetails, assignmentStatistics, userType };
      localStorage.setItem("user", JSON.stringify(mergedUserDetails));

      const isLoggedIn = await checkAuthUser();
      if (isLoggedIn) navigate("/select-cohort");
      else setError("Oops! Login failed. Please try again.");
    } catch (err) {
      const message = err.response?.data?.error || "An unexpected error occurred.";
      setError(message);
      if (err.response?.data?.deactivationDetails || err.response?.data?.contactInfo) {
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
      {showErrorModalOpen && (
        <ErrorModal
          isOpen={showErrorModalOpen}
          onClose={() => setShowErrorModalOpen(false)}
          errorModalData={errorModalData || undefined}
        />
      )}

      <div className="w-full flex justify-center items-center px-4 sm:px-6 md:px-8 lg:px-0">
        <div className="w-full max-w-md lg:max-w-lg bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 md:p-10">
          
          {/* Logo + Title */}
          <div className="text-center mb-8">
            <img
              src="/icons/mindful_logo_circle.png"
              alt="Company Logo"
              className="mx-auto w-20 h-20 sm:w-24 sm:h-24 object-contain mb-3"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">mindfultalk.in</h1>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              Advancing Professional Excellence
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your user ID"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-2.5 pr-12 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Access Level</label>
              <div className="grid grid-cols-2 gap-3">
                {["Learner", "Mentor"].map((role) => (
                  <label
                    key={role}
                    className={`flex items-center justify-center py-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                      userRole === role
                        ? "border-orange-500 bg-orange-50 text-orange-700"
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
                        <AcademicCapIcon className="w-5 h-5 mr-2" />
                      ) : (
                        <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                      )}
                      <span className="font-medium">{role}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium py-2.5 rounded-lg transition-colors duration-200 shadow-sm"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Support Section */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-center space-y-2">
            <a
              href="mailto:support@mindfultalk.in?subject=Platform%20Support%20Request"
              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              Need technical support?
            </a>
            <br />
            <a
              href="mailto:support@mindfultalk.in?subject=Platform%20Account%20Request"
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
