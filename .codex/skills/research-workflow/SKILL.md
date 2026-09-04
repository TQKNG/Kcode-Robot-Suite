---
name: research-workflow
description: Answer queries not related to this workspace required to research from internet, cross-reference between credible source.
---

# Research Workflow

Use this workflow after `workflow-selection` .
First, spawn kcode_notion custom agent to initiate the research entry in notion as new. Concurrently, spawn kcode_researcher agent to perform research task. Depend on the result of the kcode_researcher agent, instruct kcode_notion agent to update the status of the research entry accordingly.

## Behavior

Do not edit files, run mutating commands, create branches.
If the user asks a question that implies edits, re-route through `workflow-selection` before acting.

## Output

Give the answer directly.
Include reference of the sources
Include research entry id from notionß
