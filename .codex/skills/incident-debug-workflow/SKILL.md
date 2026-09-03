---
name: incident-debug-workflow
description: Reproduce failures, triage incidents, inspect logs, and identify root cause before routing to implementation.
---

# Incident Debug Workflow

Use this workflow after `workflow-selection` chooses `incident_debug`.
Use it for failing builds, production issues, regressions, flaky tests, broken workflows, runtime errors, and unclear failures.

## Behavior

Start read-only for triage.
Reproduce the issue in the closest practical environment before proposing fixes when feasible.
Prefer project incident agents when available; otherwise use `explorer`.
Route to `coding_implementation` only when the user asks for a fix or the root cause and fix scope are clear.

## Output

Report symptoms, reproduction steps, evidence, suspected root cause, confidence, immediate mitigation, and recommended next workflow.
Be explicit when the issue is not reproduced.
