import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isLogged } = useAuth();

  if (!isLogged) {
    window.dispatchEvent(new CustomEvent("open-login"));
    return <Navigate to="/" replace />;
  }

  return children;
}
