import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/" />;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (payload.role !== "admin") {
      return <Navigate to="/" />;
    }

    return children;

  } catch (e) {
    return <Navigate to="/" />;
  }
}
