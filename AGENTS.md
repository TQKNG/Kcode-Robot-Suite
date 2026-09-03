# Repository Guidelines
This project is about a robot suite platform with different in-app features such as operational dashboard, robot engagement, telepresence and wheremybot

## Project Organization

### Architecture
Microkernel with plugins

### Tech stack
- Package manager: pnpm
- Repository type: monorepo
- Language: Typescript
- Package Manager: pnpm
- Node version: ˆ22
- Frontend Framework: Nextjs 15
- Testing: Vitest

`apps/web` is the composition root and registers plugins through `config/plugins.ts`.
Shared code lives in `packages`: `kernel`, `plugin-sdk`, `design-system`, `services`, and `shared`.
Domain features live in `plugins/*/src`.
Documentation lives in `docs`.

## Build, Test, and Development Commands

- Use pnpm.
Examples: `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm typecheck`, and `pnpm test`.

- `pnpm dev` runs the web app.
- `pnpm build` builds it, and `pnpm start` serves the build.
- Use `pnpm lint`, `pnpm typecheck`, and `pnpm test` for verification.

## Coding Style & Naming Conventions

- Code is strict TypeScript with ES module syntax.
- React routes and components use `.tsx`; services, contracts, and utilities use `.ts`.
- Prefer package boundaries over cross-directory shortcuts.
- The kernel must not import plugins or domain-specific concepts; plugins should depend on the SDK, design system, shared utilities, and services.
- Keep mock implementations behind service interfaces so real providers can replace them without changing plugin UI contracts.

## Testing Guidelines

- Vitest is the test runner.
Current tests use `*.contract.test.ts`, especially for kernel and service contracts.
- Add focused tests beside the code they validate.

## Agent Workflow

- Always start by using `$intent-classifier` to identify the user's primary intent, confidence, why, secondary intents, and next handling.
- Then use `$workflow-selection` to choose the SDLC workflow, permission posture, agent route, worktree route, next handling, and confidence.
- State the selected workflow briefly before taking action unless doing so would be noisy for a trivial answer.
- Do not edit workspace files in `generic_qa`, `requirements_planning`, `design_architecture`, `code_review`, or `qa_verification` unless the selected workflow explicitly allows edits.
- For `coding_implementation`, do not edit in the current checkout.
- For any edit or coding request, spawn an implementer agent in the background with `codex-sdlc` so the work happens in a separate git worktree and branch.
- Prefer project-level implementation agents when suitable.
If no suitable custom agent exists, fall back to Codex built-in `worker`.
- For `release_operations` and `safety_sensitive`, require explicit approval before external mutation.
- Default SDLC workflows are `generic_qa`, `discovery_intake`, `requirements_planning`, `design_architecture`, `coding_implementation`, `code_review`, `qa_verification`, `release_operations`, `incident_debug`, and `safety_sensitive`.
- Their matching workflow skills are `generic-qa-workflow`, `discovery-intake-workflow`, `requirements-planning-workflow`, `design-architecture-workflow`, `coding-implementation-workflow`, `code-review-workflow`, `qa-verification-workflow`, `release-operations-workflow`, `incident-debug-workflow`, and `safety-sensitive-workflow`.
- Before changing code, inspect the relevant app, package, plugin, and docs.
For bug fixes, reproduce the issue in the closest practical end-to-end flow before editing.
- Keep changes scoped to the requested behavior and preserve the kernel/plugin dependency boundary.
- After implementation, run narrow checks first, then broader checks when shared contracts or UI flows changed.
- Use `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` as the standard verification set when applicable.
- Report changed areas, verification results, and remaining risks.
Use `.codex/agents/*.toml` for project custom agents and `.agents/skills/*/SKILL.md` for reusable repo workflows.

## Version Control & Commit & Pull Request Guidelines
- Use worktree for isolated development work. Naming convention: wt-[project-name][short description]-[date]
- Each worktree link to a branch. Naming convention: feature/[short description], fix/[short description], update/[short description]
- Use concise, imperative commit messages such as `Add plugin registry tests` or `Fix demo auth redirect`.
- Pull requests should describe the change, list affected packages or plugins, link issues, include screenshots for UI changes, and mention verification commands run.

## Security & Configuration Tips

- Development demo sign-in uses `admin` / `admin` only for local use.
- Do not treat these credentials as production-ready.
- Keep provider-specific credentials out of source control and route new integrations through service interfaces.
