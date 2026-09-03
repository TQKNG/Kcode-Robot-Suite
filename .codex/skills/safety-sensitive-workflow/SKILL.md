---
name: safety-sensitive-workflow
description: Route sensitive requests involving secrets, privacy, security, destructive actions, regulated domains, or harmful behavior with extra caution.
---

# Safety Sensitive Workflow

Use this workflow after `workflow-selection` chooses `safety_sensitive`.
Use it for credentials, secrets, account access, privacy, security, destructive actions, legal, medical, financial, regulated data, or potentially harmful requests.

## Behavior

Use the safest applicable posture and minimize data exposure.
Ask for explicit approval before mutations, external actions, destructive commands, credential handling, or production changes.
Prefer read-only inspection first.
Use specialized project agents only when their scope clearly matches the sensitive domain.

## Output

State the sensitive concern, safe handling path, required approvals, and any safer alternative.
Do not reveal secrets or provide instructions that increase harm.
