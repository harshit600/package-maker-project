import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";

export default function PrivateRoutes() {
  const session = useSession();
  console.log('Session value:', session); // Debug log

  // Most basic check possible
  if (!session || !session.getSession) {
    return <Navigate to="/signin" />;
  }

  const currentSession = session.getSession();
  console.log('Current session:', currentSession); // Debug log

  return currentSession ? <Outlet /> : <Navigate to="/signin" />;
}
