---
name: workflow-selection
description: Select an SDLC workflow for a Codex request after intent classification, including permissions, agent routing, and worktree handling.
---

# Workflow Selection

Use this skill after `intent-classifier` when a Codex request needs to be routed to the right SDLC workflow before action.
This skill chooses how Codex should respond, what permission posture is appropriate, whether to use project custom agents, and whether worktree isolation is needed.

## Input

Use the latest user request, the `intent-classifier` result, and any available project context.
If the intent classification is missing, run intent recognition first before selecting a workflow.
Do not edit files, run mutating commands, or spawn agents merely to select a workflow.

## Output

Start each routed response with a concise routing block unless the user explicitly asks only for the final answer:

- `Workflow:` one of `generic_qa`, `research`,`discovery_intake`, `requirements_planning`, `design_architecture`, `coding_implementation`, `code_review`, `qa_verification`, `release_operations`, `incident_debug`, or `safety_sensitive`.
- `Permission posture:` `read-only`, `workspace-write with approval`, or `external-action approval required`.
- `Agent route:` a project custom agent name when one is clearly available and suitable; otherwise `default`, `worker`, or `explorer`.
- `Workflow skill:` the workflow skill to use next.
- `Worktree route:` `none`, `native subagent only`, or `wrapper-created branch/worktree`.
- `Next handling:` `answer`, `ask a clarifying question`, `spawn agents`, `run QA`, or `prepare an implementation plan`.
- `Confidence:` high, medium, or low.

Keep the routing block short.
After routing, continue with the chosen workflow unless the selected workflow requires clarification or approval first.

## Workflows

`generic_qa` handles direct answers, repository questions, brainstorming, and ordinary planning when no environment mutation is needed.
Use read-only posture and do not edit workspace files.
Use the built-in `default` agent.
Use `generic-qa-workflow` next.

`research` Answer queries not related to this workspace required to research from internet, cross-reference between credible source. Use `research-workflow`.

`discovery_intake` handles requests where Codex must inspect a repo, logs, current state, or requirements before deciding what work is needed.
Use read-only posture unless the user explicitly asks for generated artifacts.
Prefer `explorer` or a project-specific exploration agent.
Use `discovery-intake-workflow` next.

`requirements_planning` handles requests for decision-complete plans, specs, scope, acceptance criteria, task breakdowns, or implementation planning.
Use read-only posture and do not edit files unless the user asks for a saved artifact.
Use `default` or a project-specific planning agent.
Use `requirements-planning-workflow` next.

`design_architecture` handles architecture, API design, schema design, UI design, technical tradeoffs, and implementation strategy.
Use read-only posture by default.
Use `default`, `explorer`, or a project-specific architecture agent.
Use `design-architecture-workflow` next.

`coding_implementation` handles feature work, bug fixes, refactors, tests requested as code changes, migrations, project-agent edits, project-skill edits, and other workspace edits.
For any edit or coding request, do not make the edits in the current checkout.
Use project-level implementation agents first when suitable.
Fallback to `worker`.
Use `coding-implementation-workflow` next.

`code_review` handles review requests for branches, diffs, PRs, commits, or uncommitted changes.
Use read-only posture.
Prioritize bugs, regressions, security, correctness, and missing tests.
Use a project-specific reviewer if available; otherwise use `default` or the built-in review workflow.
Use `code-review-workflow` next.

`qa_verification` handles finished-work verification, test runs, acceptance checks, UI inspection, release readiness checks, and regression sweeps.
Use read-only posture unless the user explicitly asks QA to fix failures.
Report failures and recommended fixes instead of making feature edits.
Use project QA agents when available; otherwise use `explorer` for inspection and `default` for synthesis.
Use `qa-verification-workflow` next.

`release_operations` handles deployment, release, publishing, package versioning, CI/CD, infrastructure, migrations, rollbacks, and other operational changes.
Use external-action approval required when the task can affect remote systems, users, money, data, or production.
Use project release or operations agents when available; otherwise use `default`.
Use `release-operations-workflow` next.

`incident_debug` handles production issues, broken builds, regressions, flaky tests, errors, failing workflows, and root-cause investigations.
First reproduce or inspect in the closest realistic environment.
Use read-only posture for triage.
Route to `coding_implementation` only after a fix is clearly requested or approved.
Use `incident-debug-workflow` next.

`safety_sensitive` handles requests involving credentials, secrets, security, privacy, legal, medical, financial, regulated data, account access, destructive actions, or potentially harmful behavior.
Use the safest applicable posture.
Ask for explicit approval before mutation or external action.
Prefer specialized project agents only when they are clearly scoped to the sensitive domain.
Use `safety-sensitive-workflow` next.

## Agent Routing

Prefer project custom agents in `.codex/agents/` when their descriptions match the selected workflow.
Prefer personal custom agents in `~/.codex/agents/` when no project agent fits.
Fallback to built-in agents in this order:

- `worker` for implementation and fixes.
- `explorer` for read-heavy discovery, QA inspection, and codebase mapping.
- `default` for answers, planning, synthesis, and ambiguous requests.

Do not spawn subagents for simple single-threaded work.
Spawn subagents when independent exploration, review, QA, or implementation slices would materially improve quality or speed.

## Kcode Demo Sandbox Defaults

When working in the `PJ-Kcode_DemoSandbox` project, prefer these project agents:

- `generic_qa`: built-in `default`.
- `discovery_intake`: `kcode_discovery`.
- `requirements_planning`: `kcode_planner`.
- `design_architecture`: `kcode_architect`.
- `coding_implementation`: `kcode_implementer`.
- `code_review`: `kcode_reviewer`.
- `qa_verification`: `kcode_qa`.
- `release_operations`: `kcode_release`.
- `incident_debug`: `kcode_incident`.
- `safety_sensitive`: safest suitable agent, usually read-only first.

## Permission And Worktree Rules

For `generic_qa`, `requirements_planning`, `design_architecture`, `code_review`, and default `qa_verification`, do not edit the workspace.
For `coding_implementation`, use workspace-write with approval unless the active session is already more restrictive.
For `release_operations` and `safety_sensitive`, require explicit approval before external mutation.

Use `wrapper-created branch/worktree` for every edit or coding request.
Use `native subagent only` for read-heavy parallel work where separate worktrees are unnecessary.
Use `none` for simple answers, planning, review, or single-agent work.
