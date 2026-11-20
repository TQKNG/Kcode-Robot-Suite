# Contributing

Thank you for helping improve Kcode Demo Sandbox.

## Before you start

Read [AGENTS.md](AGENTS.md) for the architecture, package boundaries and coding conventions.
The kernel must not import plugins, and plugins depend on the SDK, design system, shared utilities and services.

For larger changes, open an issue first so the approach can be agreed.

## Set up

You need Node 22 and pnpm 10.12.1.
The version of pnpm is pinned by the `packageManager` field in `package.json`.

```bash
pnpm install
pnpm dev
```

Development sign-in uses `admin` / `admin`, which is for local use only.

## Verify your change

Run these commands before you open a pull request.

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Run `pnpm build` as well when your change affects the web app or its build.
Add or update tests beside the code they cover.
Contract tests use the `*.contract.test.ts` name.

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/).
Start each message with a type, an optional scope and a short imperative summary, for example `feat(telepresence): add camera selection`.
Common types are `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci` and `chore`.
Mark a breaking change with `!` after the type or with a `BREAKING CHANGE:` footer.
Release notes and version numbers are generated from these messages, so keep them accurate.

## Pull requests

1. Create a branch from `master`.
2. Make the change, keeping it focused on one behavior.
3. Run the verification commands above.
4. Open a pull request against `master`. Describe the change, list the affected packages or plugins, link the issue with `Closes #<number>`, and mention the commands you ran.
5. Wait for the `verify` check to pass and address review comments.

The pull request template in `.github/` lists the details to include.

## Releases

Releases are prepared by release-please. See [RELEASING.md](RELEASING.md).
