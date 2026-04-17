import { createBrowserRouter } from "react-router-dom";
import { AdminPage, LoginPage, MainPage, RegisterPage } from "./lazy";
import OperatorLayout from "@/layouts/OperatorLayout";
import AdminLayout from "@/layouts/AdminLayout";
import AuthLayout from "@/layouts/AuthLayout";
import GuestGuard from "@/guards/GuestGuard";
import { Suspense } from "react";
import LazyLoadingPage from "@/presentation/components/LazyLoadingPage";
import AuthGuard from "@/guards/AuthGuard";
import RoleGuard from "@/guards/RoleGuard";

export const router = createBrowserRouter([
  {
    element: (
      <GuestGuard>
        <Suspense fallback={<LazyLoadingPage />}>
          <AuthLayout />
        </Suspense>
      </GuestGuard>
    ),
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
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
        element: <MainPage />,
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
    ],
  },
]);
