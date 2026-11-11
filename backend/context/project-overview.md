# 1. Project Overview

**Project Name:** Jus Buy

**Project Type:** Multi-Vendor E-commerce Platform

**Description:**

Jus Buy is a multi-vendor e-commerce platform where multiple vendors can create and manage their own shops and sell products to customers through a centralized marketplace.

The platform allows guests and registered buyers to browse products, explore vendor shops, manage wishlists and shopping carts, place orders, and make payments through Stripe or Cash on Delivery (COD).

Vendors can create shop profiles, submit verification documents, manage products, process customer orders, and track their sales and earnings. Administrators manage the overall platform, including users, vendors, shop verification, categories, products, orders, payments, and platform commission.

The primary goal of Jus Buy is to provide a secure, organized, and scalable marketplace that connects buyers and multiple independent vendors in one platform.

## 2. Problem Statement

Traditional e-commerce platforms often operate through a single seller or centralized product inventory, limiting opportunities for independent vendors to sell their products.

Buyers may also face difficulties discovering products from different sellers, comparing options, managing purchases, and tracking orders in one place.

Jus Buy aims to solve these problems by providing a centralized multi-vendor marketplace.

- Independent vendors can create their own shops and sell products.
- Buyers can discover products from multiple vendors in one platform.
- Administrators can verify vendors and maintain marketplace quality.
- Buyers can manage their shopping activities and payments.
- Vendors can monitor their orders, sales, and earnings.
- The platform can manage commissions and marketplace operations centrally.

## 3. Project Goals

1. Build a complete multi-vendor e-commerce marketplace.
2. Provide a simple and secure shopping experience for buyers.
3. Allow vendors to create shops and manage their products and orders.
4. Implement vendor verification before allowing selling activities.
5. Provide centralized administration for platform management.
6. Support Stripe and Cash on Delivery payment methods.
7. Implement secure order, stock, payment, and commission management.
8. Build a maintainable and scalable application architecture.

## 4. Target Users

- **Guest:** Browse products, categories, and public vendor shops without creating an account.
- **Buyer:** Register, browse products, manage wishlist and cart, place orders, make payments, and write reviews.
- **Vendor:** Create and manage a shop, submit verification documents, manage products, process orders, and track earnings.
- **Admin:** Manage users, verify vendors, manage categories and products, monitor orders and payments, and oversee platform earnings.

## 5. Core User Flow

### Buyer Flow

1. Visit the Jus Buy platform.
2. Browse products, categories, and vendor shops.
3. Register and verify email through OTP.
4. Log in and complete the buyer profile.
5. Add products to wishlist or shopping cart.
6. Review checkout information and shipping details.
7. Place an order and choose Stripe or COD.
8. Track orders and submit product reviews.

### Vendor Flow

1. Register as a vendor.
2. Verify email through OTP.
3. Log in and access the vendor dashboard.
4. Create a shop and provide required information.
5. Upload verification documents and submit the application.
6. Wait for admin approval.
7. After approval, create and manage products.
8. Manage customer orders and track sales and earnings.

### Admin Flow

1. Log in using an authorized admin account.
2. Access the admin dashboard.
3. Manage users and vendor accounts.
4. Review vendor shop verification applications.
5. Approve, reject, or suspend vendors.
6. Create and manage product categories.
7. Monitor and manage platform products and orders.
8. Monitor payments, commissions, and platform earnings.

## 6. Core Features

### 6.1 Authentication & User Management

Common authentication for buyers, vendors, and admins with registration, login, email OTP verification, password management, and secure token management.

### 6.2 Buyer Profile Management

Buyers can manage their personal information, contact details, address, and profile image.

### 6.3 Vendor Shop Management & Verification

Vendors can create and manage shop information, upload verification documents, and submit their shops for admin approval.

### 6.4 Admin Management

Administrators can manage users, vendors, verification requests, product categories, products, orders, and payments.

### 6.5 Category & Product Management

Admins manage categories, while approved vendors can create, update, and manage their own products, images, prices, stock, and variants.

### 6.6 Public Marketplace

Guests and buyers can explore the home page, product listings, product details, categories, featured products, new arrivals, and public vendor shops.

### 6.7 Wishlist & Shopping Cart

Buyers can save favorite products, add products to their cart, update quantities and sizes, and remove items.

### 6.8 Checkout & Order Management

Buyers can review checkout summaries, provide shipping information, place multi-vendor orders, and track order status.

### 6.9 Payment Management

Support Stripe online payments and Cash on Delivery, with secure payment processing and transaction tracking.

### 6.10 Review & Rating

Buyers can submit product ratings and reviews and manage their own reviews.

### 6.11 Buyer, Vendor & Admin Dashboards

Separate dashboards provide relevant account information, shopping activities, sales statistics, order information, and platform performance.

### 6.12 Commission & Earnings Management

The platform calculates a 15% commission on product sales and allocates the remaining 85% to the vendor. Shipping charges are excluded from commission calculations.

## 7. Project Scope

### 7.1 In Scope

- Common user authentication and role-based access control.
- Mandatory email OTP verification.
- Buyer profile management.
- Vendor shop creation and verification.
- Admin user and vendor management.
- Product category management.
- Vendor product and inventory management.
- Public product and shop browsing.
- Wishlist and shopping cart.
- Checkout and shipping management.
- Multi-vendor order management.
- Stripe and Cash on Delivery payments.
- Product reviews and ratings.
- Buyer, vendor, and admin dashboards.
- Commission and earnings tracking.
- Cloudinary image and document management.

### 7.2 Out of Scope

The following features are excluded from the current project scope:

- Dynamic banner management system.
- Notification system.
- Vendor withdrawal and payout system.
- Advanced enterprise-level permission management.
- Separate commission management model.
- Dedicated order item model.
- Native mobile applications.

### 7.3 Future Enhancements

- Dynamic promotional banner management.
- Notification and email notification system.
- Vendor withdrawal and payout management.
- Advanced analytics and reporting.
- Mobile applications.
- Additional payment gateway integrations.
- Advanced marketplace features.

## 8. Success Criteria

1. Buyers can register, verify their email, browse products, and successfully place orders.
2. Vendors can create shops, complete verification, and sell products after approval.
3. Admins can manage users, vendors, categories, products, orders, and payments.
4. The platform correctly supports multi-vendor orders and individual vendor order management.
5. Stripe and COD payments work reliably.
6. Product stock, order totals, and commissions are calculated and validated on the backend.
7. The platform correctly calculates 15% admin commission and 85% vendor earnings, excluding shipping charges.
8. User data and private vendor verification documents remain protected.
9. Each user role can access only its authorized resources and operations.

## 9. Assumptions & Constraints

### 9.1 Assumptions

- The platform supports three account roles: BUYER, VENDOR, and ADMIN.
- Guests can browse public marketplace content without registration.
- Buyer and vendor accounts require email verification before login.
- Admin accounts are created through a secure administrative process, not public registration.
- Vendors must receive shop approval before performing selling-related operations.
- Buyers can purchase products from multiple vendors in a single order.
- The platform earns a 15% commission on eligible product sales.
- Stripe and Cash on Delivery are the initial supported payment methods.

### 9.2 Constraints

- The backend uses Node.js, Express.js, TypeScript, MongoDB, and Mongoose.
- The backend follows a modular architecture.
- Zod is used for request validation.
- JWT access and refresh tokens are used for authentication.
- Cloudinary is used for image and file storage.
- Stripe is used for online payment processing.
- All financial calculations and payment status updates must be validated by the backend.
- Vendor selling permissions depend on shop verification status.
- Private verification documents must not be exposed through public APIs.
- Only features explicitly included in the current project scope should be implemented.

---

**Document:** Project Overview

**Project:** Jus Buy

**Version:** 1.0

**Status:** Approved
