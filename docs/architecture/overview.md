# Architecture overview

The platform separates a domain-agnostic kernel from plugin implementations.

- `packages/plugin-sdk`: stable contracts a plugin consumes.
- `packages/kernel`: registry, lifecycle, permissions, events, and configuration.
- `packages/design-system`: shared visual primitives and patterns.
- `packages/services`: replaceable platform services such as demo authentication.
- `plugins/*`: self-contained domain behavior and UI.
- `apps/web`: the composition root and Next.js host.

The application imports concrete plugins only through `config/plugins.ts`. The kernel does not import a plugin package.
