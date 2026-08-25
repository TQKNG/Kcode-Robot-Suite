import type { ComponentType } from "react";

export type PluginStatus = "available" | "development" | "coming-soon";
export type PluginLifecycleState =
  | "discovered"
  | "registered"
  | "initialized"
  | "active"
  | "inactive"
  | "disposed";

export interface PluginMetadata {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly icon?: string;
  readonly version: string;
  readonly status: PluginStatus;
  readonly technologies: readonly string[];
}

export interface PluginRoute {
  readonly path: string;
  readonly title: string;
  readonly description?: string;
  readonly requiresAuthentication?: boolean;
  readonly requiredPermissions?: readonly string[];
}

export interface PluginNavigation {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly icon?: string;
  readonly order?: number;
  readonly visible?: boolean;
}

export interface PluginPermission {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category?: string;
}

export type PluginSettingValue = string | number | boolean | readonly string[];
export type PluginSettingType = "string" | "number" | "boolean" | "select" | "multiselect";

interface PluginSettingBase {
  readonly key: string;
  readonly label: string;
  readonly description?: string;
  readonly required?: boolean;
}

export interface PluginSettingOption {
  readonly label: string;
  readonly value: string;
}

export type PluginSetting =
  | (PluginSettingBase & { readonly type: "string"; readonly defaultValue: string; readonly options?: never })
  | (PluginSettingBase & { readonly type: "number"; readonly defaultValue: number; readonly options?: never })
  | (PluginSettingBase & { readonly type: "boolean"; readonly defaultValue: boolean; readonly options?: never })
  | (PluginSettingBase & { readonly type: "select"; readonly defaultValue: string; readonly options: readonly PluginSettingOption[] })
  | (PluginSettingBase & { readonly type: "multiselect"; readonly defaultValue: readonly string[]; readonly options: readonly PluginSettingOption[] });

export interface PluginCommand {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly requiredPermissions?: readonly string[];
  execute(context: PluginContext): Promise<void> | void;
}

export interface PluginEntryProps {
  readonly context: PluginContext;
}

export type PluginEntryComponent = ComponentType<PluginEntryProps>;

export interface KcodePlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly sdkVersion: string;
  readonly metadata: PluginMetadata;
  readonly entry?: PluginEntryComponent;
  readonly routes?: readonly PluginRoute[];
  readonly navigation?: readonly PluginNavigation[];
  readonly permissions?: readonly PluginPermission[];
  readonly settings?: readonly PluginSetting[];
  readonly commands?: readonly PluginCommand[];
  register?(context: PluginContext): Promise<void> | void;
  initialize?(context: PluginContext): Promise<void> | void;
  activate?(context: PluginContext): Promise<void> | void;
  deactivate?(context: PluginContext): Promise<void> | void;
  dispose?(context: PluginContext): Promise<void> | void;
}

export interface Logger {
  debug(message: string, context?: Readonly<Record<string, unknown>>): void;
  info(message: string, context?: Readonly<Record<string, unknown>>): void;
  warn(message: string, context?: Readonly<Record<string, unknown>>): void;
  error(message: string, error?: unknown, context?: Readonly<Record<string, unknown>>): void;
  /** Returns a logger whose records include the supplied child scope. */
  withScope?(scope: string): Logger;
}

export type EventHandler<TPayload> = (payload: TPayload) => void | Promise<void>;
export type Unsubscribe = () => void;

/**
 * A bus can be narrowed with an application event map while the default stays
 * open for independently packaged plugins.
 */
export interface EventBus<TEvents extends object = Record<string, unknown>> {
  publish<TName extends Extract<keyof TEvents, string>>(eventName: TName, payload: TEvents[TName]): Promise<void>;
  /** Compatibility alias retained for existing plugins. */
  emit<TName extends Extract<keyof TEvents, string>>(eventName: TName, payload: TEvents[TName]): Promise<void>;
  subscribe<TName extends Extract<keyof TEvents, string>>(eventName: TName, handler: EventHandler<TEvents[TName]>): Unsubscribe;
  unsubscribe<TName extends Extract<keyof TEvents, string>>(eventName: TName, handler: EventHandler<TEvents[TName]>): void;
}

export interface NavigationService {
  navigate(path: string): void;
}

export type NotificationLevel = "info" | "success" | "warning" | "error";
export interface Notification {
  readonly id: string;
  readonly level: NotificationLevel;
  readonly title: string;
  readonly message?: string;
  readonly createdAt: Date;
}
export interface NotificationService {
  notify(input: Omit<Notification, "id" | "createdAt">): Notification;
  info(title: string, message?: string): Notification;
  success(title: string, message?: string): Notification;
  warning(title: string, message?: string): Notification;
  error(title: string, message?: string): Notification;
  dismiss(id: string): boolean;
}

export interface AuthenticatedUser {
  readonly id: string;
  readonly username: string;
  readonly displayName: string;
  readonly permissions: readonly string[];
}
export interface AuthService {
  getCurrentUser(): AuthenticatedUser | null;
  isAuthenticated(): boolean;
  hasPermission(permissionId: string): boolean;
}

export interface PluginConfigurationService {
  get<TValue extends PluginSettingValue>(key: string): TValue | undefined;
  set<TValue extends PluginSettingValue>(key: string, value: TValue): void;
  getAll(): Readonly<Record<string, PluginSettingValue>>;
}

export interface PluginContext {
  readonly pluginId: string;
  readonly logger: Logger;
  readonly events: EventBus;
  readonly navigation: NavigationService;
  readonly notifications: NotificationService;
  readonly auth: AuthService;
  readonly configuration: PluginConfigurationService;
}
