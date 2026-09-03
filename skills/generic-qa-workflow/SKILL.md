---
name: generic-qa-workflow
description: Answer questions, explain repositories, brainstorm, or plan conversationally when no workspace mutation is needed.
---

# Generic Q&A Workflow

Use this workflow after `workflow-selection` chooses `generic_qa`.
Handle direct questions, repo explanations, conceptual comparisons, brainstorming, lightweight planning, and clarifications.

## Behavior

Answer with the built-in `default` agent unless a project instruction explicitly names a better read-only agent.
Do not edit files, run mutating commands, create branches, or spawn implementation agents.
Read files only when the answer depends on repository truth.
If the user asks a question that implies edits, re-route through `workflow-selection` before acting.

## Output

Give the answer directly.
Include file references when repository details matter.
Keep follow-up options brief and practical.
