import React, { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";

interface PublicRouteProps {
  children?: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Redirect to role-based dashboard
    switch (user.role) {
      case UserRole.ADMIN:
        return <Navigate to="/admin/dashboard" replace />;
      case UserRole.EMPLOYEE:
        return <Navigate to="/employee/dashboard" replace />;
      case UserRole.CUSTOMER:
        return <Navigate to="/customer/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // Not authenticated - show public content
  return children ? <>{children}</> : <Outlet />;
}
