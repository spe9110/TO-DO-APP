import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = () => {
  const { userData } = useSelector((state) => state.auth);

  // If not logged in, redirect to /signin
  if (!userData) {
    return <Navigate to="/signin" replace />;
  }

  // If logged in → allow access
  return <Outlet />;
};

export default PrivateRoute;
