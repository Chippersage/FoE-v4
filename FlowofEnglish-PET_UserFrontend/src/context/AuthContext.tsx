// @ts-nocheck
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type User = {
  userId: string;
  userName: string;
  userEmail: string;
  userType: "learner" | "mentor" | "";
};

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
  setUser: React.Dispatch<React.SetStateAction<User>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
  selectedCohort: any;
  setSelectedCohort: (cohort: any) => void;
  logout: () => void;
}

const INITIAL_STATE: AuthContextType = {
  user: INITIAL_USER_STATE,
  isLoading: false,
  isAuthenticated: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false,
  selectedCohort: null,
  setSelectedCohort: () => {},
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

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // selectedCohort persisted + exposed via context
  const [selectedCohort, setSelectedCohortState] = useState(() => {
    const stored = safeParse(localStorage.getItem("selectedCohort"));
    return stored || null;
  });

  const setSelectedCohort = (cohort) => {
    // Accept either full object or null
    setSelectedCohortState((prev) => {
      // If cohort is null/undefined => clear
      if (!cohort) {
        localStorage.removeItem("selectedCohort");
        return null;
      }

      // If previous exists and cohort is partial, merge
      if (prev && typeof prev === "object") {
        const merged = { ...prev, ...cohort };
        localStorage.setItem("selectedCohort", JSON.stringify(merged));
        return merged;
      }

      // Otherwise set cohort directly
      localStorage.setItem("selectedCohort", JSON.stringify(cohort));
      return cohort;
    });
  };

  const logout = () => {
    setUser(INITIAL_USER_STATE);
    setIsAuthenticated(false);
    setSelectedCohort(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    console.log("Auth Debug => user:", user);
    console.log("Auth Debug => isAuthenticated:", isAuthenticated);
    console.log("Auth Debug => selectedCohort:", selectedCohort);
  }, [user, isAuthenticated, selectedCohort]);

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

  useEffect(() => {
    const init = async () => {
      const ok = await checkAuthUser();

      if (!ok) {
        navigate("/sign-in");
        setIsLoading(false);
        return;
      }

      const currentPath = window.location.pathname;
      if (!selectedCohort && !["/select-cohort", "/sign-in"].includes(currentPath)) {
        navigate("/select-cohort");
      }

      setIsLoading(false);
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
    logout,
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
