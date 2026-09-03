---
name: requirements-planning-workflow
description: Produce decision-complete requirements, implementation plans, acceptance criteria, and task breakdowns without editing code.
---

# Requirements Planning Workflow

Use this workflow after `workflow-selection` chooses `requirements_planning`.
Use it for specs, implementation plans, acceptance criteria, scoping, sequencing, and tradeoff decisions.

## Behavior

Stay read-only unless the user explicitly asks for a saved artifact.
Inspect the repository when needed to make the plan fit the real codebase.
Prefer project planning agents when available; otherwise use `default`.
Ask targeted questions only for product intent or tradeoffs that cannot be discovered.

## Output

Return a decision-complete plan that another agent can implement without choosing architecture, interfaces, tests, or scope.
Include success criteria, key changes, test scenarios, assumptions, and out-of-scope items when they prevent mistakes.
