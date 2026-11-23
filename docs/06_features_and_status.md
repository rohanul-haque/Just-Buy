# 06. Feature Matrix & Implementation Status

## 1. Feature Completion Matrix

| Feature Name | Target Role | Implementation Status | Primary Code Location | Remarks & Technical Analysis |
| :--- | :--- | :--- | :--- | :--- |
| **User Registration & Email OTP** | Buyer / Vendor | **Completed** | `backend/src/modules/v1/auth/`<br/>`backend/src/modules/v1/verification/` | 5-digit numeric OTP sent via Nodemailer/EJS, enforced via Redis TTL & cooldowns. |
| **Separate Role Logins** | Admin / Vendor / Buyer | **Completed** | `frontend/.../(auth)/login`<br/>`vendor/.../LoginPage.tsx`<br/>`admin/.../LoginPage.tsx` | Clean role isolation; wrong role logins are rejected with appropriate feedback. |
| **Password Recovery** | All Roles | **Completed** | `backend/src/modules/v1/auth/auth.service.ts` | Token-based email reset links with expiration timestamps. |
| **Vendor Onboarding & NID** | Vendor | **Completed** | `vendor/src/pages/SettingsPage.tsx`<br/>`backend/src/modules/v1/vendor/` | Form accepts trade licence and front/back NID documents uploaded to Cloudinary. |
| **Vendor Status Gate** | Vendor | **Completed** | `vendor/src/routes/ApprovedVendorRoute.tsx` | Unapproved/pending vendors are strictly restricted to Settings & Logout. |
| **Admin Vendor Review** | Admin | **Completed** | `admin/src/pages/VendorsPage.tsx` | Modal dialogs for approve, reject, suspend, and document inspection. |
| **Product CRUD & Stock** | Vendor | **Completed** | `backend/src/modules/v1/product/`<br/>`vendor/src/pages/AddProductPage.tsx` | Multiple images uploaded to Cloudinary, size checkboxes, validation. |
| **Category Taxonomy** | Admin | **Completed** | `backend/src/modules/v1/category/`<br/>`admin/src/pages/CategoriesPage.tsx` | Admin creates categories with icons; buyers filter by category. |
| **Product Search & Filters** | Buyer | **Completed** | `backend/src/modules/v1/product/product.service.ts`<br/>`frontend/src/app/products/` | Price range, brand, size, and category filtering. |
| **Shopping Cart** | Buyer | **Completed** | `backend/src/modules/v1/cart/`<br/>`frontend/src/app/cart/` | Cart stored in database with live stock checks on item additions. |
| **Wishlist Bookmarking** | Buyer | **Completed** | `backend/src/modules/v1/wishlist/`<br/>`frontend/src/app/wishlist/` | Add/remove products with instant optimistic client updates. |
| **Order Placement (COD & Online)**| Buyer | **Completed** | `backend/src/modules/v1/order/`<br/>`frontend/src/app/checkout/` | Multi-vendor order creation with atomic stock decrementing in MongoDB transactions. |
| **Stripe Checkout & Webhook** | Buyer | **Completed** | `backend/src/modules/v1/payment/`<br/>`frontend/src/app/payment/` | Cryptographic signature verification, order confirmation, stock restoration on abort. |
| **Vendor Earnings & Commission**| Vendor | **Completed** | `backend/src/modules/v1/earnings/`<br/>`vendor/src/pages/EarningsPage.tsx` | Calculates 10% platform fee and displays net vendor revenue. |
| **Admin Analytics Dashboard** | Admin | **Completed** | `admin/src/pages/DashboardPage.tsx` | Summary KPI cards, 12-month Sales Bar Chart, Order Donut Chart, and recent users table. |
| **Product Reviews & Ratings** | Buyer | **Completed** | `backend/src/modules/v1/review/` | 1-5 star ratings with 1-review-per-product unique constraint. |
| **Automated Vendor Payouts** | Vendor / Admin | **Partial / Broken** | `backend/src/modules/v1/earnings/` | Earnings are calculated mathematically, but **automated bank payouts (e.g. Stripe Connect, bKash disbursal, wire transfers)** are missing; vendor balances are tracked as read-only balances. |
| **Order Item Level Fulfillment**| Vendor | **Partial** | `backend/src/modules/v1/order/` | Status updates change the entire Order rather than individual vendor sub-orders. If Order has items from Vendor A and Vendor B, changing status affects the whole order. |
| **Coupon & Discount Engine** | Buyer / Admin | **Not Found** | N/A | No schema or endpoints exist for promotional codes or vendor vouchers. |
| **In-app Chat / Messaging** | Buyer $\leftrightarrow$ Vendor | **Not Found** | N/A | No real-time chat, WebSocket server, or messaging system found. |

---

## 2. Critical Edge Cases & Architectural Gaps

1. **Multi-Vendor Order Status Conflict:**
   - **Current Behavior:** An `Order` has an array of `productItems` from different vendors, but only one master `status` field (`PENDING`, `SHIPPED`, etc.).
   - **Flaw:** If Customer orders a shirt from Vendor 1 and shoes from Vendor 2, Vendor 1 updating status to `SHIPPED` marks the entire order as shipped, even if Vendor 2 has not dispatched their item.
   - **Recommendation for v2:** Implement a **Parent Order $\rightarrow$ Sub-Orders (Vendor Orders)** pattern.

2. **Payout Pipeline:**
   - **Current Behavior:** Earnings are tallied in MongoDB aggregations.
   - **Flaw:** No disbursement mechanism exists to transfer funds to vendors' bank accounts or digital wallets.

3. **Background Job Resilience:**
   - **Current Behavior:** Email dispatch is triggered fire-and-forget in HTTP handlers.
   - **Flaw:** High load or transient SMTP hiccups result in dropped verification emails without automated retries.
