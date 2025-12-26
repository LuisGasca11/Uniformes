import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role?: string; 
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLogged: boolean;
  role: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function decodeJWT(token: string) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");

    if (t && u) {
      const decoded = decodeJWT(t);

      if (decoded?.exp * 1000 < Date.now()) {
        console.warn("⛔ Token expirado al cargar");
        logout();
      } else {
        setToken(t);
        setUser(JSON.parse(u));
        setRole(decoded.role || null);
      }
    }
  }, []);

  useEffect(() => {
    const sync = () => {
      const t = localStorage.getItem("token");
      const u = localStorage.getItem("user");

      if (!t || !u) {
        setToken(null);
        setUser(null);
        setRole(null);
      } else {
        setToken(t);
        setUser(JSON.parse(u));
        const decoded = decodeJWT(t);
        setRole(decoded?.role || null);
      }
    };

    window.addEventListener("storage", sync);
    window.addEventListener("auth-updated", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-updated", sync);
    };
  }, []);

  useEffect(() => {
    if (!token) return;

    const decoded = decodeJWT(token);
    if (!decoded?.exp) return;

    const msLeft = decoded.exp * 1000 - Date.now();
    if (msLeft <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(() => {
      console.warn("⛔ Token expirado, cerrando sesión");
      logout();
    }, msLeft);

    return () => clearTimeout(timer);
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);

    const decoded = decodeJWT(newToken);
    setRole(decoded?.role || null);

    window.dispatchEvent(new CustomEvent("auth-updated"));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setRole(null);

    window.dispatchEvent(new CustomEvent("auth-updated"));
  };

  const isLogged = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, isLogged, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be inside <AuthProvider>");
  return ctx;
};
