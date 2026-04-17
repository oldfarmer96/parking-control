import { useAuthStore } from "@/application/store/auth-store";
import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

const AuthGuard = ({ children }: PropsWithChildren) => {
  const { user, isAuth } = useAuthStore();

  if (!user || !isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
export default AuthGuard;
