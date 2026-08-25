# Dependency rules

`apps/web` composes packages and plugins. Plugins depend on the SDK, design system, shared utilities, and services. The kernel depends only on contracts and platform utilities. It does not import plugins or domain-specific terms.

Mock implementations remain behind service interfaces so a real provider can replace them without changing plugin UI contracts.
