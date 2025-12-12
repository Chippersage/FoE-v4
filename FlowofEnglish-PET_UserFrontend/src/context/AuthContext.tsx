// @ts-nocheck
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
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

const INITIAL_STATE = {
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

const AuthContext = createContext(INITIAL_STATE);

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

  // ------------------------------------------
  // 🔵 FIX 1: Stable logout using useCallback
  // ------------------------------------------
  const logout = useCallback(() => {
    setUser(INITIAL_USER_STATE);
    setCohort(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("selectedCohort");
    localStorage.removeItem("sessionId");
  }, []);

  // ------------------------------------------
  // 🔵 FIX 2: Stable checkAuthUser (no re-renders)
  // ------------------------------------------
  const checkAuthUser = useCallback(async () => {
    try {
      const storedUser = safeParse(localStorage.getItem("user"));
      if (storedUser?.userId) {
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
  }, []);

  // ------------------------------------------
  // 🔵 FIX 3: Stable checkCohort
  // ------------------------------------------
  const checkCohort = useCallback(() => {
    try {
      const stored = safeParse(localStorage.getItem("selectedCohort"));
      if (stored?.cohortId && stored?.programId) {
        setCohort(stored);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Cohort check error:", err);
      return false;
    }
  }, []);

  // ------------------------------------------
  // 🔵 FIX 4: Prevent infinite re-renders 
  // useEffect([]) runs ONLY once
  // ------------------------------------------
  useEffect(() => {
    const init = async () => {
      const ok = await checkAuthUser();
      if (!ok) {
        navigate("/sign-in");
      }
      setIsLoading(false);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- No dependency on "navigate" or checkAuthUser

  // ------------------------------------------
  // 🔵 FIX 5: Memoize value object
  // Prevents rerender of every consumer
  // ------------------------------------------
  const value = useMemo(
    () => ({
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
    }),
    [
      user,
      isLoading,
      isAuthenticated,
      cohort,
      checkAuthUser,
      logout,
      checkCohort,
    ]
  );

  // ------------------------------------------
  // Loading Screen (unchanged)
  // ------------------------------------------
  if (isLoading) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            border: "3px solid rgba(14,165,233,0.2)",
            borderTop: "3px solid #0EA5E9",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            boxShadow: "0 0 8px rgba(14,165,233,0.3)",
          }}
        ></div>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useUserContext = () => useContext(AuthContext);
