# Code Standards

## TypeScript

- Keep `strict` mode enabled where the existing project permits it.
- Avoid `any`. Prefer `unknown` and narrow values safely.
- Do not use type assertions to hide incorrect API contracts.
- Infer form types from Zod schemas where practical.
- Keep API response types aligned with verified backend response shapes.

## Naming

- Components: PascalCase (`ProductCard.tsx`).
- Hooks: `use` + camelCase (`useProducts.ts`).
- Services: descriptive camelCase (`product.service.ts`).
- Schemas: descriptive camelCase (`login.schema.ts`).
- Types/interfaces: PascalCase.
- Constants: follow existing repository convention; use uppercase for true constants.

## Components

- Keep components focused on one responsibility.
- Extract repeated UI only when reuse is real or the component has meaningful complexity.
- Avoid huge page components and deeply nested conditional JSX.
- Prefer composition over many boolean props.
- Use semantic HTML and accessible names.
- Include `key` values that are stable identifiers, not array indexes for mutable lists.

## Styling

- Use Tailwind utilities and existing design tokens.
- Use the project's `cn` utility for conditional class composition if it exists.
- Do not introduce arbitrary hex values throughout components. Define approved colors as theme tokens/CSS variables.
- Match Figma spacing, typography, radius, shadows and breakpoints.
- Avoid one-off styles when a reusable token or component variant is appropriate.
- Do not add a second styling system without approval.

## Error handling

- Never swallow errors silently.
- Display user-safe messages; do not expose stack traces, secrets or internal server details.
- Handle validation errors, network errors, unauthorized responses and unexpected errors distinctly where the API contract allows.
- Do not show success notifications before the operation succeeds.

## Imports and files

- Follow existing alias and import conventions.
- Keep import path casing identical to the actual file name.
- Avoid circular dependencies.
- Do not create barrel files automatically; use them only where they improve the established architecture.
