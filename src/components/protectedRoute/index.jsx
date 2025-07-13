import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { routePermissions } from "../../utlis/permissions";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");
  const location = useLocation();
  const currentPath = location.pathname;

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  const matchedRoute = Object.keys(routePermissions).find((routePattern) => {
    const base = routePattern.split("/:")[0];
    return currentPath.startsWith(base);
  });

  if (!matchedRoute) return children;

  const allowedRoles = routePermissions[matchedRoute];

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
