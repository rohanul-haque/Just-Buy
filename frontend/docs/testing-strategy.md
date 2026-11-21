# Testing Strategy

Use only test tools and scripts already configured or explicitly approved.

## Component tests

- Correct rendering and Figma variants
- Accessible labels and names
- Keyboard interactions
- Disabled, loading and error states

## Forms

- Required and invalid values
- Valid submission
- Pending and duplicate-submit behavior
- Backend validation errors
- Network/server failures

## API/query

- Exact method, URL and payload
- Query keys include all relevant variables
- Mutations invalidate/update dependent queries
- Unauthorized and expired-session behavior
- User-scoped cache cleared on logout

## Pages

- Correct route and navigation
- Loading, empty, error and success states
- Role/access behavior based on backend contract
- Responsive layout and no horizontal overflow

## Visual QA

Compare against Figma at the same viewport size. Verify typography, spacing, colors, component states, image crops and responsive behavior. Do not mark a page complete while significant differences or untested states remain.
