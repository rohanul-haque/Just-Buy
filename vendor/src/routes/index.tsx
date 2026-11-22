import VendorLayout from "@/components/layout/VendorLayout";
import AddProductPage from "@/pages/AddProductPage";
import DashboardPage from "@/pages/DashboardPage";
import LoginPage from "@/pages/LoginPage";
import OrderListPage from "@/pages/OrderListPage";
import ProductsPage from "@/pages/ProductsPage";
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
        Component: ProductsPage,
      },
      {
        path: "products/new",
        Component: AddProductPage,
      },
      {
        path: "products/add",
        Component: AddProductPage,
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
