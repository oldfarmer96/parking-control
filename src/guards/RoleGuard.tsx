import { useAuthStore } from "@/application/store/auth-store";
import type { UserRole } from "@/core/entities/auth.entity";
import { roleBasedRedirection } from "@/utils/role-based-redirection";
import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
type props = PropsWithChildren<{ allowedRoles: UserRole[] }>;

const RoleGuard = ({ allowedRoles, children }: props) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.rol)) {
    const redirectPath = roleBasedRedirection(user.rol);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default RoleGuard;
