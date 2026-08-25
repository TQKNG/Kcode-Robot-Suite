import type { KcodePlugin, PluginContext, PluginSetting } from "@kcode/plugin-sdk";
import { describe, expect, it, vi } from "vitest";
import { ConfigurationStore } from "./configuration/plugin-configuration-service";
import { InMemoryEventBus } from "./event-bus/event-bus";
import { PluginLifecycleManager } from "./lifecycle/plugin-lifecycle-manager";
import { PermissionDeniedError, PermissionService } from "./permissions/permission-service";
import { PluginRegistry, PluginRegistryError } from "./plugin-registry/plugin-registry";

function plugin(id = "sample-plugin"): KcodePlugin {
  const name = id === "sample-plugin" ? "Sample Plugin" : "Second Plugin";
  return {
    id,
    name,
    version: "1.0.0",
    sdkVersion: "1.0.0",
    metadata: {
      id,
      name,
      version: "1.0.0",
      description: "A contract-test plugin.",
      category: "testing",
      status: "available",
      technologies: ["TypeScript"],
    },
    routes: [{ path: `/${id}`, title: name }],
  };
}

describe("PluginRegistry", () => {
  it("validates registrations, rejects duplicates, and returns an immutable snapshot", () => {
    const registry = new PluginRegistry();
    const valid = plugin();
    registry.register(valid);

    expect(registry.get("sample-plugin")).toMatchObject({ id: "sample-plugin" });
    expect(registry.getAll()).toEqual([expect.objectContaining({ id: "sample-plugin" })]);
    expect(Object.isFrozen(registry.getAll())).toBe(true);
    expect(Object.isFrozen(registry.get("sample-plugin"))).toBe(true);
    expect(() => registry.register(valid)).toThrowError(/already registered/);

    const invalid = { ...plugin(), id: "Invalid ID" } as KcodePlugin;
    expect(() => registry.register(invalid)).toThrowError(PluginRegistryError);
  });
});

describe("PluginLifecycleManager", () => {
  it("runs the valid lifecycle and publishes each transition", async () => {
    const events = new InMemoryEventBus();
    const transitions: string[] = [];
    events.subscribe("plugin.lifecycle.changed", (payload) => {
      transitions.push((payload as { state: string }).state);
    });
    const registry = new PluginRegistry();
    const manager = new PluginLifecycleManager(registry, () => ({} as PluginContext), events);
    const candidate = plugin();

    manager.discover(candidate);
    await manager.register(candidate);
    await manager.initialize(candidate.id);
    await manager.activate(candidate.id);
    await manager.deactivate(candidate.id);
    await manager.dispose(candidate.id);

    expect(manager.getState(candidate.id)).toBe("disposed");
    expect(registry.get(candidate.id)).toBeUndefined();
    expect(transitions).toEqual(["registered", "initialized", "active", "inactive", "disposed"]);
  });

  it("rejects an invalid transition with a stable error code", async () => {
    const manager = new PluginLifecycleManager(
      new PluginRegistry(),
      () => ({} as PluginContext),
      new InMemoryEventBus(),
    );
    const candidate = plugin();
    manager.discover(candidate);

    await expect(manager.activate(candidate.id)).rejects.toMatchObject({
      code: "NOT_REGISTERED",
      pluginId: candidate.id,
      state: "discovered",
    });
  });
});

describe("InMemoryEventBus", () => {
  it("publishes typed payloads and supports both unsubscribe forms", async () => {
    type Events = { changed: { value: number } };
    const events = new InMemoryEventBus<Events>();
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribeFirst = events.subscribe("changed", first);
    events.subscribe("changed", second);

    await events.publish("changed", { value: 1 });
    unsubscribeFirst();
    events.unsubscribe("changed", second);
    await events.publish("changed", { value: 2 });

    expect(first).toHaveBeenCalledOnce();
    expect(first).toHaveBeenCalledWith({ value: 1 });
    expect(second).toHaveBeenCalledOnce();
  });
});

describe("ConfigurationStore", () => {
  const settings: readonly PluginSetting[] = [
    { key: "mode", label: "Mode", type: "select", defaultValue: "safe", options: [
      { label: "Safe", value: "safe" },
      { label: "Fast", value: "fast" },
    ] },
  ];

  it("isolates namespaces and validates declared keys and values", () => {
    const store = new ConfigurationStore();
    const first = store.createPluginConfiguration("first", settings);
    const second = store.createPluginConfiguration("second", settings);

    first.set("mode", "fast");
    expect(first.get("mode")).toBe("fast");
    expect(second.get("mode")).toBe("safe");
    expect(() => first.set("mode", "unsupported")).toThrowError(/not a declared option/);
    expect(() => first.get("undeclared")).toThrowError(/not declared/);
  });
});

describe("PermissionService", () => {
  it("supports grants, revocation, administrator access, and denial", () => {
    const permissions = new PermissionService();
    permissions.grant("operator", "robot.read");
    expect(permissions.has("operator", "robot.read")).toBe(true);
    expect(permissions.hasAll("operator", ["robot.read"])).toBe(true);
    expect(permissions.revoke("operator", "robot.read")).toBe(true);
    expect(() => permissions.assert("operator", "robot.read")).toThrowError(PermissionDeniedError);

    permissions.grant("admin", "platform.admin");
    expect(permissions.has("admin", "any.plugin.permission")).toBe(true);
  });
});
