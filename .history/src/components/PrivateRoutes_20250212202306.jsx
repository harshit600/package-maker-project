import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";

export default function PrivateRoutes() {
  const session = useSession();

  // Check if there's an active session
  if (!session) {
    return <Navigate to="/signin" />;
  }

  return <Outlet />;
}
