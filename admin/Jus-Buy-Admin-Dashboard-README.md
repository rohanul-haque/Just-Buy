# Jus Buy --- Admin Dashboard Requirements

## 1. Project Overview

The **Jus Buy Admin Dashboard** is a separate frontend application used
by administrators to manage and monitor the multi-vendor e-commerce
platform.

The project must keep three applications separate:

- `frontend/` --- buyer-facing application
- `admin/` --- administrator dashboard
- `backend/` --- API and business logic

The Admin Dashboard must connect to the existing backend APIs. Do not
duplicate backend business logic or create mock APIs when real endpoints
already exist.

## 2. Existing Admin Technology

The Admin application already uses:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- shadcn/ui

Use **Lucide React** for all interface icons.

Install it only if it is not already present:

```bash
npm install lucide-react
```

Use shadcn/ui components for interface primitives such as buttons,
cards, dialogs, inputs, tables, dropdowns, sheets, badges, skeletons,
and toast notifications. Build application-specific components by
composing these primitives.

## 3. Admin Dashboard Layout

Create a consistent admin shell shared by all admin pages.

### Left Sidebar

The left sidebar must contain:

1.  Dashboard
2.  Earnings
3.  Users
4.  Vendors
5.  Categories
6.  Settings
7.  Log Out

Requirements:

- Display the Jus Buy logo/brand area at the top.
- Show an icon and text label for every menu item.
- Highlight the currently active route.
- Keep menu spacing, colors, and alignment consistent with the
  supplied reference screenshots.
- Provide a sidebar toggle button (hamburger/menu button) to collapse
  and expand the sidebar.
- On smaller screens, use a responsive shadcn/ui Sheet or equivalent
  mobile navigation.
- Log Out must invoke the existing authentication logout flow; do not
  create a separate authentication mechanism.

Suggested Lucide React icons:

Menu Icon

---

Dashboard `LayoutDashboard`
Earnings `Wallet`
Users `Users`
Vendors `Store`
Categories `Tags`
Settings `Settings`
Log Out `LogOut`
Sidebar toggle `Menu`
Notifications `Bell`
Profile `UserRound`

Import icons from `lucide-react`. Do not use emoji or mix multiple icon
libraries.

### Top Header

The header must be shared across admin pages and include:

- Sidebar toggle button
- Greeting, such as "Welcome, James"
- Short supporting text, such as "Have a nice day!"
- Notification button with an unread-count indicator when data is
  available
- Admin avatar/profile image
- Admin name and role label

Use real authenticated admin data when available. Avoid hardcoding a
specific admin name or avatar.

## 4. Page Requirements

All pages must render inside the shared Admin Layout and use the same
sidebar and top header.

### 4.1 Dashboard Page

The Dashboard page is the admin overview page.

It should contain:

- A page title and short welcome/overview message.
- Summary cards for key platform metrics, such as total users, total
  vendors, total products, total orders, and platform earnings, when
  those metrics are provided by backend APIs.
- Recent orders or recent platform activity, if supported by the
  backend.
- A concise overview of platform performance.
- Loading, empty, and error states.

Do not invent metric values. Connect to existing dashboard/statistics
APIs where available. If a required endpoint does not exist, clearly
identify the missing backend requirement rather than displaying
fabricated data.

### 4.2 Earnings Page

The Earnings page provides an overview of platform revenue and admin
commission.

It should contain:

- Total platform earnings / admin commission.
- Earnings summary for a selected period, if supported.
- Transaction or earnings history in a table.
- Relevant fields such as transaction reference, order reference,
  vendor, amount, commission, date, and status when returned by the
  API.
- Search, filtering, and pagination when supported by the API.
- Loading, empty, and error states.

Do not assume the platform's commission rate or calculate earnings from
unrelated fields. Follow the backend response and business rules.

### 4.3 Users Page

The Users page is for viewing and managing platform users.

It should contain:

- Users table with available user information, such as name, email,
  role, status, and registration date.
- Search and filters where supported.
- Pagination.
- User details view when a corresponding API exists.
- Status or account actions only when the backend exposes and
  authorizes those operations.
- Loading, empty, and error states.

Do not expose sensitive user data such as passwords or private
authentication secrets.

### 4.4 Vendors Page

The Vendors page is for viewing and managing vendor accounts.

It should contain:

- Vendors table with available vendor/shop information.
- Vendor name, email, shop name, status, and joined date when returned
  by the API.
- Search, status filters, and pagination when supported.
- Vendor details view when an API exists.
- Vendor approval, suspension, or status controls only if those
  actions are supported by the existing backend.
- Loading, empty, and error states.

Do not invent vendor-management endpoints or status values.

### 4.5 Categories Page

The Categories page must closely follow the supplied reference
screenshots.

#### Category Listing

- Show an "Add Category" button near the top-right of the content
  area.
- Display categories in a responsive card grid.
- Each card must show the category image and category name.
- Each card must provide Edit and Delete actions.
- Keep cards visually consistent, with a white background and clear
  spacing.
- Show a loading state while categories are fetched.
- Show a useful empty state when no categories exist.
- Show a useful error state if the API request fails.
- Refresh or update the displayed list after successful create,
  update, or delete operations.

#### Add Category Dialog

Open a dialog when the administrator selects "Add Category".

The dialog must contain:

- Dialog title: "Add new category".
- Category name input.
- Category image upload control.
- Image preview after selection.
- Add Category submit button.
- Validation feedback.
- Loading/disabled state while submitting.

#### Edit Category Dialog

Open the edit dialog for the selected category.

The dialog must contain:

- Dialog title: "Edit category".
- Existing category name prefilled in the input.
- Existing category image preview when available.
- Optional replacement image upload.
- Update submit button.
- Validation feedback.
- Loading/disabled state while submitting.

#### Delete Category

- Ask for confirmation before deleting a category.
- Clearly identify the category being deleted.
- Disable repeated submissions while deletion is in progress.
- Update the category list after successful deletion.
- Display a success or error notification.

#### Category API Integration

Use the existing Category module in the backend. Inspect its actual
controller, service, routes, validation, model, upload middleware, and
response shape before implementing integration.

Create a dedicated frontend service, for example:

`src/api/services/category.service.ts`

The service should implement the operations supported by the backend:

- Fetch categories
- Create category
- Update category
- Delete category

Use the exact backend HTTP methods, endpoint paths, request field names,
and response types. Do not guess them.

For image uploads, use `FormData` and let the browser/client set the
multipart boundary. Do not manually set `Content-Type: multipart/mixed`.
Follow the backend's accepted image MIME types and upload field name.

### 4.6 Settings Page

The Settings page is the administrative settings area.

It may contain sections for:

- Admin profile information
- Account preferences
- Notification preferences
- Password/security settings, only if supported by existing backend
  APIs

Keep the page content-focused and do not implement settings operations
that have no backend support. Do not expose or store passwords in
frontend state beyond the necessary secure form submission flow.

## 5. Suggested Admin Folder Structure

Preserve the current Admin project structure. The following is a
recommended organization, not a requirement to recreate folders that
already exist.

```text
admin/
└── src/
    ├── api/
    │   └── services/
    │       └── category.service.ts
    ├── assets/
    ├── components/
    │   ├── ui/                 # shadcn/ui components
    │   ├── layout/
    │   │   ├── AdminLayout.tsx
    │   │   ├── AdminSidebar.tsx
    │   │   └── AdminHeader.tsx
    │   └── categories/
    │       ├── CategoryCard.tsx
    │       ├── CategoryForm.tsx
    │       ├── AddCategoryDialog.tsx
    │       ├── EditCategoryDialog.tsx
    │       └── DeleteCategoryDialog.tsx
    ├── hooks/
    ├── lib/
    ├── pages/
    │   ├── DashboardPage.tsx
    │   ├── EarningsPage.tsx
    │   ├── UsersPage.tsx
    │   ├── VendorsPage.tsx
    │   ├── CategoriesPage.tsx
    │   └── SettingsPage.tsx
    ├── routes/
    │   ├── actions/
    │   ├── loaders/
    │   └── index.ts
    ├── types/
    ├── App.tsx
    ├── index.css
    └── main.tsx
```

## 6. Routing

Use the existing React Router Data Mode configuration. Keep route
definitions centralized.

Suggested routes:

Page Route

---

Dashboard `/` or `/dashboard`
Earnings `/earnings`
Users `/users`
Vendors `/vendors`
Categories `/categories`
Settings `/settings`

Use the project's existing route convention if it differs. All admin
routes must be protected using the existing authentication and
authorization system.

## 7. Design and Responsive Behaviour

Follow the supplied screenshots as the visual reference:

- Orange brand/sidebar and header treatment.
- Light peach content background for the category listing area.
- White category cards.
- Orange primary action buttons.
- Clear active menu treatment.
- Consistent rounded corners, spacing, and typography.

The layout must also work on tablet and mobile screens. On smaller
screens, the sidebar should become a drawer/sheet and the category grid
should reduce its column count.

Do not sacrifice usability or accessibility to match the screenshot
exactly.

## 8. Component and Code Standards

- Use TypeScript throughout.
- Use shadcn/ui components for UI primitives.
- Use Lucide React for icons.
- Keep components small and reusable.
- Separate API calls from page components.
- Keep API response and request types in appropriate type files.
- Reuse existing API client, authentication utilities, and environment
  configuration.
- Use React Router loaders/actions/fetchers where appropriate and
  consistent with the existing project.
- Avoid duplicated business logic.
- Do not add another UI library.
- Do not modify the Buyer frontend or Backend unless a clearly
  identified missing API capability is required and explicitly
  approved.

## 9. Acceptance Checklist

- [ ] Admin application remains separate from `frontend/` and
      `backend/`.
- [ ] Shared sidebar and header appear on all admin pages.
- [ ] Sidebar links navigate to the correct routes.
- [ ] Sidebar can collapse/expand and works on mobile.
- [ ] Lucide React is used consistently for icons.
- [ ] Dashboard page has a clear overview layout.
- [ ] Earnings page has an earnings summary and history layout.
- [ ] Users page has a user-management table layout.
- [ ] Vendors page has a vendor-management table layout.
- [ ] Categories list loads from the real backend API.
- [ ] Add Category works with the real backend API.
- [ ] Edit Category works with the real backend API.
- [ ] Delete Category requires confirmation and works with the real
      backend API.
- [ ] Category image preview and upload work correctly.
- [ ] Settings page has a clear settings layout.
- [ ] Loading, empty, validation, and error states are handled.
- [ ] No fabricated API endpoints or backend response fields are
      introduced.
- [ ] Existing React, TypeScript, Tailwind CSS, and React Router
      configuration is preserved.

## 10. Final Implementation Instruction

First inspect the existing Admin application and the actual Backend
Category module.

Implement the shared Admin layout and all six sidebar destinations.
Fully implement Category Management against the existing backend APIs.
For Dashboard, Earnings, Users, Vendors, and Settings, create the page
layouts and content sections described above; connect data/actions only
where supported by existing backend APIs.

Do not implement imaginary backend features. Report any missing API
capability clearly. Keep the implementation component-based, typed,
responsive, and consistent with the supplied screenshots.
