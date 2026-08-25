# Adding a plugin

1. Create `plugins/my-new-plugin` with a package manifest and a `KcodePlugin` export.
2. Add metadata, routes, permissions, settings, and an entry component through `@kcode/plugin-sdk`.
3. Add the plugin once to `config/plugins.ts`.
4. Run `pnpm build`.

No kernel, launcher, or existing-plugin change should be needed for a standard plugin.
