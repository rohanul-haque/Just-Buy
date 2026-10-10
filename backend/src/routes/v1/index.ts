/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import express from "express";

/**
 * API Routes
 */
import AuthRoutes from "@/modules/v1/auth/auth.routes";
import buyerRoutes from "@/modules/v1/buyer/buyer.routes";
import categoryRoutes from "@/modules/v1/category/category.routes";
import productRoutes from "@/modules/v1/product/product.routes";
import sellerRoutes from "@/modules/v1/seller/seller.routes";

/**
 * API Controller
 */
import healthRoute from "@/routes/v1/health";

/**
 * Express Router Initialization
 */
const router = express.Router();

/**
 * Mounting routes
 */
router.use("/health", healthRoute);
router.use("/auth", AuthRoutes);
router.use("/seller", sellerRoutes);
router.use("/buyer", buyerRoutes);
router.use("/category", categoryRoutes);
router.use("/product", productRoutes);

export default router;
