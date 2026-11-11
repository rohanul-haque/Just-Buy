import adminRoutes from "@/modules/v1/admin/admin.route";
import authRoutes from "@/modules/v1/auth/auth.route";
import buyerRoutes from "@/modules/v1/buyer/buyer.route";
import cartRoutes from "@/modules/v1/cart/cart.route";
import categoryRoutes from "@/modules/v1/category/category.route";
import orderRoutes from "@/modules/v1/order/order.route";
import paymentRoutes from "@/modules/v1/payment/payment.route";
import productRoutes from "@/modules/v1/product/product.route";
import reviewRoutes from "@/modules/v1/review/review.route";
import vendorRoutes from "@/modules/v1/vendor/vendor.route";
import verificationRoutes from "@/modules/v1/verification/verification.route";
import wishlistRoutes from "@/modules/v1/wishlist/wishlist.route";
import express from "express";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/verification", verificationRoutes);
router.use("/buyers", buyerRoutes);
router.use("/admins", adminRoutes);
router.use("/vendors", vendorRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);

export default router;
