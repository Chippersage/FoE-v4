import { createContext, useContext, useEffect, useState, ReactNode } from "react"; 
import { useNavigate } from "react-router-dom";

// Define initial states
export const INITIAL_USER_ORGANISATION_STATE = {
  organizationId: "",
  organizationName: "",
  organizationAdminName: "",
  organizationAdminEmail: "",
  organizationAdminPhone: "",
};

export const INITIAL_USER_COHORT_STATE = {
  cohortId: "",
  cohortName: "",
};

export const INITIAL_USER_PROGRAM_STATE = {
  programId: "",
  programName: "",
  programDesc: "",
};

export const INITIAL_USER_STATE = {
  userId: "",
  userAddress: "",
  userEmail: "",
  userName: "",
  userPhoneNumber: "",
  organization: INITIAL_USER_ORGANISATION_STATE,
  cohort: INITIAL_USER_COHORT_STATE,
  program: INITIAL_USER_PROGRAM_STATE,
};

/// Define initial state for AuthContext
export const INITIAL_STATE = {
  user: null, // Defaulting to null
  isLoading: false,
  isAuthenticated: false,
  setUser: (user: typeof INITIAL_USER_STATE | null) => {}, // Default function, needs to match the expected Dispatch signature
  setIsAuthenticated: (isAuthenticated: boolean) => {},
  checkAuthUser: async () => false,
};

// Correctly type the context value
interface UserContextType {
  user: typeof INITIAL_USER_STATE | null; // Allow user to be null
  setUser: React.Dispatch<React.SetStateAction<typeof INITIAL_USER_STATE | null>>; // Correct typing for setUser
  isLoading: boolean;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  checkAuthUser: () => Promise<boolean>;
}

// Create AuthContext
const AuthContext = createContext<UserContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  setUser: () => {}, // This is a placeholder; React's context will handle it correctly
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false,
});


interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<typeof INITIAL_USER_STATE | null>(null); // Set user state to null initially
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Function to check if the user is authenticated
  const checkAuthUser = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      
      
      if (currentUser?.userDetails) {
        setUser({
          userId: currentUser.userDetails.userId,
          userAddress: currentUser.userDetails.userAddress,
          userEmail: currentUser.userDetails.userEmail,
          userName: currentUser.userDetails.userName,
          userPhoneNumber: currentUser.userDetails.userPhoneNumber,
          organization: currentUser.userDetails.organization,
          cohort: currentUser.userDetails.cohort,
          program: currentUser.userDetails.program,
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
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    }
    checkAuthUser();
  }, [navigate]);

  // Value to be provided by the context
  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    checkAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useUserContext = () => useContext(AuthContext);
