import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { AuthPayload } from "@/types";

interface Props {
  children: React.ReactNode;
  roles?: AuthPayload["role"][];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
