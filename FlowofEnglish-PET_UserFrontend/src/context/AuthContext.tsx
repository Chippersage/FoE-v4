// @ts-nocheck
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type User = {
  userId: string;
  userName: string;
  userEmail: string;
  userType: "learner" | "mentor" | "";
};

type Cohort = {
  cohortId: string;
  programId: string;
  cohortName: string;
} | null;

const INITIAL_USER_STATE: User = {
  userId: "",
  userName: "",
  userEmail: "",
  userType: "",
};

interface AuthContextType {
  user: User;
  isLoading: boolean;
  isAuthenticated: boolean;
  cohort: Cohort;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setCohort: React.Dispatch<React.SetStateAction<Cohort>>;
  checkAuthUser: () => Promise<boolean>;
  checkCohort: () => boolean;
  logout: () => void;
}

const INITIAL_STATE: AuthContextType = {
  user: INITIAL_USER_STATE,
  isLoading: false,
  isAuthenticated: false,
  cohort: null,
  setUser: () => {},
  setIsAuthenticated: () => {},
  setCohort: () => {},
  checkAuthUser: async () => false,
  checkCohort: () => false,
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(INITIAL_STATE);

function safeParse(item: string | null) {
  try {
    if (!item || item === "undefined" || item === "null") return null;
    return JSON.parse(item);
  } catch (err) {
    console.error("safeParse error:", err, item);
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User>(() => {
    const stored = safeParse(localStorage.getItem("user"));
    return stored || INITIAL_USER_STATE;
  });

  const [cohort, setCohort] = useState<Cohort>(() => {
    const stored = safeParse(localStorage.getItem("selectedCohort"));
    return stored || null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = () => {
    setUser(INITIAL_USER_STATE);
    setCohort(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("selectedCohort");
    localStorage.removeItem("sessionId");
  };

  const checkAuthUser = async () => {
    try {
      const storedUser = safeParse(localStorage.getItem("user"));
      if (storedUser && storedUser.userId) {
        setUser(storedUser);
        setIsAuthenticated(true);
        return true;
      }
      setIsAuthenticated(false);
      return false;
    } catch (err) {
      console.error("Auth check error:", err);
      setIsAuthenticated(false);
      return false;
    }
  };

  const checkCohort = () => {
    try {
      const stored = safeParse(localStorage.getItem("selectedCohort"));
      if (stored && stored.cohortId && stored.programId) {
        setCohort(stored);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Cohort check error:", err);
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      const ok = await checkAuthUser();

      if (!ok) {
        navigate("/sign-in");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    };

    init();
  }, [navigate]);

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    checkAuthUser,
    logout,
    cohort,
    setCohort,
    checkCohort,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading authentication...
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useUserContext = () => useContext(AuthContext);
