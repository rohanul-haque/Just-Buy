import AdminLayout from "@/components/layout/AdminLayout";
import BuyersPage from "@/pages/BuyersPage";
import CategoriesPage from "@/pages/CategoriesPage";
import DashboardPage from "@/pages/DashboardPage";
import EarningsPage from "@/pages/EarningsPage";
import LoginPage from "@/pages/LoginPage";
import SettingsPage from "@/pages/SettingsPage";
import VendorsPage from "@/pages/VendorsPage";
import buyerAction from "@/routes/actions/buyer.action";
import categoryAction from "@/routes/actions/category.action";
import profileAction from "@/routes/actions/profile.action";
import buyersLoader from "@/routes/loaders/buyer.loader";
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
        path: "buyers",
        loader: buyersLoader,
        action: buyerAction,
        Component: BuyersPage,
      },
      {
        path: "users",
        element: <Navigate to="/buyers" replace />,
      },
      {
        path: "vendors",
        Component: VendorsPage,
      },
      {
        path: "categories",
        loader: categoriesLoader,
        action: categoryAction,
        Component: CategoriesPage,
      },
      {
        path: "settings",
        loader: profileLoader,
        action: profileAction,
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
