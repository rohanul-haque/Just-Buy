const MESSAGES = {
  // General
  SUCCESS: "Request successful",
  CREATED: "Resource created successfully",
  UPDATED: "Resource updated successfully",
  DELETED: "Resource deleted successfully",
  BAD_REQUEST: "Invalid request",
  UNAUTHORIZED: "Authentication required",
  FORBIDDEN: "You do not have permission to access this resource",
  NOT_FOUND: "Resource not found",
  INTERNAL_SERVER_ERROR: "Internal server error",
  VALIDATION_ERROR: "Validation failed",
  TOO_MANY_REQUESTS: "Too many requests. Please try again later",

  // Authentication
  SIGNUP_SUCCESS: "Signup successful",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",

  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_ALREADY_EXISTS: "Email already exists",
  ACCOUNT_NOT_FOUND: "Account not found",
  ACCOUNT_DISABLED: "Your account has been disabled",

  // Access Token
  TOKEN_MISSING: "Authentication token is missing",
  TOKEN_INVALID: "Invalid authentication token",
  TOKEN_EXPIRED: "Authentication token has expired",

  // Refresh Token
  REFRESH_TOKEN_MISSING: "Refresh token is missing",
  REFRESH_TOKEN_INVALID: "Invalid refresh token",
  REFRESH_TOKEN_EXPIRED: "Refresh token has expired",

  // Token
  TOKEN_REFRESH_SUCCESS: "Authentication token refreshed successfully",
  TOKEN_REFRESH_FAILED: "Failed to refresh authentication token",

  // OTP
  INVALID_OTP: "Invalid OTP",
  OTP_EXPIRED: "OTP has been expired",
  OTP_NOT_MATCH: "OTP does not match",

  // User
  USER_CREATED: "User created successfully",
  USER_UPDATED: "User updated successfully",
  USER_DELETED: "User deleted successfully",
  USER_NOT_FOUND: "User not found",

  // Admin
  ADMIN_CANNOT_REGISTER: "You cannot register as an admin",
  ADMIN_PROFILE_CREATED: "Admin profile created successfully",

  // Buyer Authentication
  BUYER_SIGNUP_SUCCESS: "Buyer signup successful",
  BUYER_LOGIN_SUCCESS: "Buyer login successful",
  BUYER_LOGOUT_SUCCESS: "Buyer logout successful",

  // Buyer Profile
  BUYER_PROFILE_CREATED: "Buyer profile created successfully",
  BUYER_PROFILE_UPDATED: "Buyer profile updated successfully",
  BUYER_PROFILE_DELETED: "Buyer profile deleted successfully",
  BUYER_PROFILE_NOT_FOUND: "Buyer profile not found",
  BUYER_PROFILE_ALREADY_EXISTS: "Buyer profile already exists",

  // Seller Authentication
  SELLER_SIGNUP_SUCCESS: "Seller signup successful",
  SELLER_LOGIN_SUCCESS: "Seller login successful",
  SELLER_LOGOUT_SUCCESS: "Seller logout successful",

  // Seller Profile
  SELLER_PROFILE_CREATED: "Seller profile created successfully",
  SELLER_PROFILE_UPDATED: "Seller profile updated successfully",
  SELLER_PROFILE_DELETED: "Seller profile deleted successfully",
  SELLER_PROFILE_NOT_FOUND: "Seller profile not found",
  SELLER_PROFILE_ALREADY_EXISTS: "Seller profile already exists",

  SELLER_NOT_APPROVED: "Seller account is not approved",
  SELLER_VERIFICATION_PENDING: "Seller verification is pending",
  SELLER_VERIFIED: "Seller account has been verified",
  SELLER_REJECTED: "Seller account has been rejected",
  SELLER_CANNOT_CREATE_PRODUCT:
    "You cannot create product because your account is not approved",

  // Password
  PASSWORD_CHANGED: "Password changed successfully",
  PASSWORD_CHANGE_FAILED: "Failed to change password",
  CURRENT_PASSWORD_INCORRECT: "Current password is incorrect",

  // Forgot Password
  PASSWORD_RESET_OTP_SENT: "Password reset OTP sent successfully",
  PASSWORD_RESET_OTP_VERIFIED: "Password reset OTP verified successfully",
  PASSWORD_RESET_SUCCESS: "Password reset successfully",
  PASSWORD_RESET_OTP_INVALID: "Invalid password reset OTP",
  PASSWORD_RESET_OTP_EXPIRED: "Password reset OTP has expired",
  PASSWORD_RESET_TOKEN_INVALID: "Invalid password reset token",
  PASSWORD_RESET_TOKEN_EXPIRED: "Password reset token has expired",

  // Product
  PRODUCT_CREATED: "Product created successfully",
  PRODUCT_UPDATED: "Product updated successfully",
  PRODUCT_DELETED: "Product deleted successfully",
  PRODUCT_NOT_FOUND: "Product not found",
  PRODUCT_ALREADY_EXISTS: "Product already exists",
  PRODUCT_OUT_OF_STOCK: "Product is out of stock",
  PRODUCTS_FETCHED: "Products fetched successfully",
  PRODUCT_FETCHED: "Product fetched successfully",

  // Category
  CATEGORY_IMAGE_REQUIRED: "Category image is required",
  CATEGORY_CREATED: "Category created successfully",
  CATEGORY_UPDATED: "Category updated successfully",
  CATEGORY_DELETED: "Category deleted successfully",
  CATEGORY_NOT_FOUND: "Category not found",
  CATEGORY_ALREADY_EXISTS: "Category already exists",
  CATEGORIES_FETCHED: "Categories fetched successfully",
  CATEGORY_FETCHED: "Category fetched successfully",
  CATEGORY_STATUS_UPDATED: "Category status updated successfully",

  // Cart
  CART_CREATED: "Cart created successfully",
  CART_UPDATED: "Cart updated successfully",
  CART_DELETED: "Cart deleted successfully",
  CART_NOT_FOUND: "Cart not found",
  CART_ITEM_ADDED: "Item added to cart successfully",
  CART_ITEM_UPDATED: "Cart item updated successfully",
  CART_ITEM_REMOVED: "Item removed from cart successfully",
  CART_ITEM_NOT_FOUND: "Cart item not found",
  CART_ITEM_OUT_OF_STOCK: "Product is out of stock",

  // Wishlist
  WISHLIST_CREATED: "Wishlist created successfully",
  WISHLIST_UPDATED: "Wishlist updated successfully",
  WISHLIST_DELETED: "Wishlist deleted successfully",
  WISHLIST_NOT_FOUND: "Wishlist not found",
  WISHLIST_ITEM_ADDED: "Item added to wishlist successfully",
  WISHLIST_ITEM_REMOVED: "Item removed from wishlist successfully",
  WISHLIST_ITEM_NOT_FOUND: "Wishlist item not found",
  PRODUCT_ALREADY_WISHED: "Product already in wishlist",

  // Order
  ORDER_CREATED: "Order placed successfully",
  ORDER_UPDATED: "Order updated successfully",
  ORDER_STATUS_UPDATED: "Order status updated successfully",
  ORDER_CANCELLED: "Order cancelled successfully",
  ORDER_NOT_FOUND: "Order not found",
  ORDER_CANNOT_BE_CANCELLED: "This order cannot be cancelled",

  // Payment
  PAYMENT_SUCCESS: "Payment completed successfully",
  PAYMENT_FAILED: "Payment failed",
  PAYMENT_NOT_FOUND: "Payment not found",
  PAYMENT_ALREADY_COMPLETED: "Payment has already been completed",

  // Review
  REVIEW_CREATED: "Review submitted successfully",
  REVIEW_UPDATED: "Review updated successfully",
  REVIEW_DELETED: "Review deleted successfully",
  REVIEW_NOT_FOUND: "Review not found",
  REVIEW_ALREADY_EXISTS: "You have already reviewed this product",
  REVIEW_NOT_ALLOWED: "You are not allowed to review this product",

  // File Upload
  FILE_UPLOAD_SUCCESS: "File uploaded successfully",
  FILE_UPLOAD_FAILED: "File upload failed",
  INVALID_FILE_TYPE: "Invalid file type",
  FILE_TOO_LARGE: "File size is too large",
} as const;

export default MESSAGES;
