---
name: coding-implementation-workflow
description: Implement features, fixes, tests, refactors, and migrations with appropriate agents, verification, and optional worktree isolation.
---

# Coding Implementation Workflow

Use this workflow after `workflow-selection` chooses `coding_implementation`.
Use it for code edits, tests as code changes, refactors, bug fixes, migrations, and feature implementation.

## Behavior

Do not edit in the current checkout.
For every edit or coding request, spawn an implementer agent in the background through `codex-sdlc`.
The implementer agent must work in its own branch and git worktree.
Prefer project implementation agents when available; otherwise use `worker`.
The current session should coordinate, monitor, review, and summarize the background implementer work.
Before spawning, pass enough context for the implementer to inspect relevant code, reproduce bugs when practical, keep changes scoped, and preserve project boundaries.

## Output

After the background implementation finishes, report changed areas, verification performed, failures, branch, worktree path, and remaining risks.
Do not claim tests passed unless they ran successfully.
