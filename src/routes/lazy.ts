import { lazy } from "react";

export const MainPage = lazy(() => import("@/pages/index"));
export const AdminPage = lazy(
  () => import("@/presentation/features/admin/pages/AdminPage"),
);
