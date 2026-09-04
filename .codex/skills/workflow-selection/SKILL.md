---
name: workflow-selection
description: Select an appropriate workflow for a Codex request after intent classification, including permissions, agent routing, and worktree handling.
---

# Workflow Selection

Use this skill after `intent-classifier` when a Codex request needs to be routed to the right workflow before action.
This skill chooses how Codex should respond, what permission posture is appropriate, whether to use project custom agents, and whether worktree isolation is needed.

## Input

Use the latest user request, the `intent-classifier` result, and any available project context.
If the intent classification is missing, run intent recognition first before selecting a workflow.
Do not edit files, run mutating commands, or spawn agents merely to select a workflow.

## Output

Start each routed response with a concise routing block unless the user explicitly asks only for the final answer:

- `Workflow:` one of `generic-qa`, `research`,`discovery-intake`, `requirements-planning`, `design-architecture`, `coding-implementation`, `code-review`, `qa-verification`, `release-operations`, `incident-debug`, or `safety-sensitive`.
- `Permission posture:` `read-only`, `workspace-write with approval`, or `external-action approval required`.
- `Agent route:` a project custom agent name when one is clearly available and suitable; otherwise `default`, `worker`, or `explorer`.
- `Workflow skill:` the workflow skill to use next.
- `Worktree route:` `none`, `native subagent only`, or `wrapper-created branch/worktree`.
- `Next handling:` `answer`, `ask a clarifying question`, `spawn agents`, `run QA`, or `prepare an implementation plan`.
- `Confidence:` high, medium, or low.

Keep the routing block short.
After routing, continue with the chosen workflow unless the selected workflow requires clarification or approval first.

## Workflows

`generic-qa` handles direct answers, repository questions, brainstorming, and ordinary planning when no environment mutation is needed.
Use `generic-qa-workflow`.

`research` Answer queries not related to this workspace required to research from internet, cross-reference between credible source. Use `research-workflow`.

`discovery-intake` handles requests where Codex must inspect a repo, logs, current state, or requirements before deciding what work is needed.
Use `discovery-intake-workflow`.

`requirements-planning` handles requests for decision-complete plans, specs, scope, acceptance criteria, task breakdowns, or implementation planning.
Use `requirements-planning-workflow`.

`design-architecture` handles architecture, API design, schema design, UI design, technical tradeoffs, and implementation strategy.
Use `design-architecture-workflow`.

`coding-implementation` handles feature work, bug fixes, refactors, tests requested as code changes, migrations, project-agent edits, project-skill edits, and other workspace edits.
Use `coding-implementation-workflow`.

`code-review` handles review requests for branches, diffs, PRs, commits, or uncommitted changes.
Prioritize bugs, regressions, security, correctness, and missing tests.
Use `code-review-workflow`.

`qa-verification` handles finished-work verification, test runs, acceptance checks, UI inspection, release readiness checks, and regression sweeps.
Report failures and recommended fixes instead of making feature edits.
Use `qa-verification-workflow`.

`release-operations` handles deployment, release, publishing, package versioning, CI/CD, infrastructure, migrations, rollbacks, and other operational changes.
Use `release-operations-workflow`.

`incident-debug` handles production issues, broken builds, regressions, flaky tests, errors, failing workflows, and root-cause investigations.
First reproduce or inspect in the closest realistic environment.
Use `incident-debug-workflow`.

`safety-sensitive` handles requests involving credentials, secrets, security, privacy, legal, medical, financial, regulated data, account access, destructive actions, or potentially harmful behavior.
Use `safety-sensitive-workflow`.

## Agent Routing

- Prefer project custom agents in `.codex/agents/` when their descriptions match the selected workflow.
- Prefer personal custom agents in `~/.codex/agents/` when no project agent fits.
Fallback to built-in agents in this order:

- `worker` for implementation and fixes.
- `explorer` for read-heavy discovery, QA inspection, and codebase mapping.
- `default` for answers, planning, synthesis, and ambiguous requests.


## Kcode Demo Sandbox Defaults

When working in the `PJ-Kcode-DemoSandbox` project, prefer these project agents:

- `generic-qa`: built-in `default`.
- `research`: `kcode-researcher` and `kcode-notion`
- `discovery-intake`: `kcode-discovery`.
- `requirements-planning`: `kcode-planner`.
- `design-architecture`: `kcode-architect`.
- `coding-implementation`: `kcode-implementer`.
- `code-review`: `kcode-reviewer`.
- `qa-verification`: `kcode-qa`.
- `release-operations`: `kcode-release`.
- `incident-debug`: `kcode-incident`.
- `safety-sensitive`: safest suitable agent, usually read-only first.

## Permission And Worktree Rules

For `generic-qa`, `requirements-planning`, `design-architecture`, `code-review`, and default `qa-verification`, do not edit the workspace.
For `coding-implementation`, use workspace-write with approval unless the active session is already more restrictive.
For `release-operations` and `safety-sensitive`, require explicit approval before external mutation.

