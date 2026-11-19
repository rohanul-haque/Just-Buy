import AdminLayout from "@/components/layout/AdminLayout";
import CategoriesPage from "@/pages/CategoriesPage";
import DashboardPage from "@/pages/DashboardPage";
import EarningsPage from "@/pages/EarningsPage";
import LoginPage from "@/pages/LoginPage";
import SettingsPage from "@/pages/SettingsPage";
import UsersPage from "@/pages/UsersPage";
import VendorsPage from "@/pages/VendorsPage";
import { createBrowserRouter, Navigate } from "react-router";

const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: AdminLayout,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        Component: DashboardPage,
      },
      {
        path: "earnings",
        Component: EarningsPage,
      },
      {
        path: "users",
        Component: UsersPage,
      },
      {
        path: "vendors",
        Component: VendorsPage,
      },
      {
        path: "categories",
        Component: CategoriesPage,
      },
      {
        path: "settings",
        Component: SettingsPage,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;
