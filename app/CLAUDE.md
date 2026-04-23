# CLAUDE.md

## Project context

This project is an existing e-commerce website with a frontend already implemented.

The current priority is to add a backend and an admin area for site managers so they can manage articles/products through full CRUD operations.

The frontend already exists and is the visual reference. Any backend-connected UI or admin interface must stay consistent with the existing frontend design language, user experience, naming, and component logic.

## Main objective

Build the backend and the administrator interface needed to manage site articles/products.

The admin must allow authorized users to:
- create articles
- read/list articles
- view article details
- edit articles
- delete articles

## Non-negotiable rule

Do not redesign the project from scratch.

Do not introduce a generic admin UI disconnected from the current frontend.

Always inspect the existing frontend first and align new work with:
- visual hierarchy
- spacing
- typography
- colors
- component patterns
- naming conventions
- folder structure
- UX patterns already present in the codebase

## Working approach

Before coding:
1. Inspect the repository structure.
2. Identify the current frontend stack, styling system, UI components, routing, and naming conventions.
3. Reuse existing patterns whenever possible.
4. If a critical technical detail is missing, ask before making large architectural decisions.

When implementing:
1. Prefer consistency over novelty.
2. Keep changes incremental and easy to review.
3. Avoid breaking existing frontend behavior.
4. Separate clearly backend logic, data access, validation, auth, and UI concerns.

## Expected feature scope

Implement the backend and admin features required for article/product management.

Each article/product should support at least:
- title
- description
- price
- image
- category
- stock
- publication status
- created_at
- updated_at

If the existing schema uses different naming, follow the existing project conventions instead of forcing new names.

## Admin area requirements

The admin area is intended for the site manager/administrator only.

It must include:
- article list page
- create article form
- article detail view if relevant to the current architecture
- edit article form
- delete action with confirmation
- validation feedback
- error handling
- empty states when needed

The admin interface must feel like part of the same product, not like an external dashboard template.

## Backend requirements

Backend code must be:
- clean
- modular
- maintainable
- secure
- easy to extend

Always include when relevant:
- routes/endpoints
- controllers or handlers
- services/business logic
- models/entities
- input validation
- authentication/authorization checks
- error handling
- database integration aligned with the project stack

## Security rules

Admin pages and admin API actions must be protected.

Never assume public access is acceptable for CRUD operations.

Always verify authentication and authorization for create, update, and delete actions.

Do not expose sensitive data unnecessarily.

Never hardcode secrets.

## Code quality rules

Prefer readable and maintainable code over clever code.

Follow the existing code style and architecture already present in the repository.

When possible:
- reuse existing components
- reuse existing utilities
- reuse existing layout patterns
- reuse existing API conventions

Avoid:
- large monolithic files
- duplicate logic
- dead code
- unnecessary dependencies
- speculative refactors outside the requested scope

## Frontend consistency rules

For any new admin page or connected UI:
- inspect existing components before creating new ones
- reuse tokens, classes, helpers, or shared styles if they already exist
- keep labels and wording consistent with the rest of the app
- preserve responsive behavior consistent with the current frontend
- maintain accessibility and clear interaction states

If there is an existing design system or UI library in the repo, use it.

## Output expectations

When asked to implement a feature:
1. Briefly explain what you found in the existing codebase.
2. State the implementation plan.
3. Make the changes.
4. Summarize modified files and key decisions.
5. Mention any assumptions made.

## What to avoid

Do not:
- invent a new product structure without checking the repository
- replace existing patterns with your preferred stack style
- create a visually unrelated admin dashboard
- change unrelated parts of the app
- remove existing code unless necessary
- claim something works without checking the relevant files

## If the stack is unclear

If backend architecture, database choice, auth method, or admin entry point are unclear, inspect the codebase first.

If still unclear after inspection, ask focused questions before proceeding with major implementation.