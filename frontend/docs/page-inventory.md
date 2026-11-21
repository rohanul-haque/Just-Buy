# Page Inventory

This is an initial inventory based on the currently requested API scope. Actual routes must be confirmed against Figma and product requirements.

| Area | Candidate page/section | Data dependency | Notes |
|---|---|---|---|
| Storefront | Homepage | Categories, New Arrivals, Explore Products | New Arrivals displays 4; Explore displays 8 |
| Storefront | Category listing/detail | Categories/products | Route and filters depend on Figma/API |
| Products | All products | Product list | Filters/sort/pagination only if API supports |
| Products | Product details | Product detail | Use actual product identifier |
| Products | Reviews section/page | Review API | Read/write permissions must be verified |
| Products | Related products | Related products API/relationship | Do not infer relationship algorithm |
| Auth | Create account | Registration | Confirm verification flow |
| Auth | Login | Login | Confirm session behavior |
| Auth | Verify account | OTP/account verification | Confirm OTP contract |
| Auth | Forgot/resend OTP UI | Resend OTP | Exact screen depends on Figma |
| Auth | Change password | Password change | Confirm whether authenticated |
| Buyer | Profile | Get/update profile | Not a dashboard |
| Buyer | Order history | Orders | Confirm pagination/status filters |
| Buyer | Wishlist | Wishlist API | Confirm list/add/remove endpoints |
| Buyer | Cart | Cart API | Add-to-cart confirmed; other actions require verification |

Do not create a page solely because it appears in this table. Confirm the Figma frame and route requirements first.
