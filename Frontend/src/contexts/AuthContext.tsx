import { createContext, useContext, useState, useEffect, ReactNode } from "react";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export type UserRole = "student" | "driver" | "admin" | null;

interface UserData {
  _id?: string;
  email: string;
  fullName: string;
  role: UserRole;
  yearBatch?: string;
  routeNo?: string;
  timing?: string;
  selectedRoute?: number;
  password?: string;
  phoneNumber?: string;
  branch?: string;
  course?: string;
  semester?: string;
  profileImage?: string;
  busNumber?: string;
  licenseId?: string;
  registrationNo?: string;
  busStop?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  pendingRole: UserRole;
  pendingEmail: string;
  pendingUserData: Partial<UserData>;
  login: (email: string, password: string, role: UserRole) => Promise<{success: boolean, role?: UserRole, error?: string}>;
  googleLogin: (accessToken: string, role: UserRole) => Promise<{success: boolean, role?: UserRole, error?: string}>;
  logout: () => void;
  setPendingRole: (role: UserRole) => void;
  setPendingEmail: (email: string) => void;
  setPendingUserData: (data: Partial<UserData>) => void;
  completeSignup: (data: Partial<UserData>) => Promise<boolean>;
  updateUser: (data: Partial<UserData>) => void;
  setSelectedRoute: (route: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(() => {
    try {
      const stored = localStorage.getItem("campus-commute-session");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!user);

  useEffect(() => {
    if (user) {
      localStorage.setItem("campus-commute-session", JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("campus-commute-session");
      setIsAuthenticated(false);
    }
  }, [user]);
  const [pendingRole, setPendingRole] = useState<UserRole>(() => {
    try { return JSON.parse(localStorage.getItem("cc-pending-role") || "null"); } catch { return null; }
  });
  const [pendingEmail, setPendingEmail] = useState(() => {
    return localStorage.getItem("cc-pending-email") || "";
  });
  const [pendingUserData, setPendingUserData] = useState<Partial<UserData>>(() => {
    try { return JSON.parse(localStorage.getItem("cc-pending-data") || "{}"); } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem("cc-pending-role", JSON.stringify(pendingRole));
    localStorage.setItem("cc-pending-email", pendingEmail);
    localStorage.setItem("cc-pending-data", JSON.stringify(pendingUserData));
  }, [pendingRole, pendingEmail, pendingUserData]);

  const login = async (email: string, password: string, role: UserRole): Promise<{success: boolean, role?: UserRole, error?: string}> => {
    try {
      const response = await fetch(`${BACKEND_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status >= 500) throw new Error("Server error - please try again later.");
        return { success: false, error: errData.error || "Login failed" };
      }
      
      const { user: serverUser } = await response.json();
      setIsAuthenticated(true);
      setUser({
        _id: serverUser._id,
        email: serverUser.email,
        fullName: serverUser.fullname,
        role: serverUser.role || role,
        routeNo: serverUser.routeNo,
        selectedRoute: 1
      });
      return { success: true, role: serverUser.role || role };
    } catch (error: any) {
      if (error.message.includes("Server error")) throw error;
      throw new Error("Could not connect to the backend server.");
    }
  };


  const googleLogin = async (accessToken: string, role: UserRole): Promise<{success: boolean, role?: UserRole, error?: string}> => {
    try {
      const response = await fetch(`${BACKEND_URL}/user/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ accessToken, role })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status >= 500) throw new Error("Server error - please try again later.");
        return { success: false, error: errData.error || "Google login failed" };
      }
      
      const { user: serverUser } = await response.json();
      setIsAuthenticated(true);
      setUser({
        _id: serverUser._id,
        email: serverUser.email,
        fullName: serverUser.fullname,
        role: serverUser.role,
        routeNo: serverUser.routeNo,
        profileImage: serverUser.profileImage,
        selectedRoute: 1
      });
      return { success: true, role: serverUser.role || role };
    } catch (error: any) {
      if (error.message.includes("Server error")) throw error;
      throw new Error("Could not connect to the backend server.");
    }
  };


  const logout = async () => {
    try {
      await fetch(`${BACKEND_URL}/user/logout`, { method: "POST", credentials: "include" });
    } catch {}
    
    // FIXED: Alarm Persist Fix on Logout (BONUS 3)
    window.dispatchEvent(new Event("clear-alarm"));
    
    setIsAuthenticated(false);
    setUser(null);
    setPendingRole(null);
    setPendingEmail("");
    setPendingUserData({});
  };

  const completeSignup = async (data: Partial<UserData>): Promise<boolean> => {
    try {
      const payload = {
         fullname: pendingUserData.fullName || pendingEmail.split('@')[0],
         email: pendingEmail,
         password: pendingUserData.password || "OAuthDefaultPassword!12",
         role: pendingRole,
         regdNo: pendingUserData.registrationNo,
         routeNo: pendingUserData.routeNo,
         timing: pendingUserData.timing,
         phone: pendingUserData.phoneNumber
      };

      const res = await fetch(`${BACKEND_URL}/user/register`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         credentials: "include",
         body: JSON.stringify(payload)
      });

      // Accept both 201 (new user) and 200 (already exists — log them in)
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Registration failed:", errData.error || res.status);
        return false;
      }

      const { user: serverUser } = await res.json();
      setIsAuthenticated(true);
      setUser({
        _id: serverUser._id || serverUser.id,
        email: serverUser.email,
        fullName: serverUser.fullname,
        role: serverUser.role,
        routeNo: serverUser.routeNo,
        selectedRoute: 1
      });
      setPendingEmail("");
      setPendingUserData({});
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const updateUser = (data: Partial<UserData>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
    }
  };

  const setSelectedRoute = (route: number) => {
    if (user) {
      setUser({ ...user, selectedRoute: route });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        pendingRole,
        pendingEmail,
        pendingUserData,
        login,
        googleLogin,
        logout,
        setPendingRole,
        setPendingEmail,
        setPendingUserData,
        completeSignup,
        updateUser,
        setSelectedRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
