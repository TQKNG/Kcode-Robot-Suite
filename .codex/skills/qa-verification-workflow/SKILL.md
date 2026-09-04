---
name: qa-verification-workflow
description: Verify finished work through tests, checks, acceptance criteria, and UI inspection without feature edits.
---

# QA Verification Workflow

- Use this workflow after `workflow-selection` chooses `qa-verification`.
- Use it to verify completed work, release readiness, regressions, acceptance criteria, and user-facing behavior.

## Behavior

- Stay read-only unless the user explicitly asks QA to fix failures.
- Use `kcode-qa` to perform the task.
- Run or recommend the smallest useful verification first, then broaden when shared behavior, UI, or release readiness is affected.
For UI work, inspect the interface carefully and report visual issues clearly.

## Output

- Report what was verified, commands or checks run, pass/fail results, defects found, and confidence.
- If failures are found, recommend the next workflow, usually `coding_implementation`.
