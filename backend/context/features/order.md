# Jus Buy – Order Module Features

## 1. Project Overview

Order Module handles the complete order management process for the Jus Buy multi-vendor e-commerce platform.

Buyers can place orders using their Cart, view their order history, check order details, and cancel eligible orders.

The system automatically calculates product subtotals, shipping charges, admin commissions, and vendor earnings.

## 2. Order APIs

| Method | Endpoint                 | Access               | Description                                           |
| ------ | ------------------------ | -------------------- | ----------------------------------------------------- |
| POST   | `/orders`                | Buyer                | Place order using active cart (COD or Stripe)         |
| GET    | `/orders`                | Admin                | Get all orders with pagination & filters              |
| GET    | `/orders/my-orders`      | Buyer                | Get buyer order history                               |
| GET    | `/orders/vendor/orders`  | Vendor               | Get orders belonging to vendor                        |
| GET    | `/orders/:orderId`       | Buyer, Vendor, Admin | Get order details and snapshot                        |
| PATCH  | `/orders/:orderId/cancel`| Buyer                | Cancel order and restore stock                        |
| PATCH  | `/orders/:orderId/status`| Vendor, Admin        | Update order status (Owner Vendor or Admin)           |

## 3. Create Order

**POST `/orders`**

- Only authenticated Buyers can create orders.
- Buyer ID will be derived from the authenticated user.
- Retrieve the Buyer's Cart.
- Reject if Cart does not exist or contains no items.
- Accept shipping address from the request body.
- Validate all Cart Products.
- Ensure Products exist and are active.
- Check available stock for each Product.
- Validate selected Product sizes when applicable.
- Calculate item subtotal, Order subtotal, shipping charge, and total amount on the server.
- Calculate admin commission and vendor earnings for each Order Item.
- Store Product information as historical snapshots.
- Support multiple Vendors within a single Order.
- Generate a unique transaction number.
- Decrease Product stock after successful Order creation.
- Clear the Buyer's Cart after successful Order creation.
- Use MongoDB transactions to maintain data consistency.

## 4. Get My Orders

**GET `/orders/my-orders`**

- Only authenticated Buyers can access this endpoint.
- Retrieve only the authenticated Buyer's Orders.
- Support pagination.
- Support optional Order status filtering.
- Return newest Orders first.
- Include Order items, shipping information, amounts, and Order status.
- Return pagination metadata.
- Do not expose other Buyers' Orders.

## 5. Get Order Details

**GET `/orders/:orderId`**

- Only authenticated Buyers can access this endpoint.
- Validate Order ID.
- Retrieve the requested Order.
- Verify Order ownership.
- Return complete Order information.
- Include transaction number, shipping address, Product items, Vendor information, prices, quantities, commission details, and total amounts.
- Preserve historical Product information.
- Return appropriate errors for invalid or nonexistent Orders.
- Prevent access to another Buyer's Order.

## 6. Cancel Order

**PATCH `/orders/:orderId/cancel`**

- Only authenticated Buyers can cancel their own Orders.
- Validate Order ID.
- Verify Order ownership.
- Check whether the Order is eligible for cancellation.
- Prevent cancellation of already cancelled Orders.
- Prevent cancellation of delivered or otherwise non-cancellable Orders.
- Update Order status and relevant Order Item statuses.
- Restore Product stock after successful cancellation.
- Use MongoDB transactions for Order status updates and stock restoration.
- Prevent duplicate stock restoration.
- Return the updated Order.

## 7. Order Calculation Rules

### Item Subtotal

`itemSubtotal = unitPrice × quantity`

### Admin Commission

`adminCommission = itemSubtotal × commissionRate / 100`

### Vendor Earning

`vendorEarning = itemSubtotal - adminCommission`

### Order Subtotal

`subtotal = sum of all itemSubtotals`

### Total Amount

`totalAmount = subtotal + shippingCharge`

- Commission rate will come from the existing platform commission configuration.
- Store commission rate and calculated commission amounts in each Order Item.
- Historical commission values must not change when the platform commission rate changes.
- Shipping charge will be calculated using the existing shipping configuration.
- All financial calculations must be performed on the server.

## 8. Business Rules

- One Buyer Order can contain Products from multiple Vendors.
- A single Order document will contain all purchased Product Items.
- Each Order Item must maintain its respective Vendor reference.
- Product price, name, image, brand, and commission details must be stored as snapshots.
- Product stock must never become negative.
- Cart stock is not reserved before Order creation.
- Order creation and stock deduction must be atomic.
- Buyers can access and cancel only their own Orders.
- Buyers cannot modify Order prices, quantities, shipping charges, or commission details after Order creation.
- Order cancellation must restore stock only once.
- Refund processing will be handled by the Payment module when implemented.

## 9. Security & Authorization

- All Order APIs require authentication.
- All endpoints are restricted to `UserRole.BUYER`.
- Buyer ID must come from the authenticated user.
- Never trust client-provided financial information.
- Validate all request parameters and body data using Zod.
- Use centralized error handling.
- Ensure proper Order ownership verification.

## 10. Expected Order Module Structure

```text
src/modules/v1/order/
├── order.model.ts
├── order.interface.ts
├── order.validation.ts
├── order.service.ts
├── order.controller.ts
└── order.route.ts
```
