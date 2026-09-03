---
name: design-architecture-workflow
description: Design architecture, APIs, data flow, schemas, UI structure, and technical tradeoffs before implementation.
---

# Design Architecture Workflow

Use this workflow after `workflow-selection` chooses `design_architecture`.
Use it when the user needs a technical design or architecture decision before code changes.

## Behavior

Stay read-only by default.
Ground recommendations in the existing system, package boundaries, interfaces, and constraints.
Prefer project architecture agents when available; otherwise use `default` or `explorer`.
Do not implement the design unless the user explicitly routes to coding.

## Output

Describe the chosen architecture, alternatives considered, affected interfaces, data flow, risks, and validation approach.
Keep the design concrete enough for implementation.
