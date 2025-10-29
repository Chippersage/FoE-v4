// @ts-nocheck
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Basic user model
type User = {
  userId: string;
  userName: string;
  userEmail: string;
  userType: "learner" | "mentor" | "";
};

// Initial state for user
const INITIAL_USER_STATE: User = {
  userId: "",
  userName: "",
  userEmail: "",
  userType: "",
};

// Auth context type
interface AuthContextType {
  user: User;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
  selectedCohort: any;
  setSelectedCohort: React.Dispatch<React.SetStateAction<any>>;
}

// Default context values
const INITIAL_STATE: AuthContextType = {
  user: INITIAL_USER_STATE,
  isLoading: false,
  isAuthenticated: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false,
  selectedCohort: null,
  setSelectedCohort: () => {},
};

// Create context
const AuthContext = createContext<AuthContextType>(INITIAL_STATE);

// Provider
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(INITIAL_USER_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState(() => {
    const saved = localStorage.getItem("selectedCohort");
    return saved ? JSON.parse(saved) : null;
  });

  // Check authentication
  const checkAuthUser = async () => {
    setIsLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser && storedUser.userId) {
        setUser(storedUser);
        setIsAuthenticated(true);
        console.log("User is authenticated:", storedUser);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Auth check error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Run check on mount
  useEffect(() => {
    const init = async () => {
      const ok = await checkAuthUser();
      if (!ok) {
        navigate("/sign-in");
        return;
      }

      const currentPath = window.location.pathname;
      if (!selectedCohort && currentPath !== "/select-cohort" && currentPath !== "/sign-in") {
        navigate("/select-cohort");
      }
    };
    init();
  }, [navigate, selectedCohort]);

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useUserContext = () => useContext(AuthContext);