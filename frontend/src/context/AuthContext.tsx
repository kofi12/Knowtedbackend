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
  id: string | null;
  email: string;
  display_name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: validate UUID
const isUUID = (val?: string) =>
  typeof val === "string" && /^[0-9a-fA-F-]{36}$/.test(val);

// Helper: safely extract user ID
const extractUserId = (decoded: any): string | null => {
  if (isUUID(decoded.userId)) return decoded.userId;
  if (isUUID(decoded.id)) return decoded.id;
  if (isUUID(decoded.sub)) return decoded.sub;
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleToken = () => {
      const params = new URLSearchParams(location.search);
      const tokenFromUrl = params.get("token");

      const processToken = (token: string) => {
        try {
          const decoded: any = jwtDecode(token);
          const now = Date.now() / 1000;
          if (decoded.exp < now) {
            console.warn("Token expired");
            logout();
            return;
          }
          const extractedId = extractUserId(decoded);
          setUser({
            id: extractedId,
            email: decoded.email,
            display_name: decoded.display_name || decoded.name,
          });
        } catch (err) {
          console.error("Invalid JWT", err);
          logout();
        }
      };

      // 1. Token from URL (after login redirect)
      if (tokenFromUrl) {
        localStorage.setItem("token", tokenFromUrl);
        processToken(tokenFromUrl);

        // Clean URL
        navigate(location.pathname, { replace: true });
        return;
      }

      // 2. Existing stored token
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        processToken(storedToken);
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
    isAuthenticated: !!user?.id,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ✅ Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}