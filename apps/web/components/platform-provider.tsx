"use client";

import type { EventHandler, Notification, PluginContext, PluginSettingValue } from "@kcode/plugin-sdk";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface PlatformRuntime {
  contextFor(pluginId: string): PluginContext;
}

const RuntimeContext = createContext<PlatformRuntime | null>(null);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const handlers = useRef(new Map<string, Set<EventHandler<unknown>>>());
  const configurations = useRef(new Map<string, Map<string, PluginSettingValue>>());
  const contexts = useRef(new Map<string, PluginContext>());
  const [notifications, setNotifications] = useState<readonly Notification[]>([]);

  const contextFor = useCallback((pluginId: string): PluginContext => {
    const cached = contexts.current.get(pluginId);
    if (cached) return cached;

    const pluginConfiguration = configurations.current.get(pluginId) ?? new Map<string, PluginSettingValue>();
    configurations.current.set(pluginId, pluginConfiguration);
    const publish = async <TPayload,>(eventName: string, payload: TPayload) => {
      const listeners = [...(handlers.current.get(eventName) ?? [])];
      await Promise.all(listeners.map((handler) => handler(payload)));
    };
    const notify = (input: Omit<Notification, "id" | "createdAt">) => {
      const notification: Notification = { ...input, id: crypto.randomUUID(), createdAt: new Date() };
      setNotifications((current) => [...current.slice(-2), notification]);
      window.setTimeout(() => setNotifications((current) => current.filter(({ id }) => id !== notification.id)), 4000);
      return notification;
    };
    const context: PluginContext = {
      pluginId,
      logger: {
        debug: (message, details) => console.debug(`[${pluginId}] ${message}`, details ?? ""),
        info: (message, details) => console.info(`[${pluginId}] ${message}`, details ?? ""),
        warn: (message, details) => console.warn(`[${pluginId}] ${message}`, details ?? ""),
        error: (message, error, details) => console.error(`[${pluginId}] ${message}`, error, details ?? ""),
      },
      events: {
        publish,
        emit: publish,
        subscribe<TPayload>(eventName: string, handler: EventHandler<TPayload>) {
          const listeners = handlers.current.get(eventName) ?? new Set<EventHandler<unknown>>();
          listeners.add(handler as EventHandler<unknown>);
          handlers.current.set(eventName, listeners);
          return () => { listeners.delete(handler as EventHandler<unknown>); };
        },
        unsubscribe<TPayload>(eventName: string, handler: EventHandler<TPayload>) {
          handlers.current.get(eventName)?.delete(handler as EventHandler<unknown>);
        },
      },
      navigation: { navigate: (path) => router.push(path) },
      notifications: {
        notify,
        info: (title, message) => notify({ level: "info", title, message }),
        success: (title, message) => notify({ level: "success", title, message }),
        warning: (title, message) => notify({ level: "warning", title, message }),
        error: (title, message) => notify({ level: "error", title, message }),
        dismiss(id) {
          setNotifications((current) => current.filter((notification) => notification.id !== id));
          return true;
        },
      },
      auth: {
        getCurrentUser: () => ({ id: "demo-admin", username: "admin", displayName: "Demo Administrator", permissions: ["platform.admin"] }),
        isAuthenticated: () => true,
        hasPermission: () => true,
      },
      configuration: {
        get: <TValue extends PluginSettingValue>(key: string) => pluginConfiguration.get(key) as TValue | undefined,
        set: <TValue extends PluginSettingValue>(key: string, value: TValue) => { pluginConfiguration.set(key, value); },
        getAll: () => Object.fromEntries(pluginConfiguration),
      },
    };
    contexts.current.set(pluginId, context);
    return context;
  }, [router]);

  const runtime = useMemo(() => ({ contextFor }), [contextFor]);
  return <RuntimeContext.Provider value={runtime}>{children}<div className="toast-region" aria-live="polite">{notifications.map((notification) => <div className={`toast toast--${notification.level}`} key={notification.id}><strong>{notification.title}</strong>{notification.message && <span>{notification.message}</span>}</div>)}</div></RuntimeContext.Provider>;
}

export function usePlatformRuntime() {
  const runtime = useContext(RuntimeContext);
  if (!runtime) throw new Error("usePlatformRuntime must be used inside PlatformProvider.");
  return runtime;
}
