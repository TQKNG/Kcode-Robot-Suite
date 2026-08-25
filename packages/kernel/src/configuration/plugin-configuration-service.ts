import type { PluginConfigurationService, PluginSetting, PluginSettingValue } from "@kcode/plugin-sdk";
import { isNonEmptyString } from "@kcode/shared";

export class PluginConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PluginConfigurationError";
  }
}

/** In-memory storage with a separate namespace for each plugin. */
export class ConfigurationStore {
  private readonly namespaces = new Map<string, Map<string, PluginSettingValue>>();

  createPluginConfiguration(pluginId: string, settings: readonly PluginSetting[] = []): PluginConfigurationService {
    if (!isNonEmptyString(pluginId)) throw new PluginConfigurationError("A plugin id is required for configuration access.");
    const declaredSettings = this.createDeclarationMap(pluginId, settings);
    const values = this.namespaces.get(pluginId) ?? new Map<string, PluginSettingValue>();
    this.namespaces.set(pluginId, values);
    for (const setting of settings) {
      if (!values.has(setting.key)) values.set(setting.key, cloneValue(setting.defaultValue));
    }

    return Object.freeze({
      get: <TValue extends PluginSettingValue>(key: string): TValue | undefined => {
        this.requireDeclaration(pluginId, declaredSettings, key);
        const value = values.get(key);
        return value === undefined ? undefined : cloneValue(value) as TValue;
      },
      set: <TValue extends PluginSettingValue>(key: string, value: TValue): void => {
        const setting = this.requireDeclaration(pluginId, declaredSettings, key);
        this.assertValue(pluginId, setting, value);
        values.set(key, cloneValue(value));
      },
      getAll: (): Readonly<Record<string, PluginSettingValue>> => {
        const result: Record<string, PluginSettingValue> = {};
        for (const key of declaredSettings.keys()) {
          const value = values.get(key);
          if (value !== undefined) result[key] = cloneValue(value);
        }
        return Object.freeze(result);
      },
    });
  }

  deletePluginConfiguration(pluginId: string): boolean {
    return this.namespaces.delete(pluginId);
  }

  private createDeclarationMap(pluginId: string, settings: readonly PluginSetting[]): ReadonlyMap<string, PluginSetting> {
    const result = new Map<string, PluginSetting>();
    for (const setting of settings) {
      if (!isNonEmptyString(setting.key) || result.has(setting.key)) {
        throw new PluginConfigurationError(`Plugin "${pluginId}" has an invalid or duplicate setting key.`);
      }
      this.assertValue(pluginId, setting, setting.defaultValue);
      result.set(setting.key, setting);
    }
    return result;
  }

  private requireDeclaration(pluginId: string, settings: ReadonlyMap<string, PluginSetting>, key: string): PluginSetting {
    const setting = settings.get(key);
    if (!setting) throw new PluginConfigurationError(`Setting "${key}" is not declared by plugin "${pluginId}".`);
    return setting;
  }

  private assertValue(pluginId: string, setting: PluginSetting, value: PluginSettingValue): void {
    const valid = setting.type === "number" ? typeof value === "number" && Number.isFinite(value)
      : setting.type === "boolean" ? typeof value === "boolean"
      : setting.type === "multiselect" ? Array.isArray(value) && value.every(isNonEmptyString) && new Set(value).size === value.length
      : typeof value === "string";
    if (!valid || (setting.required === true && typeof value === "string" && !isNonEmptyString(value))) {
      throw new PluginConfigurationError(`Invalid value for setting "${pluginId}.${setting.key}".`);
    }
    if (setting.type === "select" || setting.type === "multiselect") {
      if (setting.options.length === 0) throw new PluginConfigurationError(`Setting "${pluginId}.${setting.key}" requires options.`);
      const allowedValues = new Set(setting.options.map((option) => option.value));
      if (allowedValues.size !== setting.options.length || setting.options.some((option) => !isNonEmptyString(option.label) || !isNonEmptyString(option.value))) {
        throw new PluginConfigurationError(`Setting "${pluginId}.${setting.key}" has invalid or duplicate options.`);
      }
      const selectedValues = Array.isArray(value) ? value : [value];
      if (selectedValues.some((selected) => !allowedValues.has(selected))) {
        throw new PluginConfigurationError(`Value for setting "${pluginId}.${setting.key}" is not a declared option.`);
      }
    }
  }
}

function cloneValue<TValue extends PluginSettingValue>(value: TValue): TValue {
  return (Array.isArray(value) ? Object.freeze([...value]) : value) as TValue;
}
