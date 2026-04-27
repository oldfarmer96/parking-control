import { lazy } from "react";

export const MainPage = lazy(() => import("@/pages/index"));
export const AdminPage = lazy(
  () => import("@/presentation/features/admin/pages/AdminPage"),
);
export const LoginPage = lazy(
  () => import("@/presentation/features/auth/pages/LoginPage"),
);
export const RegisterPage = lazy(
  () => import("@/presentation/features/auth/pages/RegisterPage"),
);
export const OperatorPage = lazy(
  () => import("@/presentation/features/operator/pages/OperatorPage"),
);
export const ReportPage = lazy(
  () => import("@/presentation/features/reports/pages/ReportPage"),
);
export const ConfiguracionTicketPage = lazy(
  () => import("@/presentation/features/admin/pages/ConfiguracionTicketPage"),
);
export const UsersPage = lazy(
  () => import("@/presentation/features/admin/pages/UsersPage"),
);

