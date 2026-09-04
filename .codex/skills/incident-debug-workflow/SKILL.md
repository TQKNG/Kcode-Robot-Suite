---
name: incident-debug-workflow
description: Reproduce failures, triage incidents, inspect logs, and identify root cause before routing to implementation.
---

# Incident Debug Workflow

- Use this workflow after `workflow-selection` chooses `incident-debug`.
- Use it for failing builds, production issues, regressions, flaky tests, broken workflows, runtime errors, and unclear failures.

## Behavior

- Start read-only for triage.
- Reproduce the issue in the closest practical environment before proposing fixes when feasible.
- Use `kcode-incident` agent to perform the task


## Output

- Report symptoms, reproduction steps, evidence, suspected root cause, confidence, immediate mitigation, and recommended next workflow.
- Be explicit when the issue is not reproduced.
