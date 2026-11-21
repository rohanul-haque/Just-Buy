# Forms and Validation

Use React Hook Form and Zod where they are installed and compatible with the current project versions.

## Rules

- Keep schemas inside the relevant feature's `schemas/` directory.
- Infer form value types from Zod schemas where practical.
- Validate for user experience, but backend validation remains authoritative.
- Map backend field errors to fields only when the error contract supports it.
- Disable submission while pending and prevent duplicate submits.
- Preserve values after recoverable failures.
- Associate labels, descriptions and errors with controls.
- Use suitable autocomplete and input types.
- Do not trim or normalize passwords unless backend rules explicitly require it.
- Do not invent password complexity, OTP length, OTP expiry, resend cooldown or attempt limits.

## Required states

Consider pristine, focused, filled, invalid, submitting, success and disabled/read-only states where appropriate and supported by Figma.

## Auth flows

Confirm the backend's registration, verification, resend, login, refresh, password-change and logout sequence. Do not assume registration automatically logs the user in or that verification uses a particular OTP format.
