import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  email: string;
  display_name?: string;
  // Add any other fields your JWT payload contains
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleToken = () => {
      // 1. Check for token in URL query param (after redirect from login)
      const params = new URLSearchParams(location.search);
      const token = params.get("token");

      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          const now = Date.now() / 1000;

          if (decoded.exp < now) {
            console.warn("Received token is already expired");
            logout();
            return;
          }

          // Store token
          localStorage.setItem("token", token);

          // Set user state
          setUser({
            id: decoded.sub || decoded.userId || decoded.id,
            email: decoded.email,
            display_name: decoded.display_name || decoded.name,
          });

          // Clean the URL (remove ?token=...)
          navigate(location.pathname, { replace: true });
        } catch (err) {
          console.error("Invalid JWT", err);
          logout();
        }
        return;
      }

      // 2. On mount / refresh: check existing stored token
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const decoded: any = jwtDecode(storedToken);
          const now = Date.now() / 1000;

          if (decoded.exp < now) {
            logout();
          } else {
            setUser({
              id: decoded.sub || decoded.userId || decoded.id,
              email: decoded.email,
              display_name: decoded.display_name || decoded.name,
            });
          }
        } catch {
          logout();
        }
      }
    };

    handleToken();
  }, [location.search, navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Combined hook – now exported from the same file
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}