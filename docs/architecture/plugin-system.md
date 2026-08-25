# Plugin system

`KcodePlugin` is the boundary between a demo and the platform. It provides metadata, optional routes, permissions, settings, lifecycle hooks, and an entry component.

The `PluginRegistry` rejects duplicate IDs and exposes read-only collections. The lifecycle manager accepts only deterministic transitions. Plugins receive only a `PluginContext`: logging, events, navigation, notifications, authentication, and namespaced configuration.

Concrete plugins are registered in `config/plugins.ts`; the kernel never imports them.
