import VendorLayout from "@/components/layout/VendorLayout";
import DashboardPage from "@/pages/DashboardPage";
import ManageProductsPage from "@/pages/ManageProductsPage";
import OrderListPage from "@/pages/OrderListPage";
import SettingsPage from "@/pages/SettingsPage";
import { createBrowserRouter, Navigate } from "react-router";

const router = createBrowserRouter([
  {
    path: "/",
    element: <VendorLayout />,
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
]);

export default router;
