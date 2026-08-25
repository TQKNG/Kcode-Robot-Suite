import { PluginRegistry } from "@kcode/kernel";
import { plugins } from "../../../config/plugins";

const pluginRegistry = new PluginRegistry();
plugins.forEach((plugin) => pluginRegistry.register(plugin));

export function getPluginCatalog() {
  return pluginRegistry.getAll();
}

export function getPlugin(pluginId: string) {
  return pluginRegistry.get(pluginId);
}
