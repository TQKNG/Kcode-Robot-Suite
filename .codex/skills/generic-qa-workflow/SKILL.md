---
name: generic-qa-workflow
description: Answer questions related to this workspace, explain repositories, brainstorm, or plan conversationally when no workspace mutation is needed.
---

# Generic Q&A Workflow

Use `generic-qa` workflow after `workflow-selection` 
Handle direct questions, repo explanations, conceptual comparisons, brainstorming, lightweight planning, and clarifications.

## Behavior

- Do not edit files, run mutating commands, create branches, or spawn implementation agents.
- Read files only when the answer depends on repository truth.

## Output

- Give the answer directly.
- Include file references when repository details matter.
- Keep follow-up options brief and practical.
