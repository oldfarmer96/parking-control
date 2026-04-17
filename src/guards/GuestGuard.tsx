import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { roleBasedRedirection } from "@/utils/role-based-redirection";
import { useAuthStore } from "@/application/store/auth-store";

const GuestGuard = ({ children }: PropsWithChildren) => {
  const { user, isAuth } = useAuthStore();

  if (isAuth && user) {
    const redirectPath = roleBasedRedirection(user.rol);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};
export default GuestGuard;
