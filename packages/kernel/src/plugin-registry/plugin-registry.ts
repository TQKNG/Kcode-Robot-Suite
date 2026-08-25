import type {
  KcodePlugin,
  PluginNavigation,
  PluginPermission,
  PluginRoute,
  PluginSetting,
  PluginSettingValue,
} from "@kcode/plugin-sdk";
import { immutableCopy, isNonEmptyString } from "@kcode/shared";

const PLUGIN_ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
// Permission and setting namespaces may use camelCase segments (for example
// `robot.defaultSpeed`) while plugin package IDs remain strict kebab-case.
const DOTTED_ID = /^[A-Za-z][A-Za-z0-9]*(?:[.-][A-Za-z0-9]+)*$/;
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const PLUGIN_STATUSES = new Set(["available", "development", "coming-soon"]);

export class PluginRegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PluginRegistryError";
  }
}

export class PluginRegistry {
  private readonly plugins = new Map<string, KcodePlugin>();

  register(candidate: KcodePlugin): void {
    this.validate(candidate);
    if (this.plugins.has(candidate.id)) {
      throw new PluginRegistryError(`Plugin "${candidate.id}" is already registered.`);
    }
    this.assertNoCrossPluginCollisions(candidate);
    this.plugins.set(candidate.id, snapshotPlugin(candidate));
  }

  unregister(pluginId: string): void {
    if (!this.plugins.delete(pluginId)) {
      throw new PluginRegistryError(`Plugin "${pluginId}" is not registered.`);
    }
  }

  get(pluginId: string): KcodePlugin | undefined { return this.plugins.get(pluginId); }
  getAll(): readonly KcodePlugin[] { return immutableCopy([...this.plugins.values()]); }
  getRoutes(): readonly PluginRoute[] { return immutableCopy([...this.plugins.values()].flatMap((plugin) => plugin.routes ?? [])); }
  getNavigation(): readonly PluginNavigation[] {
    return immutableCopy(
      [...this.plugins.values()]
        .flatMap((plugin) => plugin.navigation ?? [])
        .sort((left, right) => (left.order ?? 0) - (right.order ?? 0) || left.id.localeCompare(right.id)),
    );
  }
  getPermissions(): readonly PluginPermission[] { return immutableCopy([...this.plugins.values()].flatMap((plugin) => plugin.permissions ?? [])); }

  private validate(plugin: KcodePlugin): void {
    if (!isNonEmptyString(plugin.id) || !PLUGIN_ID.test(plugin.id)) {
      throw new PluginRegistryError("A plugin id must be lowercase kebab-case.");
    }
    if (!isNonEmptyString(plugin.name)) throw new PluginRegistryError(`Plugin "${plugin.id}" requires a name.`);
    this.assertVersion(plugin.id, "version", plugin.version);
    this.assertVersion(plugin.id, "sdkVersion", plugin.sdkVersion);

    const metadata = plugin.metadata;
    if (!metadata || metadata.id !== plugin.id || metadata.name !== plugin.name || metadata.version !== plugin.version) {
      throw new PluginRegistryError(`Plugin "${plugin.id}" metadata must match its id, name, and version.`);
    }
    if (!isNonEmptyString(metadata.description) || !isNonEmptyString(metadata.category)) {
      throw new PluginRegistryError(`Plugin "${plugin.id}" metadata requires a description and category.`);
    }
    if (!PLUGIN_STATUSES.has(metadata.status)) {
      throw new PluginRegistryError(`Plugin "${plugin.id}" has invalid status "${String(metadata.status)}".`);
    }
    if (!Array.isArray(metadata.technologies) || metadata.technologies.length === 0) {
      throw new PluginRegistryError(`Plugin "${plugin.id}" metadata requires at least one technology.`);
    }
    this.assertUniqueStrings(plugin.id, "technology", metadata.technologies);
    if (metadata.icon !== undefined && !isNonEmptyString(metadata.icon)) {
      throw new PluginRegistryError(`Plugin "${plugin.id}" metadata icon must be a non-empty string.`);
    }

    this.validateRoutes(plugin);
    this.validateNavigation(plugin);
    this.validatePermissions(plugin);
    this.validateSettings(plugin);
    this.validateCommands(plugin);
  }

  private validateRoutes(plugin: KcodePlugin): void {
    const routes = plugin.routes ?? [];
    this.assertUniqueStrings(plugin.id, "route", routes.map((route) => route.path));
    for (const route of routes) {
      if (!route.path.startsWith("/") || route.path.startsWith("//") || !isNonEmptyString(route.title)) {
        throw new PluginRegistryError(`Plugin "${plugin.id}" has an invalid route "${route.path}".`);
      }
      this.assertOptionalString(plugin.id, "route description", route.description);
      this.assertIdentifiers(plugin.id, "route permission", route.requiredPermissions ?? []);
    }
  }

  private validateNavigation(plugin: KcodePlugin): void {
    const navigation = plugin.navigation ?? [];
    this.assertUniqueStrings(plugin.id, "navigation", navigation.map((item) => item.id));
    for (const item of navigation) {
      if (!DOTTED_ID.test(item.id) || !isNonEmptyString(item.label) || !isNonEmptyString(item.href)) {
        throw new PluginRegistryError(`Plugin "${plugin.id}" has invalid navigation item "${item.id}".`);
      }
      if (item.order !== undefined && !Number.isFinite(item.order)) {
        throw new PluginRegistryError(`Plugin "${plugin.id}" navigation order for "${item.id}" must be finite.`);
      }
    }
  }

  private validatePermissions(plugin: KcodePlugin): void {
    const permissions = plugin.permissions ?? [];
    this.assertUniqueStrings(plugin.id, "permission", permissions.map((permission) => permission.id));
    for (const permission of permissions) {
      if (!DOTTED_ID.test(permission.id) || !isNonEmptyString(permission.name) || !isNonEmptyString(permission.description)) {
        throw new PluginRegistryError(`Plugin "${plugin.id}" has invalid permission "${permission.id}".`);
      }
    }
  }

  private validateSettings(plugin: KcodePlugin): void {
    const settings = plugin.settings ?? [];
    this.assertUniqueStrings(plugin.id, "setting", settings.map((setting) => setting.key));
    for (const setting of settings) {
      if (!DOTTED_ID.test(setting.key) || !isNonEmptyString(setting.label)) {
        throw new PluginRegistryError(`Plugin "${plugin.id}" has invalid setting "${setting.key}".`);
      }
      validateSettingValue(plugin.id, setting, setting.defaultValue);
    }
  }

  private validateCommands(plugin: KcodePlugin): void {
    const commands = plugin.commands ?? [];
    this.assertUniqueStrings(plugin.id, "command", commands.map((command) => command.id));
    for (const command of commands) {
      if (!DOTTED_ID.test(command.id) || !isNonEmptyString(command.title) || typeof command.execute !== "function") {
        throw new PluginRegistryError(`Plugin "${plugin.id}" has invalid command "${command.id}".`);
      }
      this.assertIdentifiers(plugin.id, "command permission", command.requiredPermissions ?? []);
    }
  }

  private assertNoCrossPluginCollisions(plugin: KcodePlugin): void {
    const collisionSets = [
      ["route", plugin.routes?.map((item) => item.path) ?? [], (registered: KcodePlugin) => registered.routes?.map((item) => item.path) ?? []],
      ["navigation", plugin.navigation?.map((item) => item.id) ?? [], (registered: KcodePlugin) => registered.navigation?.map((item) => item.id) ?? []],
      ["permission", plugin.permissions?.map((item) => item.id) ?? [], (registered: KcodePlugin) => registered.permissions?.map((item) => item.id) ?? []],
    ] as const;
    for (const [kind, incoming, selectExisting] of collisionSets) {
      for (const registered of this.plugins.values()) {
        const existing = new Set(selectExisting(registered));
        const collision = incoming.find((value) => existing.has(value));
        if (collision) {
          throw new PluginRegistryError(`Plugin "${plugin.id}" ${kind} "${collision}" conflicts with plugin "${registered.id}".`);
        }
      }
    }
  }

  private assertVersion(pluginId: string, field: string, value: string): void {
    if (!isNonEmptyString(value) || !SEMVER.test(value)) {
      throw new PluginRegistryError(`Plugin "${pluginId}" ${field} must be a semantic version.`);
    }
  }

  private assertIdentifiers(pluginId: string, kind: string, values: readonly string[]): void {
    this.assertUniqueStrings(pluginId, kind, values);
    if (values.some((value) => !DOTTED_ID.test(value))) {
      throw new PluginRegistryError(`Plugin "${pluginId}" has an invalid ${kind} identifier.`);
    }
  }

  private assertUniqueStrings(pluginId: string, kind: string, values: readonly string[]): void {
    const seen = new Set<string>();
    for (const value of values) {
      if (!isNonEmptyString(value) || seen.has(value)) {
        throw new PluginRegistryError(`Plugin "${pluginId}" has an invalid or duplicate ${kind} identifier.`);
      }
      seen.add(value);
    }
  }

  private assertOptionalString(pluginId: string, field: string, value: string | undefined): void {
    if (value !== undefined && !isNonEmptyString(value)) {
      throw new PluginRegistryError(`Plugin "${pluginId}" ${field} must be a non-empty string.`);
    }
  }
}

function validateSettingValue(pluginId: string, setting: PluginSetting, value: PluginSettingValue): void {
  const validType = setting.type === "number" ? typeof value === "number" && Number.isFinite(value)
    : setting.type === "boolean" ? typeof value === "boolean"
    : setting.type === "multiselect" ? Array.isArray(value) && value.every(isNonEmptyString)
    : typeof value === "string";
  if (!validType) throw new PluginRegistryError(`Plugin "${pluginId}" setting "${setting.key}" has an invalid default value.`);
  if (setting.type === "select" || setting.type === "multiselect") {
    if (setting.options.length === 0) throw new PluginRegistryError(`Plugin "${pluginId}" setting "${setting.key}" requires options.`);
    const optionValues = setting.options.map((option) => option.value);
    if (new Set(optionValues).size !== optionValues.length || setting.options.some((option) => !isNonEmptyString(option.label) || !isNonEmptyString(option.value))) {
      throw new PluginRegistryError(`Plugin "${pluginId}" setting "${setting.key}" has invalid or duplicate options.`);
    }
    const selected = Array.isArray(value) ? value : [value];
    if (selected.some((item) => !optionValues.includes(item))) {
      throw new PluginRegistryError(`Plugin "${pluginId}" setting "${setting.key}" default is not a declared option.`);
    }
  }
}

function snapshotPlugin(plugin: KcodePlugin): KcodePlugin {
  const freezeItems = <T extends object>(items: readonly T[] | undefined): readonly T[] | undefined =>
    items === undefined ? undefined : Object.freeze(items.map((item) => Object.freeze({ ...item })));
  const settings = plugin.settings?.map((setting) => Object.freeze({
    ...setting,
    ...(setting.options ? { options: freezeItems(setting.options) } : {}),
    defaultValue: Array.isArray(setting.defaultValue) ? Object.freeze([...setting.defaultValue]) : setting.defaultValue,
  })) as readonly PluginSetting[] | undefined;
  const routes = plugin.routes && Object.freeze(plugin.routes.map((route) => Object.freeze({
    ...route,
    requiredPermissions: route.requiredPermissions && Object.freeze([...route.requiredPermissions]),
  })));
  const commands = plugin.commands && Object.freeze(plugin.commands.map((command) => Object.freeze({
    ...command,
    requiredPermissions: command.requiredPermissions && Object.freeze([...command.requiredPermissions]),
  })));
  return Object.freeze({
    ...plugin,
    metadata: Object.freeze({ ...plugin.metadata, technologies: Object.freeze([...plugin.metadata.technologies]) }),
    routes,
    navigation: freezeItems(plugin.navigation),
    permissions: freezeItems(plugin.permissions),
    settings: settings && Object.freeze(settings),
    commands,
  });
}
