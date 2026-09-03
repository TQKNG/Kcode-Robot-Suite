---
name: release-operations-workflow
description: Handle release, deployment, CI/CD, migrations, rollback planning, and operational readiness with explicit approval for external mutation.
---

# Release Operations Workflow

Use this workflow after `workflow-selection` chooses `release_operations`.
Use it for releases, deployments, CI/CD, package versioning, migrations, rollout checks, rollback planning, and operational readiness.

## Behavior

Treat external systems, production, user data, credentials, billing, and irreversible actions as approval-required.
Prefer project release or operations agents when available; otherwise use `default`.
Inspect local configuration and CI definitions before recommending operational steps.
Do not run external mutations unless the user explicitly approves that action.

## Output

State readiness, required approvals, commands or actions to run, rollback path, verification plan, and known risks.
Separate local checks from external operations.
