import type { EventBus, KcodePlugin, PluginContext, PluginLifecycleState } from "@kcode/plugin-sdk";
import type { PluginRegistry } from "../plugin-registry/plugin-registry";

export type PluginLifecycleErrorCode =
  | "ALREADY_DISCOVERED"
  | "INVALID_TRANSITION"
  | "NOT_REGISTERED"
  | "HOOK_FAILED"
  | "EVENT_DELIVERY_FAILED";

export class PluginLifecycleError extends Error {
  constructor(
    message: string,
    readonly code: PluginLifecycleErrorCode,
    readonly pluginId: string,
    readonly state: PluginLifecycleState | undefined,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "PluginLifecycleError";
  }
}

export type PluginContextFactory = (plugin: KcodePlugin) => PluginContext;
export interface LifecycleChangedEvent {
  readonly pluginId: string;
  readonly previousState: PluginLifecycleState;
  readonly state: PluginLifecycleState;
}

const transitions: Readonly<Record<PluginLifecycleState, readonly PluginLifecycleState[]>> = {
  discovered: ["registered"],
  registered: ["initialized", "disposed"],
  initialized: ["active", "inactive", "disposed"],
  active: ["inactive", "disposed"],
  inactive: ["active", "disposed"],
  disposed: [],
};

/** Serializes operations per plugin so hooks and state changes cannot race. */
export class PluginLifecycleManager {
  private readonly states = new Map<string, PluginLifecycleState>();
  private readonly operations = new Map<string, Promise<void>>();

  constructor(
    private readonly registry: PluginRegistry,
    private readonly contextFactory: PluginContextFactory,
    private readonly events: EventBus,
  ) {}

  discover(plugin: KcodePlugin): void {
    if (this.states.has(plugin.id)) {
      throw new PluginLifecycleError(
        `Plugin "${plugin.id}" has already been discovered.`,
        "ALREADY_DISCOVERED",
        plugin.id,
        this.states.get(plugin.id),
      );
    }
    this.states.set(plugin.id, "discovered");
  }

  register(plugin: KcodePlugin): Promise<void> {
    return this.runExclusive(plugin.id, async () => {
      this.requireState(plugin.id, "discovered");
      this.registry.register(plugin);
      try {
        await plugin.register?.(this.contextFactory(plugin));
        await this.transition(plugin.id, "registered");
      } catch (error) {
        if (this.states.get(plugin.id) === "discovered" && this.registry.get(plugin.id)) this.registry.unregister(plugin.id);
        throw this.wrapFailure(plugin.id, "register", error);
      }
    });
  }

  initialize(pluginId: string): Promise<void> {
    return this.runExclusive(pluginId, async () => {
      const plugin = this.requirePlugin(pluginId);
      this.requireState(pluginId, "registered");
      try {
        await plugin.initialize?.(this.contextFactory(plugin));
        await this.transition(pluginId, "initialized");
      } catch (error) {
        throw this.wrapFailure(pluginId, "initialize", error);
      }
    });
  }

  activate(pluginId: string): Promise<void> {
    return this.runExclusive(pluginId, async () => {
      const plugin = this.requirePlugin(pluginId);
      this.requireState(pluginId, "initialized", "inactive");
      try {
        await plugin.activate?.(this.contextFactory(plugin));
        await this.transition(pluginId, "active");
      } catch (error) {
        throw this.wrapFailure(pluginId, "activate", error);
      }
    });
  }

  deactivate(pluginId: string): Promise<void> {
    return this.runExclusive(pluginId, async () => {
      const plugin = this.requirePlugin(pluginId);
      this.requireState(pluginId, "active");
      try {
        await plugin.deactivate?.(this.contextFactory(plugin));
        await this.transition(pluginId, "inactive");
      } catch (error) {
        throw this.wrapFailure(pluginId, "deactivate", error);
      }
    });
  }

  dispose(pluginId: string): Promise<void> {
    return this.runExclusive(pluginId, async () => {
      const plugin = this.requirePlugin(pluginId);
      this.requireState(pluginId, "registered", "initialized", "active", "inactive");
      try {
        if (this.getState(pluginId) === "active") await plugin.deactivate?.(this.contextFactory(plugin));
        await plugin.dispose?.(this.contextFactory(plugin));
        await this.transition(pluginId, "disposed");
        this.registry.unregister(pluginId);
      } catch (error) {
        throw this.wrapFailure(pluginId, "dispose", error);
      }
    });
  }

  getState(pluginId: string): PluginLifecycleState | undefined { return this.states.get(pluginId); }

  getStates(): Readonly<Record<string, PluginLifecycleState>> {
    return Object.freeze(Object.fromEntries(this.states));
  }

  private async transition(pluginId: string, nextState: PluginLifecycleState): Promise<void> {
    const previousState = this.states.get(pluginId);
    if (!previousState || !transitions[previousState].includes(nextState)) {
      throw new PluginLifecycleError(
        `Invalid lifecycle transition for plugin "${pluginId}": ${previousState ?? "unknown"} -> ${nextState}.`,
        "INVALID_TRANSITION",
        pluginId,
        previousState,
      );
    }
    this.states.set(pluginId, nextState);
    try {
      await this.events.publish("plugin.lifecycle.changed", { pluginId, previousState, state: nextState });
    } catch (error) {
      throw new PluginLifecycleError(
        `Plugin "${pluginId}" transitioned to ${nextState}, but lifecycle event delivery failed.`,
        "EVENT_DELIVERY_FAILED",
        pluginId,
        nextState,
        { cause: error },
      );
    }
  }

  private requirePlugin(pluginId: string): KcodePlugin {
    const plugin = this.registry.get(pluginId);
    if (!plugin) {
      throw new PluginLifecycleError(`Plugin "${pluginId}" is not registered.`, "NOT_REGISTERED", pluginId, this.states.get(pluginId));
    }
    return plugin;
  }

  private requireState(pluginId: string, ...allowed: readonly PluginLifecycleState[]): void {
    const current = this.states.get(pluginId);
    if (!current || !allowed.includes(current)) {
      throw new PluginLifecycleError(
        `Plugin "${pluginId}" must be ${allowed.join(" or ")}; current state is ${current ?? "unknown"}.`,
        "INVALID_TRANSITION",
        pluginId,
        current,
      );
    }
  }

  private wrapFailure(pluginId: string, operation: string, error: unknown): PluginLifecycleError {
    if (error instanceof PluginLifecycleError) return error;
    return new PluginLifecycleError(
      `Plugin "${pluginId}" failed during ${operation}.`,
      "HOOK_FAILED",
      pluginId,
      this.states.get(pluginId),
      { cause: error },
    );
  }

  private runExclusive<T>(pluginId: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.operations.get(pluginId) ?? Promise.resolve();
    const result = previous.catch(() => undefined).then(operation);
    const tail = result.then(() => undefined, () => undefined);
    this.operations.set(pluginId, tail);
    return result.finally(() => {
      if (this.operations.get(pluginId) === tail) this.operations.delete(pluginId);
    });
  }
}
