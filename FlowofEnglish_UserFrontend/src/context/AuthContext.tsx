// @ts-nocheck
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type UserCohort = {
  cohortId: string;
  cohortName: string;
  cohortStartDate: number;
  cohortEndDate: number;
  program: INITIAL_USER_PROGRAM_STATE,
};

type INITIAL_USER_PROGRAM_STATE = {
  programId: "";
  programName: "";
  programDesc: "";
  stagesCount: "";
  unitCount: "";
  stages: "";
  programCompletionStatus: "";
};

export const INITIAL_USER_PROGRAM_STATE: INITIAL_USER_PROGRAM_STATE = {};

// Define initial states
export const INITIAL_USER_ORGANISATION_STATE = {
  organizationId: "",
  organizationName: "",
  organizationAdminName: "",
  organizationAdminEmail: "",
  organizationAdminPhone: "",
};

export const INITIAL_USER_COHORTS_STATE: UserCohort[] = [];

export const INITIAL_USER_STATE = {
  userId: "",
  userAddress: "",
  userEmail: "",
  userName: "",
  userPhoneNumber: "",
  organization: INITIAL_USER_ORGANISATION_STATE,
  cohorts: INITIAL_USER_COHORTS_STATE,
  program: INITIAL_USER_PROGRAM_STATE,
};

/// Define initial state for AuthContext
export const INITIAL_STATE = {
  user: INITIAL_USER_STATE,
  isLoading: false,
  isAuthenticated: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false,
};

// Create AuthContext
const AuthContext = createContext(INITIAL_STATE);

// @ts-ignore
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(INITIAL_USER_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState(null);

  // Function to check if the user is authenticated
  const checkAuthUser = async () => {
    setIsLoading(true);
    try {
      // @ts-ignore
      const currentUser = JSON.parse(localStorage.getItem("user"));
      // console.log(currentUser);
      if (currentUser) {
        setUser({
          userId: currentUser.userId,
          userAddress: currentUser.userAddress,
          userEmail: currentUser.userEmail,
          userName: currentUser.userName,
          userPhoneNumber: currentUser.userPhoneNumber,
          organization: currentUser.organization,
          cohorts: currentUser.allCohortsWithPrograms,
          // program: currentUser.program,
        });

        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking auth:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication on mount
useEffect(() => {
  const user = localStorage.getItem("user");
  if (!user) {
    navigate("/sign-in");
  } else {
    checkAuthUser();
    // After successful authentication, redirect to cohort selection
    navigate("/select-cohort");
  }
}, [navigate]);

  // Value to be provided by the context
  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    checkAuthUser,
    selectedCohort,
    setSelectedCohort,
  };
  // @ts-ignore
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useUserContext = () => useContext(AuthContext);
