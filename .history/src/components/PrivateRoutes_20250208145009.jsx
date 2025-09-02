import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";

export default function PrivateRoutes() {
  const { checkSession } = useSession();

  return checkSession() ? <Outlet /> : <Navigate to="/signin" />;
}
