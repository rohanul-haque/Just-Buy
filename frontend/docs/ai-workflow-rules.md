# AI Workflow Rules

## Understand first

- Read the relevant project docs and inspect the actual code before proposing changes.
- Read installed Next.js 16 documentation relevant to the task from `node_modules/next/dist/docs/`.
- Inspect current dependencies and shadcn component implementation. Do not assume component APIs from a different version.
- Inspect Git status and protect unrelated changes.

## Plan before implementation

State objective, expected behavior, affected files, API dependencies, unknowns, risks and verification plan. Ask for clarification if a business rule, design behavior or API contract is ambiguous.

## Implement narrowly

- Work on one feature/page at a time.
- Do not start the next phase without approval.
- Avoid unnecessary dependencies, duplicate code and broad refactors.
- Preserve existing behavior outside the task.
- Do not fabricate mock production behavior or fake API success.
- Do not create dashboard features in this project scope.

## Security and reliability

- Never expose secrets or httpOnly cookies.
- Do not trust client-side role checks as backend authorization.
- Avoid logging credentials, tokens, OTPs or personal data.
- Handle failed requests explicitly.
- Clear user-specific cache on logout/account switch.

## Git safety

- Never run destructive Git commands without explicit approval.
- Do not commit or push unless requested.
- Review changed files and diff before reporting.

## Verification

Run relevant existing scripts for typecheck, lint, tests and build. If a check cannot run, explain why. Update the progress tracker only after actual implementation and verification.

## Final report

Summarize changes, files, endpoints, tests run, results, blockers and next recommended task.
