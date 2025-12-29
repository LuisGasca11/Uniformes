import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token) return <Navigate to="/login" />;

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.role !== "admin") {
        return <Navigate to="/" />;
      }
    } catch {
      return <Navigate to="/login" />;
    }
  } else {
    return <Navigate to="/login" />;
  }

  return children;
}
