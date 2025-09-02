import { Outlet, Navigate } from "react-router-dom";

const PrivateRoutes = () => {
  // Get auth status from localStorage or your auth context
  const auth = localStorage.getItem("token"); // Adjust this based on how you store auth status

  return auth ? <Outlet /> : <Navigate to="/signin" />;
};

export default PrivateRoutes;
