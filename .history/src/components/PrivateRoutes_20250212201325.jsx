import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";

export default function PrivateRoutes() {
  const session = useSession();
  const isAuthenticated = typeof session?.checkSession === 'function' ? session.checkSession() : false;

  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" />;
}
