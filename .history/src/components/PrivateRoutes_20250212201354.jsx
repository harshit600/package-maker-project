import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";

export default function PrivateRoutes() {
  const session = useSession();
  
  // If session is null/undefined, redirect to signin
  if (!session) {
    return <Navigate to="/signin" />;
  }

  // Check if authenticated
  const isAuthenticated = session.checkSession?.() || false;

  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" />;
}
