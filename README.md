# Kcode Robot Suite

Kcode Robot Suite is a Next.js demo platform for composing independent robot-focused experiences into one application.
It uses a domain-agnostic microkernel so feature teams can add plugins without coupling their domain code to the platform kernel.

## Included demos

The launcher exposes four authenticated plugin demos.

| Demo | What it shows |
| --- | --- |
| Operational Dashboard | Fleet health, device telemetry, utilization, and operational alerts. |
| Kcode Engage | A robot game library, deployment controls, robot configuration, and engagement analytics. |
| Talk To Me | Mock video meetings with configurable AI notes, summaries, and action items. |
| Where My Bot | Hotel delivery route planning and real-time service robot operations. |

## How it fits together

`apps/web` is the Next.js host and composition root.
It imports the concrete plugins listed in [`config/plugins.ts`](config/plugins.ts) and registers them with the kernel.

`packages/kernel` provides plugin registration, lifecycle management, permissions, events, and configuration.
`packages/plugin-sdk` defines the stable plugin contract.
`packages/design-system`, `packages/services`, and `packages/shared` provide reusable visual, service, and utility code.
Each directory under `plugins/` contains the domain behavior and UI for one demo.

The kernel never imports concrete plugins.
Plugins use the SDK and shared packages so the host can compose them without introducing domain-specific dependencies into the kernel.

For more detail, read the [architecture overview](docs/architecture/overview.md) and the [plugin guide](docs/development/adding-a-plugin.md).

## Prerequisites

- Node.js 22.
- pnpm 10.12.1, which is pinned in [`package.json`](package.json).

## Run locally

Install dependencies and start the Next.js development server.

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Next.js, then sign in from the login page.
Use `admin` for both the username and password only for local development.
These credentials are a development-only demo account and must not be used for production access.

## Verify changes

Run the standard repository checks before opening a pull request.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

`pnpm build` produces the production Next.js build.

## Contributing and releases

Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup, verification, commit, and pull request guidance.
Read [RELEASING.md](RELEASING.md) for the release-please workflow.
