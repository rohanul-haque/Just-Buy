# AI Workflow Rules

**Purpose:** Define how AI coding agents must understand, plan, implement, test, document, and maintain a software project.

These rules apply to every development task unless explicitly overridden by the user.

## 1. Core Principles

- Understand before coding.
- Plan before implementation.
- Follow approved project requirements and architectural decisions.
- Inspect existing code before modifying it.
- Prefer clean, reusable, readable, and maintainable solutions.
- Follow modular architecture and separation of concerns.
- Fix root causes instead of introducing temporary workarounds.
- Avoid unnecessary complexity, abstractions, dependencies, and utilities.
- Reuse existing shared utilities and infrastructure.
- Never duplicate existing business logic.
- Never work outside the assigned scope.
- Preserve existing functionality unless changes are explicitly required.

## 2. Project Context Awareness

Before starting any development task:

- Read relevant project context and requirement files.
- Understand the project's goals, requirements, and architecture.
- Review applicable coding standards and development workflows.
- Check the progress tracker to understand current development status.
- Inspect related existing modules, components, services, and utilities.
- Identify existing implementation patterns before introducing new ones.
- Understand relevant database relationships and API dependencies.
- Review existing tests when available.

### Project Context Priority

Follow the following project documentation hierarchy when applicable:

1. `project-overview.md` — Project goals, requirements, and business context.
2. `project-architecture.md` — Approved architecture and module responsibilities.
3. `code-standards.md` — Coding conventions and implementation standards.
4. `ai-workflow-rules.md` — AI development workflow and execution rules.
5. `progress-tracker.md` — Development progress and task status.

Additional project-specific documentation must also be considered when relevant.

- Follow explicit user instructions unless they conflict with higher-priority system or safety requirements.
- Follow approved project-specific decisions.
- Never silently override existing architectural or business decisions.
- If documentation conflicts, identify the conflict and ask for clarification when necessary.
- Never assume that requirements from another project apply to the current project.

## 3. Requirement Analysis

Before implementation:

- Understand the expected behavior and acceptance criteria.
- Identify affected modules, components, APIs, services, models, and dependencies.
- Determine how the requested changes interact with existing functionality.
- Consider security, performance, scalability, and data consistency.
- Identify success cases, failure cases, and relevant edge cases.
- Never invent missing business logic.
- Never make assumptions about unclear requirements that could affect business behavior.
- Ask for clarification when requirements are ambiguous.
- Record unresolved questions in the appropriate documentation when necessary.

## 4. Development Planning

Before coding, provide a short implementation plan containing:

- Task objective.
- Expected behavior and acceptance criteria.
- Files to create or modify.
- Affected modules and dependencies.
- Implementation steps.
- Potential risks and technical considerations.
- Testing and verification strategy.

### Approval Requirements

- Obtain approval before significant architectural changes.
- Obtain approval before changing established business logic.
- Obtain approval before introducing major dependencies or infrastructure changes.
- Obtain approval before expanding the assigned scope.
- Small, isolated, and clearly requested changes can proceed without unnecessary approval.

## 5. Task Scoping

- Work on one logical feature at a time.
- Break large tasks into smaller, testable units.
- Avoid combining unrelated features.
- Split tasks when they involve independent modules or complex changes.
- Complete the assigned task before moving to another.
- Never expand the scope without permission.
- Do not automatically start the next feature after completing the current task.
- Wait for the user's next instruction.

## 6. Code and Architecture Rules

- Follow the approved architecture and folder structure.
- Maintain clear module responsibilities.
- Follow modular architecture and separation of concerns.
- Keep functions, classes, and modules focused on a single responsibility.
- Reuse existing utilities, services, and components.
- Avoid duplicate code and unnecessary dependencies.
- Avoid unnecessary abstractions and premature optimization.
- Never rewrite working code unnecessarily.
- Do not delete or modify unrelated functionality.
- Preserve existing behavior unless changes are required.
- Follow existing naming conventions and coding patterns.
- Write readable, consistent, and maintainable code.
- Use appropriate types and avoid unsafe type assertions when possible.
- Keep implementation simple without sacrificing correctness.

## 7. Root Cause Analysis

When debugging or fixing existing functionality:

- Identify the actual root cause before implementing a fix.
- Understand why the issue occurs.
- Inspect related code and dependencies.
- Avoid fixing symptoms while leaving the underlying problem unresolved.
- Do not hide errors using unnecessary try-catch blocks.
- Avoid temporary workarounds unless explicitly approved.
- Consider potential side effects before modifying shared utilities or services.
- Verify that the fix does not introduce regressions.
- Explain important root causes when reporting bug fixes.

## 8. Database Integrity and Transaction Safety

- Follow the approved database architecture and schema design.
- Maintain existing database relationships and constraints.
- Use transactions when multiple database operations must succeed or fail together.
- Prevent inconsistent or partially updated database states.
- Handle transaction commit, rollback, and session cleanup correctly.
- Consider concurrent updates and race conditions.
- Validate resource ownership and relationships.
- Never trust sensitive database identifiers or ownership values supplied by clients.
- Use appropriate indexes for frequently queried fields.
- Avoid unnecessary database queries.
- Avoid retrieving unnecessary fields or documents.
- Preserve data integrity during create, update, and delete operations.
- Consider cascading effects before modifying or deleting related records.

## 9. API Design and Compatibility

- Follow existing API naming and response conventions.
- Maintain consistent success and error response structures.
- Use appropriate HTTP status codes.
- Validate request parameters, body, and query inputs.
- Validate and sanitize untrusted input where appropriate.
- Enforce authentication and authorization.
- Verify resource ownership before performing protected operations.
- Preserve API compatibility unless changes are approved.
- Avoid exposing internal database structures or implementation details.
- Use consistent error codes and meaningful error messages.
- Handle missing resources and invalid operations properly.
- Keep controllers, services, and other layers aligned with their established responsibilities.

## 10. Security and Error Handling

- Protect secrets, credentials, tokens, and sensitive user data.
- Never expose passwords, private keys, or confidential information.
- Validate all untrusted input.
- Enforce authentication and authorization.
- Verify resource ownership and access permissions.
- Never trust sensitive client-side values.
- Prevent unauthorized access and privilege escalation.
- Avoid leaking internal errors, stack traces, and database details to clients.
- Handle expected and unexpected errors appropriately.
- Use centralized error handling when available.
- Preserve existing security controls.
- Never weaken security to simplify implementation.
- Consider common security risks relevant to the assigned task.

## 11. Performance and Scalability

- Avoid unnecessary database queries and repeated computations.
- Prevent N+1 query problems.
- Use pagination for large collections.
- Optimize database queries and indexing where appropriate.
- Avoid loading unnecessary data.
- Use appropriate projections and population strategies.
- Avoid unnecessary API calls and redundant processing.
- Consider memory usage and response payload size.
- Avoid premature optimization.
- Consider scalability without introducing unnecessary complexity.

## 12. Dependency and Documentation Rules

- Check existing dependencies before adding new packages.
- Prefer existing project utilities and libraries.
- Verify package compatibility and official documentation when necessary.
- Avoid unnecessary dependency or configuration changes.
- Do not modify package internals or third-party source code unnecessarily.
- Follow documented project conventions.
- Keep technical documentation synchronized with actual implementation.
- Update relevant documentation when APIs, architecture, schemas, or workflows change.
- Never document functionality that has not actually been implemented.

## 13. Protected Components and Files

- Do not unnecessarily modify third-party or generated files.
- Avoid directly changing UI library components and package internals.
- Prefer application-level wrappers, extensions, and configurations.
- Do not modify environment files or deployment configurations without authorization.
- Avoid changing shared infrastructure unless required by the assigned task.
- Modify protected files only when necessary and authorized.
- Never overwrite unrelated user changes.

## 14. Git and Change Management

- Inspect the current Git status before making changes.
- Understand existing uncommitted changes.
- Never overwrite or discard unrelated user modifications.
- Avoid destructive Git commands unless explicitly authorized.
- Keep changes focused on the assigned task.
- Do not revert unrelated code.
- Use meaningful commit messages when requested.
- Never commit secrets, credentials, environment files, or sensitive information.
- Do not create commits or push changes unless explicitly requested.
- Review the final diff to identify accidental or unrelated modifications.

## 15. Testing and Verification

Test every implemented feature according to its scope.

### Required Verification

- Verify expected success scenarios.
- Verify failure scenarios.
- Test relevant edge cases.
- Check request validation.
- Check error handling.
- Check authentication and authorization.
- Verify database consistency and transaction behavior where applicable.
- Check for regressions in existing functionality.

### Available Quality Checks

Run relevant checks when available:

- Unit tests.
- Integration tests.
- API tests.
- Type checking.
- Linting.
- Build checks.
- Relevant automated security checks.

### Testing Integrity

- Never claim tests passed without actually running them.
- Never claim a build succeeded without verification.
- Report test failures instead of hiding them.
- Clearly distinguish between tested, partially tested, and untested functionality.
- Report unavailable test infrastructure or missing test coverage.
- Do not mark tasks Completed when required verification is pending.

## 16. Progress Tracking

Update `progress-tracker.md` after implementation and verification.

Use only the following task statuses:

- Not Started
- In Progress
- Blocked
- Completed
- Needs Review

### Progress Tracking Rules

- Mark a task In Progress when implementation begins.
- Mark a task Blocked when an external dependency or unresolved issue prevents progress.
- Mark a task Needs Review when implementation is ready but requires review or approval.
- Mark a task Completed only after the required implementation and verification are finished.
- Record blockers and unresolved questions accurately.
- Keep progress information consistent with the actual implementation.
- Never mark incomplete or untested work as Completed.

## 17. Reporting and Stop Conditions

After completing a task, provide a concise but informative report containing:

### Implementation Summary

- What was implemented or fixed.
- Important behavior changes.
- Relevant technical decisions.

### File Changes

- Created files.
- Modified files.
- Deleted files, if applicable, with justification.

### Testing Results

- Tests executed.
- Type checking, linting, and build results.
- Failed or skipped checks.
- Remaining testing limitations.

### Documentation and Progress

- Documentation updated.
- Progress tracker updated.
- Current task status.

### Remaining Issues

- Known issues.
- Unresolved questions.
- Blockers.
- Areas requiring further review.

### Stop Conditions

Stop and ask for clarification when:

- Requirements are unclear or contradictory.
- Significant architectural changes are necessary.
- Business logic is missing or ambiguous.
- The task requires changes outside the approved scope.
- Required permissions or dependencies are unavailable.
- A security or data integrity concern cannot be resolved safely.

Do not automatically start the next feature. Wait for the user's next instruction.

## 18. Final Quality Checklist

Before reporting a task as complete, verify the following:

- Relevant project context files reviewed.
- Project requirements understood.
- Existing code and dependencies inspected.
- Acceptance criteria identified.
- Implementation plan followed.
- Assigned scope respected.
- Architecture and coding standards followed.
- Existing functionality preserved.
- Security and authorization considered.
- Database integrity considered.
- Error handling implemented appropriately.
- Relevant tests executed.
- Type checking, linting, and build checks performed where available.
- Regressions checked.
- Final code changes reviewed.
- Documentation updated where necessary.
- Progress tracker updated.
- Remaining issues and blockers documented.
- Final implementation report provided.

## 19. Project-Specific Overrides

These are universal AI development rules.

Each project may define additional instructions for:

- Technology stack.
- Architecture and folder structure.
- Coding conventions.
- Protected files and components.
- Business logic and domain requirements.
- Database design and relationships.
- API design and response conventions.
- Authentication and authorization.
- Security requirements.
- Performance and scalability.
- UI and design requirements.
- Testing standards.
- Deployment and infrastructure.

Always follow relevant project-specific context files alongside these universal rules.

Project-specific instructions may extend or refine these rules but must not silently contradict higher-priority requirements or approved project decisions.

Never assume that requirements, architecture, or decisions from another project apply to the current project.

---

**End of AI Workflow Rules**
