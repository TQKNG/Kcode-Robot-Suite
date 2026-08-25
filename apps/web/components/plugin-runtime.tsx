"use client";

import { plugins } from "../../../config/plugins";
import { usePlatformRuntime } from "./platform-provider";

export function PluginRuntime({ pluginId }: { pluginId: string }) {
  const { contextFor } = usePlatformRuntime();
  const plugin = plugins.find((candidate) => candidate.id === pluginId);
  const Entry = plugin?.entry;

  if (!plugin || !Entry) {
    return <section className="card empty-state"><p className="eyebrow">Plugin unavailable</p><h2>This demo does not expose a runnable entry.</h2><p>Return to the launcher and choose an available plugin.</p></section>;
  }

  return <Entry context={contextFor(pluginId)} />;
}
