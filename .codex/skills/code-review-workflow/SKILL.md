---
name: code-review-workflow
description: Review diffs, branches, commits, pull requests, or uncommitted changes in read-only mode.
---

# Code Review Workflow

Use this workflow after `workflow-selection` chooses `code_review`.
Use it for PR-style reviews, branch reviews, commit reviews, and working-tree reviews.

## Behavior

Stay read-only.
Prefer project reviewer agents when available; otherwise use `default` or Codex's built-in review mode.
Prioritize correctness, regressions, security, behavior changes, missing tests, and operational risk.
Ignore style-only comments unless they hide a real bug or maintainability risk.

## Output

Lead with findings ordered by severity and include file or diff references.
If no issues are found, say so clearly and mention remaining test gaps or residual risk.
Keep summaries secondary to findings.
