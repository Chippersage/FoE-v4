/* eslint-disable */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

// components
import { useUser } from 'src/UserContext';
import ReminderPopup from './ReminderPopup';
// ----------------------------------------------------------------------

export default function LoginFormOrg() {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const { setUserType, setOrgId } = useUser();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [orgPassword, setOrgPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cohortReminders, setCohortReminders] = useState([]);
  const [showReminders, setShowReminders] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/organizations/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationAdminEmail: username, orgPassword: orgPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
        return;
      }

      const orgData = await response.json();
      if (orgData.organizationId) {
        localStorage.setItem('token', 'dummyToken'); // Set token as needed
        // Store the orgId in localStorage
        localStorage.setItem('orgId', orgData.organizationId);
        localStorage.setItem('userType', 'orgAdmin');
        setUserType('orgAdmin');
        setOrgId(orgData.organizationId);
        setCohortReminders(orgData.cohortReminders || []);
        setShowReminders(true); // Show reminder popup when login is successful
        navigate(`/org-dashboards/${orgData.organizationId}/app`, { replace: true });
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Error during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuperadmin = () => {
    navigate('/login');
  };

  const handleForgotPassword = () => {
    navigate('/forgot');
  };

  const handlePopupClose = () => {
    setShowReminders(false);
    setCohortReminders([]);
  };

  return (
    <>
      {showReminders && <ReminderPopup reminders={cohortReminders} onClose={handlePopupClose} />}
      <div className="w-full flex flex-col items-center">
        <div className="mb-8">
          {/* <img src="/assets/main-logo.png" alt="flowofenglish Logo" className="h-16" /> */}
          <img
          src="/assets/mindful_logo_circle.png"
          alt="Mindfultalk Logo"
          className="h-24 w-24 md:h-32 md:w-32"
        />
        </div>

        <div className="w-full max-w-md bg-white rounded-lg shadow-md md:p-8 p-4">
          <h2 className="md:text-3xl text-xl font-semibold text-center text-gray-800 mb-8">Login to Admin Account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="email"
                placeholder="Admin Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5bc3cd]"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={orgPassword}
                onChange={(e) => setOrgPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5bc3cd]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>

            {error && <p className="text-red-600 text-center text-sm font-medium">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#5bc3cd] hover:bg-[#DB5788] text-white font-bold py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <button onClick={handleSuperadmin} className="text-[#5bc3cd] hover:underline block w-full">
              Go to SuperAdmin
            </button>
            <button onClick={handleForgotPassword} className="text-[#5bc3cd] hover:underline block w-full">
              Forgot Password?
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
