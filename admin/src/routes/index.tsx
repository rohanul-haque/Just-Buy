import AdminLayout from "@/components/layout/AdminLayout";
import CategoriesPage from "@/pages/CategoriesPage";
import DashboardPage from "@/pages/DashboardPage";
import EarningsPage from "@/pages/EarningsPage";
import LoginPage from "@/pages/LoginPage";
import SettingsPage from "@/pages/SettingsPage";
import UsersPage from "@/pages/UsersPage";
import VendorsPage from "@/pages/VendorsPage";
import categoriesLoader from "@/routes/loaders/category.loader";
import profileLoader from "@/routes/loaders/profile.loader";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { createBrowserRouter, Navigate } from "react-router";

const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
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
        loader: categoriesLoader,
        Component: CategoriesPage,
      },
      {
        path: "settings",
        loader: profileLoader,
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
