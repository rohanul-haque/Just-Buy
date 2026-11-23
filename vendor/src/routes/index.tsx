import VendorLayout from "@/components/layout/VendorLayout";
import AddProductPage from "@/pages/AddProductPage";
import DashboardPage from "@/pages/DashboardPage";
import EarningsPage from "@/pages/EarningsPage";
import EditProductPage from "@/pages/EditProductPage";
import LoginPage from "@/pages/LoginPage";
import OrderListPage from "@/pages/OrderListPage";
import ProductsPage from "@/pages/ProductsPage";
import RegisterPage from "@/pages/RegisterPage";
import SettingsPage from "@/pages/SettingsPage";
import VerifyOtpPage from "@/pages/VerifyOtpPage";
import ApprovedVendorRoute from "@/routes/ApprovedVendorRoute";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { createBrowserRouter, Navigate } from "react-router";

const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/verify-otp",
    Component: VerifyOtpPage,
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
        path: "settings",
        Component: SettingsPage,
      },
      {
        element: <ApprovedVendorRoute />,
        children: [
          {
            path: "dashboard",
            Component: DashboardPage,
          },
          {
            path: "earnings",
            Component: EarningsPage,
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
            path: "products/edit/:productId",
            Component: EditProductPage,
          },
          {
            path: "products/:productId/edit",
            Component: EditProductPage,
          },
          {
            path: "orders",
            Component: OrderListPage,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;
