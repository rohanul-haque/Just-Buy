# Figma-to-Code Workflow

Repeat this workflow for each individual page. Do not implement all pages in one large pass.

## 1. Identify the page

Record Figma frame, intended route, user role, entry point and user goal.

## 2. Inspect Figma

Inspect desktop/tablet/mobile frames, component instances, variables, assets, text styles, spacing, variants and interactions. Check existing shared components in the Figma library.

## 3. Inspect repository

Find existing layouts, components, route conventions, styles and dependencies. Reuse existing patterns when suitable.

## 4. Verify backend contract

Identify the exact endpoints and permissions required. Record request/response/error shapes in `api-contract-checklist.md`.

## 5. Write a page specification

```md
# Page: [Figma frame]

- Route:
- Figma link/frame:
- Role:
- Viewports:
- User goal:

## Layout sections
- [ ] Header
- [ ] Main content
- [ ] Supporting content
- [ ] Footer/actions

## Components
- [ ] Existing reusable components
- [ ] New shared components
- [ ] Page-specific components

## States and interactions
- [ ] Loading
- [ ] Empty
- [ ] Error
- [ ] Success
- [ ] Disabled/focus/validation
- [ ] Navigation and actions

## API
- Method/path:
- Auth:
- Request:
- Response:
- Error behavior:

## Responsive behavior
- Mobile:
- Tablet:
- Desktop:

## Acceptance criteria
- [ ] Matches Figma at target sizes
- [ ] No horizontal overflow
- [ ] Keyboard accessible
- [ ] API behavior verified
- [ ] Tests/checks run
```

## 6. Implement in layers

1. Route shell and page layout.
2. Reusable components and verified design tokens.
3. Static visual structure and Figma assets.
4. Responsive behavior.
5. Interactions and validation.
6. API integration.
7. Loading/empty/error/success states.
8. Accessibility and visual refinement.

## 7. Compare and verify

Use matching viewport dimensions. Compare spacing, alignment, typography, colors, image crops, borders, radii, shadows, responsive transitions and interaction states. Record deviations and fix them before marking the page complete.
