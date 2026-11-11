# Feature Scope and Implementation Order

## A. Authentication

- Create account / registration
- Login
- Refresh token
- Change password
- Verify account
- Resend OTP
- Logout

Implement only the actual backend-supported flow. Confirm whether account verification is required before login, what OTP purpose/length/expiry applies, how resend throttling works, how refresh is triggered, and what logout invalidates.

## B. Buyer

- Get buyer profile
- Update buyer profile
- Buyer order history

Do not create buyer dashboard analytics or unrelated profile sections unless Figma and requirements specify them.

## C. Public shopping

- Category listing
- New Arrivals section: request/display 4 products
- Explore Products section: request/display 8 products
- All Products
- Product Details
- Product Reviews
- Related Products

The numbers 4 and 8 define the homepage display limits. Confirm whether the backend supports limit/query parameters. If it does not, retrieve data according to the actual API contract and limit the rendered section client-side without pretending the server applied a limit.

## D. Wishlist

- Get wishlist, if endpoint exists
- Add product to wishlist
- Remove product from wishlist, if endpoint exists
- Other operations only when confirmed by backend

## E. Cart

- Add to cart
- Get/update/remove cart items only if the backend supports them

Do not invent quantity limits, stock rules, price calculations, shipping, discounts or checkout behavior.

## Explicitly excluded

- Buyer dashboard
- Seller dashboard
- Admin dashboard
- Seller product management
- Admin management screens
- Dashboard analytics
- Checkout/payment unless separately approved

## Recommended phases

| Phase | Scope | Exit criteria |
|---|---|---|
| 0 | Repository, Next.js docs, Figma and backend audit | Findings and plan approved |
| 1 | Design tokens, shared UI, providers, Axios and Query | Foundation verified |
| 2 | Authentication | All listed auth flows integrated and tested |
| 3 | Buyer profile and order history | Get/update/history work with real API |
| 4 | Categories and product discovery | Category, homepage sections and listing work |
| 5 | Product detail, reviews and related products | Detail page and supported review flows work |
| 6 | Wishlist and cart | Supported operations work |
| 7 | Responsive and quality audit | Relevant checks and visual QA completed |

Do not begin a later phase automatically.
