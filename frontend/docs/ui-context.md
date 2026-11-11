# UI Context and Design System

## Design source

The supplied Figma file is the source of truth. Two reference screenshots were also supplied:
1. An input-field catalogue showing light and dark treatments, placeholder/filled states, leading/trailing icons, password visibility, select, phone and compact numeric inputs.
2. A color-system catalogue showing neutral grey, blue and orange-family palettes with multiple interaction/emphasis levels.

The screenshots are references, not sufficient specifications for every page. Inspect exact Figma variables and component variants.

## Figma inspection

For every page and shared component, record:
- Figma page/frame name and link
- Exact frame dimensions and responsive variants
- Color variables and semantic roles
- Font family, size, weight, line height and letter spacing
- Spacing, sizing, border, radius and shadow
- Component variants and interaction states
- Assets, icon names and image crop behavior
- Hover, focus, active, disabled, loading, validation and success states
- Navigation and interaction behavior

## Design tokens

Extract actual values from Figma before implementation. Use semantic tokens such as background, foreground, surface, muted, border, primary, secondary, accent, destructive, success, warning and focus ring. Do not use guessed hex values from screenshots when Figma variables are available.

Do not assume the two orange palettes have the same purpose. Confirm their intended semantic use in Figma.

## Input system

Inspect and implement only variants present in Figma:
- Placeholder/default
- Filled
- Focused
- Invalid
- Disabled/read-only
- Leading/trailing icon
- Password visibility
- Search clear/filter
- Select
- Phone/country selector
- Compact numeric input
- Light/dark theme, if supported

Ensure labels, descriptions and error messages are accessible. Icon-only controls need accessible names.

## Responsive behavior

Match Figma's mobile/tablet/desktop frames. Do not simply scale down desktop. Prevent horizontal overflow and verify navigation, grids, forms, dialogs, product cards and tables at target widths.
