# This Is NOT the Backend Stack You Know

This project uses specific versions of Node.js, Express.js, TypeScript, MongoDB, Mongoose, and other backend dependencies.

APIs, conventions, configurations, and implementation patterns may differ from your training data.

Never assume that your previously learned APIs, conventions, or implementation patterns are compatible with this project.

## 1. Version-Aware Development

Before writing or modifying any backend code:

- Inspect package.json to identify declared dependency versions.
- Inspect the relevant lockfile to identify resolved dependency versions.
- Verify actual installed package versions when dependencies are available.
- Check the Node.js runtime version and package manager configuration.
- Read the relevant official documentation for the installed versions.
- Check existing project implementation and conventions.
- Pay attention to breaking changes, deprecated APIs, and migration requirements.
- Verify configuration options and API signatures against the installed versions.
- Never assume that APIs or conventions from older versions are still valid.
- Never introduce APIs based solely on training knowledge when version-specific documentation is available.
- Always follow the actual installed versions and their official documentation.

Do not rely on outdated knowledge when the installed documentation is available.

## 2. Official Documentation Requirements

When implementing functionality that depends on external libraries or frameworks:

- Prefer official documentation.
- Use documentation matching the installed dependency version.
- Check migration guides when encountering breaking changes.
- Review deprecation notices before using existing APIs.
- Verify configuration requirements and compatibility.
- Do not blindly copy examples from outdated tutorials, blog posts, or Stack Overflow answers.
- If the exact documentation is unavailable, clearly identify the limitation and verify the implementation against the installed package where possible.

## 3. Dependency Management

- Check existing dependencies before introducing new packages.
- Prefer existing project dependencies and utilities.
- Do not install additional packages without explicit approval.
- Do not upgrade, downgrade, or replace dependencies without authorization.
- Avoid unnecessary dependency and configuration changes.
- Verify package compatibility before proposing dependency changes.
- Never modify lockfiles manually.
- Preserve the existing package manager and dependency management conventions.

## 4. Existing Implementation Awareness

Before modifying existing functionality:

- Inspect the relevant source files.
- Understand existing module responsibilities.
- Review related controllers, services, models, routes, middleware, and utilities.
- Identify existing shared functionality.
- Follow established naming conventions and implementation patterns.
- Understand relevant dependencies and integration points.
- Avoid duplicating existing business logic.
- Never rewrite working code unnecessarily.
- Preserve existing behavior unless changes are explicitly required.

## 5. Application Building Context

Read the following files in order before implementing or making any architectural decision:

1. `context/project-overview.md` — Product definition, goals, features, and scope.
2. `context/project-architecture.md` — System structure, boundaries, storage model, and invariants.
3. `context/code-standards.md` — Implementation rules and conventions.
4. `context/ai-workflow-rules.md` — Development workflow, scoping rules, and delivery approach.
5. `context/progress-tracker.md` — Current phase, completed work, open questions, and next steps.

### Context Reading Rules

- Read the relevant context files completely before starting implementation.
- Follow the specified reading order.
- Use project documentation as the primary source for project-specific requirements.
- Do not silently override documented architectural decisions.
- Identify conflicting requirements before implementation.
- Ask for clarification when a conflict affects business logic, architecture, or security.
- Never assume that requirements from another project apply here.

## 6. Implementation Scope

- Implement only the feature explicitly requested by the user.
- Follow the approved architecture and folder structure.
- Reuse existing utilities, services, and infrastructure.
- Maintain separation of concerns.
- Avoid unnecessary abstractions and complexity.
- Do not modify unrelated files or modules.
- Do not introduce unapproved features, models, dependencies, or architectural patterns.
- Preserve existing functionality.
- Obtain approval before significant architectural or business logic changes.

## 7. Context and Documentation Synchronization

Update context/progress-tracker.md after each meaningful implementation change.

If implementation changes documented architecture, scope, or coding standards:

- Update the relevant context file.
- Keep documentation consistent with actual implementation.
- Record important architectural decisions.
- Record unresolved questions and blockers.
- Never document planned functionality as implemented functionality.
- Never mark unverified work as completed.

Keep all project documentation synchronized with the actual codebase.

## 8. Testing and Verification

After implementation:

- Run relevant TypeScript checks.
- Run relevant tests.
- Run linting when available.
- Run production build checks when applicable.
- Verify success and failure scenarios.
- Check relevant edge cases.
- Review security and authorization.
- Check for regressions in existing functionality.
- Fix issues introduced by the implementation.

Never claim that a test, build, or verification passed without actually executing it.

Clearly report unavailable tests, failed checks, and unverified functionality.

## 9. Security and Reliability

- Protect credentials, secrets, and sensitive user data.
- Never expose confidential information.
- Validate untrusted input.
- Enforce authentication and authorization.
- Verify resource ownership.
- Follow existing security controls.
- Preserve database consistency.
- Handle errors appropriately.
- Avoid exposing internal implementation details.
- Never weaken security to simplify implementation.

## 10. Progress Tracking

Keep context/progress-tracker.md synchronized with actual development progress.

Update relevant information when:

- A feature starts.
- A feature is implemented.
- An implementation enters review or testing.
- A feature is completed.
- A technical blocker is identified or resolved.
- An architectural decision changes.
- A development phase changes.

A feature can only be marked completed after its required implementation and verification are finished.

## 11. Final Reporting

After completing a task, report:

- Implementation summary.
- Created files.
- Modified files.
- Important technical decisions.
- Dependencies changed, if authorized.
- Tests and verification results.
- Documentation updates.
- Progress tracker updates.
- Remaining issues and blockers.

Do not automatically start the next feature after completing the current task.

Wait for the user's next instruction unless continuing work is explicitly authorized.

---

**Final Rule:**

Understand the installed technology stack, read the project context, inspect existing implementation, plan before coding, implement only the approved scope, verify the result, and keep project documentation synchronized with the actual codebase.

Never assume. Always verify.

**End of AGENTS.md**
