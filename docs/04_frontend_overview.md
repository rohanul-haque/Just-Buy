# 04. Frontend Overview & Client Applications

## 1. Client Applications Architecture

The frontend ecosystem consists of three distinct web applications tailored to specific user roles:
1. **Buyer Marketplace (`frontend/`):** Next.js 16 (App Router) with SSR and React Server Components.
2. **Vendor Portal (`vendor/`):** React 19 + Vite 8 SPA using React Router v8.
3. **Admin Dashboard (`admin/`):** React 19 + Vite 8 SPA using React Router v8.

---

## 2. Frameworks & State Management

| Feature | Buyer Frontend (`frontend/`) | Vendor Portal (`vendor/`) | Admin Dashboard (`admin/`) |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js 16.4.0 (App Router) | Vite 8.3.6 + React 19.3.1 | Vite 8.3.6 + React 19.3.1 |
| **Routing** | File-system App Router (`src/app/`) | React Router v8 Data APIs | React Router v8 Data APIs |
| **Server State** | TanStack React Query v5.104.1 | React Router Loaders & Hooks | React Router Loaders & Hooks |
| **Client State** | React Context (`CartContext`, `AuthContext`) | React Context (`AuthContext`) | React Context (`AuthContext`) |
| **Form Handling** | React Hook Form + Zod resolvers | Controlled React State + Zod | React Hook Form + Zod / Form State |
| **Styling** | Tailwind CSS v4, Base UI, Sonner | Tailwind CSS v4, Radix, Sonner | Tailwind CSS v4, Radix, Sonner |
| **Data Viz** | N/A (Icons only) | Recharts v3.11.0 (Area/Bar) | Recharts v3.11.0 (Bar & Donut) |

---

## 3. Route Map & Page Structures

### 3.1 Buyer Marketplace (`frontend/src/app`)

- **Public Marketplace:**
  - `/`: Homepage displaying hero banners, featured categories, and latest/featured product feeds.
  - `/products`: Product search and catalog filtering (by category, price range, brand, sizes, and sorting).
  - `/products/[productId]`: Product detail page, image gallery, size selector, stock indicator, and review list.
- **Authentication Routes (`src/app/(auth)/`):**
  - `/login`: Buyer-only login (redirects admins and vendors to their respective dedicated dashboards).
  - `/register`: Buyer registration (assigns `BUYER` role).
  - `/verify-account`: 5-digit OTP verification page with resend cooldown timer.
  - `/forgot-password`: Request password reset token.
  - `/reset-password`: Complete password change via email reset token.
  - `/change-password`: Authenticated password updates.
- **Cart & Checkout:**
  - `/cart`: Cart item list, quantity adjustment, subtotal computation, and "Proceed to Checkout".
  - `/checkout`: Delivery address entry, order review, payment method selection (Cash on Delivery or Online Card via Stripe).
  - `/payment/success`: Stripe payment confirmation and order receipt viewer.
  - `/payment/cancel`: Payment failure / abandoned checkout page.
- **Customer Portal:**
  - `/profile`: Buyer personal information, phone number, and address updates.
  - `/orders`: Buyer order history, order items breakdown, delivery status tracker.
  - `/orders/[orderId]`: Detailed invoice and order item timeline.
  - `/wishlist`: Bookmarked products with one-click "Add to Cart".

### 3.2 Vendor Portal (`vendor/src/routes/index.tsx`)

- **Unauthenticated / Onboarding:**
  - `/login`: Vendor-only authentication gate (rejects non-vendor accounts).
  - `/register`: Vendor registration form (Name, Email, Password). Backend forces `role: "VENDOR"`.
  - `/verify-otp`: Email verification screen with automatic prefilled email state.
- **Protected Vendor Dashboard (`ProtectedRoute` + `ApprovedVendorRoute`):**
  - `/dashboard`: High-level metrics, total sales count, current revenue, and recent orders.
  - `/products`: Vendor product catalog management with status filters (`ACTIVE` / `INACTIVE`).
  - `/products/new` (or `/products/add`): Multi-image upload, size checkboxes, stock count, and description editor.
  - `/products/edit/:productId`: Product updating and image replacement.
  - `/orders`: Orders containing products sold by this vendor; status management pipeline.
  - `/earnings`: Lifetime earnings, platform commission deductions, and net payouts.
  - `/settings`: **Always accessible** regardless of approval status. Vendor edits profile details, business location, trade licence number, and uploads front/back National ID (NID) verification scans.

### 3.3 Admin Dashboard (`admin/src/routes/index.tsx`)

- **Authentication:**
  - `/login`: Admin authentication gate (checks whitelisted administrative accounts and `ADMIN` role).
- **Control Center Pages (`ProtectedRoute`):**
  - `/dashboard`: High-level platform KPIs, 12-month Sales Bar Chart, Order Status Distribution Donut Chart, and recent registered users.
  - `/vendors`: Vendor directory and approval queue (`requests`, `list`, `rejected`, `suspended`). Includes `VendorDetailsDialog`, `VendorApproveDialog`, and `VendorSuspendDialog`.
  - `/buyers`: Registered customer accounts directory, order histories, and account status toggles (`ACTIVE` / `BLOCKED`).
  - `/categories`: Category taxonomy management, image icon uploads, and category activation.
  - `/earnings`: Platform-wide gross merchandise volume (GMV), total commission collected (10%), and vendor payouts overview.
  - `/settings`: Administrative profile preferences and password management.

---

## 4. API Integration & HTTP Client Strategy

### 4.1 Buyer Frontend Client (`frontend/src/lib/api-client.ts`)
- Configured with `baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"`.
- Uses `withCredentials: true` to send and receive HTTP-only cookies (`accessToken`, `refreshToken`).
- Interceptors capture `401 Unauthorized` responses and trigger automatic token refresh attempts or redirect to `/login`.

### 4.2 Vendor & Admin Clients (`vendor/src/api/client.ts`, `admin/src/api/client.ts`)
- Configured with `withCredentials: true`.
- **Token Interceptor:** Reads `jus_buy_vendor_token` (or `jus_buy_admin_token`) from `localStorage` and injects `Authorization: Bearer <token>`.
- **Refresh Queue & Concurrency:** Maintains a `failedQueue` to prevent parallel cascading refresh requests when multiple API calls trigger 401s concurrently:
  ```typescript
  if (error.response?.status === 401 && !originalRequest._retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => apiClient(originalRequest));
    }
    originalRequest._retry = true;
    isRefreshing = true;
    // Calls /auth/refresh-token, updates localStorage, flushes queue
  }
  ```

---

## 5. UI System & Design Language

- **Tailwind CSS v4:** Modern styling with CSS variables for light/dark themes and standard border-radii (`rounded-md`, `rounded-xl`).
- **Icons:** `lucide-react` for standard UI elements and `react-icons/gr` / `react-icons/fc` for specific glyphs.
- **Charts:** Standardized on `recharts` wrapped in accessible Shadcn-style `ChartContainer` components.
- **Feedback & Notifications:** `sonner` Toaster positioned consistently at `bottom-right` across all dashboards.
