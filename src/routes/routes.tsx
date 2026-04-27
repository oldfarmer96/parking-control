import { createBrowserRouter } from "react-router-dom";
import {
  AdminPage,
  LoginPage,
  RegisterPage,
  OperatorPage,
  ReportPage,
  ConfiguracionTicketPage,
  UsersPage,
} from "./lazy";
import OperatorLayout from "@/layouts/OperatorLayout";
import AdminLayout from "@/layouts/AdminLayout";
import AuthLayout from "@/layouts/AuthLayout";
import GuestGuard from "@/guards/GuestGuard";
import { Suspense } from "react";
import LazyLoadingPage from "@/presentation/components/LazyLoadingPage";
import AuthGuard from "@/guards/AuthGuard";
import RoleGuard from "@/guards/RoleGuard";
import NotFound from "@/presentation/components/NotFound";

export const router = createBrowserRouter([
  {
    element: (
      <GuestGuard>
        <Suspense fallback={<LazyLoadingPage />}>
          <AuthLayout />
        </Suspense>
      </GuestGuard>
    ),
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={["operador"]}>
          <Suspense fallback={<LazyLoadingPage />}>
            <OperatorLayout />
          </Suspense>
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      {
        path: "/",
        element: <OperatorPage />,
      },
    ],
  },
  {
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={["admin"]}>
          <AdminLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      {
        path: "/admin",
        element: <AdminPage />,
      },
      {
        path: "/reports",
        element: <ReportPage />,
      },
      {
        path: "/user-register",
        element: <RegisterPage />,
      },
      {
        path: "/admin/settings/tickets",
        element: <ConfiguracionTicketPage />,
      },
      {
        path: "/admin/users",
        element: <UsersPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
