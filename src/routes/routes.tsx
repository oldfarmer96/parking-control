import { createBrowserRouter } from "react-router-dom";
import { AdminPage, MainPage } from "./lazy";
import OperatorLayout from "@/layouts/OperatorLayout";
import AdminLayout from "@/layouts/AdminLayout";

export const router = createBrowserRouter([
  {
    element: <OperatorLayout />,
    children: [
      {
        path: "/",
        element: <MainPage />,
      },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      {
        path: "/admin",
        element: <AdminPage />,
      },
    ],
  },
]);
