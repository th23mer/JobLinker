import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { AuthPayload } from "../types";

interface AuthContextType {
  user: AuthPayload | null;
  login: (token: string, role: AuthPayload["role"]) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseToken(token: string): { id: number; role: AuthPayload["role"] } | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { id: payload.id, role: payload.role };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthPayload | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") as AuthPayload["role"] | null;
    if (token && role) {
      const parsed = parseToken(token);
      if (parsed) setUser({ ...parsed, token });
    }
  }, []);

  const login = (token: string, role: AuthPayload["role"]) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    const parsed = parseToken(token);
    if (parsed) setUser({ ...parsed, token });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
