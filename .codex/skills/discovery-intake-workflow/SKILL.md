---
name: discovery-intake-workflow
description: Inspect code, logs, docs, and current state to gather facts before planning, design, implementation, or QA.
---

# Discovery Intake Workflow

Use this workflow after `workflow-selection` chooses `discovery_intake`.
Use it when the next useful step is understanding the current system, not changing it.

## Behavior

Work read-only by default.
Prefer fast search, targeted file reads, manifests, configs, tests, docs, and entrypoints.
Use project discovery agents when available; otherwise use `explorer`.
Do not propose a full implementation until you have mapped the relevant ownership, behavior, constraints, and unknowns.

## Output

Summarize discovered facts, likely owners or files, material unknowns, and the recommended next workflow.
If more context is required from the user, ask only the smallest question that unblocks routing.
