---
name: research-workflow
description: Answer queries not related to this workspace required to research from internet, cross-reference between credible source.
---

# Research Workflow

Use this workflow after `workflow-selection` .
Spawn `kcode-researcher` agent to perform research task. Then, wait for `kcode-researcher` agent to finish its task, spawn `kcode-notion` agent to update notion db.Finally,summarize the result.

## Behavior

- Treat internet research as evidence-first: verify claims before summarizing.
- Prioritize primary, official, and recent sources when available.
- Use at least two credible sources for important claims unless a single official source is authoritative.
- Clearly separate confirmed facts, source interpretation, and recommendations.
- Highlight source conflicts, outdated information, or uncertainty instead of hiding them.
- Keep scope tightly aligned with the user’s query.
- Avoid using workspace files, local code, or project assumptions unless explicitly requested.


## Output

- Give the answer directly.
- Include reference of the sources
- Include research entry id from notion
