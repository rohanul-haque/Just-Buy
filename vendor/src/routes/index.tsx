import VendorLayout from "@/components/layout/VendorLayout";
import DashboardPage from "@/pages/DashboardPage";
import LoginPage from "@/pages/LoginPage";
import ManageProductsPage from "@/pages/ManageProductsPage";
import OrderListPage from "@/pages/OrderListPage";
import SettingsPage from "@/pages/SettingsPage";
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
        <VendorLayout />
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
        path: "products",
        Component: ManageProductsPage,
      },
      {
        path: "orders",
        Component: OrderListPage,
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
