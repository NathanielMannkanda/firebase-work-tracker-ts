import type { ReactNode } from "react";
import type { User } from "firebase/auth";
import { Navigate } from "react-router-dom";
import type { Role } from "../types/models";

interface ProtectedRouteProps {
  user: User | null | undefined;
  allowedRole?: Role;
  role: Role | null;
  children: ReactNode;
}

function ProtectedRoute({
  user,
  allowedRole,
  role,
  children
}: ProtectedRouteProps) {

  //if not logged in
  if (!user){
    return <Navigate to="/"/>;
  }

  //wring role
  if (allowedRole && role !== allowedRole){
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
