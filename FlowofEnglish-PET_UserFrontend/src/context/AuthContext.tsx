// @ts-nocheck
import { createContext, useContext, useEffect, useState, useMemo, } from "react";
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
  programName?: string;
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
  setCohort: React.Dispatch<React.SetStateAction<Cohort>>;

  //  User-UI compatibility
  selectedCohortWithProgram: any;
  setSelectedCohortWithProgram: (cohort: any) => void;

  setUser: React.Dispatch<React.SetStateAction<User>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
  checkCohort: () => boolean;

  clearAuth: () => void;

  isChangingCohort: boolean;
  setIsChangingCohort: React.Dispatch<React.SetStateAction<boolean>>;
}


const INITIAL_STATE: AuthContextType = {
  user: INITIAL_USER_STATE,
  isLoading: false,
  isAuthenticated: false,

  cohort: null,
  setCohort: () => {},

  selectedCohortWithProgram: null,
  setSelectedCohortWithProgram: () => {},

  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false,
  checkCohort: () => false,

  clearAuth: () => {},

  isChangingCohort: false,
  setIsChangingCohort: () => {},
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
  const [isChangingCohort, setIsChangingCohort] = useState(false);

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

  const selectedCohortWithProgram = useMemo(() => {
    const fromUserUI = safeParse(
      localStorage.getItem("selectedCohortWithProgram")
    );
    if (fromUserUI) return fromUserUI;

    if (!cohort) return null;

    return {
      cohortId: cohort.cohortId,
      cohortName: cohort.cohortName,
      program: {
        programId: cohort.programId,
        programName: cohort.programName,
      },
    };
  }, [cohort]);

  const setSelectedCohortWithProgram = (data: any) => {
    if (!data) return;

    // User UI format
    localStorage.setItem(
      "selectedCohortWithProgram",
      JSON.stringify(data)
    );
// PET internal format
    const petCohort: Cohort = {
      cohortId: data.cohortId,
      cohortName: data.cohortName,
      programId: data.program?.programId ?? data.programId,
      programName: data.program?.programName ?? data.programName,
    };

    localStorage.setItem("selectedCohort", JSON.stringify(petCohort));
    setCohort(petCohort);
  };

 // Logout
  const clearAuth = () => {
    setUser(INITIAL_USER_STATE);
    setCohort(null);
    setIsAuthenticated(false);
    setIsChangingCohort(false);

    localStorage.removeItem("user");
    localStorage.removeItem("selectedCohort");
    localStorage.removeItem("selectedCohortWithProgram");
    localStorage.removeItem("sessionId");
    localStorage.removeItem("userData");
  };

  useEffect(() => {
    const init = async () => {
      const ok = await checkAuthUser();

      if (!ok) {
        navigate("/sign-in");
        setIsLoading(false);
        return;
      }

      checkCohort();

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

    cohort,
    setCohort,

    selectedCohortWithProgram,
    setSelectedCohortWithProgram,

    checkAuthUser,
    checkCohort,
    clearAuth,

    isChangingCohort,
    setIsChangingCohort,
  };


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
      {/* Thin elegant circular loader */}
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
