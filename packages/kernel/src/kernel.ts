import type { AuthService, EventBus, Logger, NavigationService, NotificationService, PluginContext } from "@kcode/plugin-sdk";
import { ConfigurationStore } from "./configuration/plugin-configuration-service";
import { InMemoryEventBus } from "./event-bus/event-bus";
import { PluginLifecycleManager } from "./lifecycle/plugin-lifecycle-manager";
import { PermissionService } from "./permissions/permission-service";
import { PluginRegistry } from "./plugin-registry/plugin-registry";

export interface KernelPlatformServices {
  readonly logger: Logger;
  readonly navigation: NavigationService;
  readonly notifications: NotificationService;
  readonly auth: AuthService;
}

/** Domain-agnostic composition of registry, lifecycle, events, and configuration. */
export class KcodeKernel {
  readonly registry = new PluginRegistry();
  readonly events: EventBus;
  readonly configuration = new ConfigurationStore();
  readonly permissions = new PermissionService();
  readonly lifecycle: PluginLifecycleManager;

  constructor(private readonly services: KernelPlatformServices, events: EventBus = new InMemoryEventBus()) {
    this.events = events;
    this.lifecycle = new PluginLifecycleManager(this.registry, (plugin) => this.createContext(plugin.id), this.events);
  }

  createContext(pluginId: string): PluginContext {
    const plugin = this.registry.get(pluginId);
    if (!plugin) throw new Error(`Cannot create a context for unregistered plugin "${pluginId}".`);
    const logger = this.createPluginLogger(pluginId);
    const events: EventBus = Object.freeze({
      publish: this.events.publish.bind(this.events),
      emit: this.events.emit.bind(this.events),
      subscribe: this.events.subscribe.bind(this.events),
      unsubscribe: this.events.unsubscribe.bind(this.events),
    });
    const navigation: NavigationService = Object.freeze({ navigate: this.services.navigation.navigate.bind(this.services.navigation) });
    const notifications: NotificationService = Object.freeze({
      notify: this.services.notifications.notify.bind(this.services.notifications),
      info: this.services.notifications.info.bind(this.services.notifications),
      success: this.services.notifications.success.bind(this.services.notifications),
      warning: this.services.notifications.warning.bind(this.services.notifications),
      error: this.services.notifications.error.bind(this.services.notifications),
      dismiss: this.services.notifications.dismiss.bind(this.services.notifications),
    });
    const auth: AuthService = Object.freeze({
      getCurrentUser: () => {
        const user = this.services.auth.getCurrentUser();
        return user && Object.freeze({ ...user, permissions: Object.freeze([...user.permissions]) });
      },
      isAuthenticated: this.services.auth.isAuthenticated.bind(this.services.auth),
      hasPermission: this.services.auth.hasPermission.bind(this.services.auth),
    });
    return Object.freeze({
      pluginId,
      logger,
      events,
      navigation,
      notifications,
      auth,
      configuration: this.configuration.createPluginConfiguration(pluginId, plugin.settings),
    });
  }

  private createPluginLogger(pluginId: string): Logger {
    const scoped = this.services.logger.withScope?.(`plugin:${pluginId}`);
    if (scoped) return scoped;
    const prefix = `[plugin:${pluginId}]`;
    return Object.freeze({
      debug: (message: string, context?: Readonly<Record<string, unknown>>) => this.services.logger.debug(`${prefix} ${message}`, context),
      info: (message: string, context?: Readonly<Record<string, unknown>>) => this.services.logger.info(`${prefix} ${message}`, context),
      warn: (message: string, context?: Readonly<Record<string, unknown>>) => this.services.logger.warn(`${prefix} ${message}`, context),
      error: (message: string, error?: unknown, context?: Readonly<Record<string, unknown>>) => this.services.logger.error(`${prefix} ${message}`, error, context),
    });
  }
}
