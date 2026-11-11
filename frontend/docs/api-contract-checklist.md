# Backend API Contract Checklist

Complete this document from backend source code or official API documentation before implementing each operation. Do not guess missing values.

| Feature | Operation | Method | Exact path | Auth | Request/response verified |
|---|---|---|---|---|---|
| Auth | Create account | TBD | TBD | TBD | No |
| Auth | Login | TBD | TBD | TBD | No |
| Auth | Refresh token | TBD | TBD | TBD | No |
| Auth | Change password | TBD | TBD | TBD | No |
| Auth | Verify account | TBD | TBD | TBD | No |
| Auth | Resend OTP | TBD | TBD | TBD | No |
| Auth | Logout | TBD | TBD | TBD | No |
| Buyer | Get profile | TBD | TBD | TBD | No |
| Buyer | Update profile | TBD | TBD | TBD | No |
| Buyer | Order history | TBD | TBD | TBD | No |
| Category | List categories | TBD | TBD | TBD | No |
| Product | New arrivals (4) | TBD | TBD | TBD | No |
| Product | Explore products (8) | TBD | TBD | TBD | No |
| Product | All products | TBD | TBD | TBD | No |
| Product | Product details | TBD | TBD | TBD | No |
| Review | Get/create reviews | TBD | TBD | TBD | No |
| Product | Related products | TBD | TBD | TBD | No |
| Wishlist | Get wishlist | TBD | TBD | TBD | No |
| Wishlist | Add item | TBD | TBD | TBD | No |
| Wishlist | Remove item | TBD | TBD | TBD | No |
| Cart | Add item | TBD | TBD | TBD | No |
| Cart | Get/update/remove | TBD | TBD | TBD | No |

For each endpoint, additionally record:
- Path params and query params
- Request body schema
- Success status and response envelope
- Error envelope and field-level validation format
- Pagination, sorting and filtering rules
- Role/permission requirements
- Cookie/credential behavior
- Rate limits, OTP cooldowns and expiry, if applicable
- Business rules and edge cases

Only mark a row verified after checking the backend implementation or authoritative API documentation.
