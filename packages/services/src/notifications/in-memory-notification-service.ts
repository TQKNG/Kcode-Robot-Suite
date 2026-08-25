import type { Notification, NotificationLevel, NotificationService } from "@kcode/plugin-sdk";

export type NotificationListener = (notifications: readonly Notification[]) => void;

export class InMemoryNotificationService implements NotificationService {
  private sequence = 0;
  private readonly notifications: Notification[] = [];
  private readonly listeners = new Set<NotificationListener>();

  notify(input: Omit<Notification, "id" | "createdAt">): Notification {
    const stored = Object.freeze({ ...input, id: `notification-${++this.sequence}`, createdAt: new Date() });
    this.notifications.push(stored);
    this.publishChanges();
    return cloneNotification(stored);
  }

  info(title: string, message?: string): Notification { return this.create("info", title, message); }
  success(title: string, message?: string): Notification { return this.create("success", title, message); }
  warning(title: string, message?: string): Notification { return this.create("warning", title, message); }
  error(title: string, message?: string): Notification { return this.create("error", title, message); }

  dismiss(id: string): boolean {
    const index = this.notifications.findIndex((notification) => notification.id === id);
    if (index < 0) return false;
    this.notifications.splice(index, 1);
    this.publishChanges();
    return true;
  }

  clear(): void {
    if (this.notifications.length === 0) return;
    this.notifications.splice(0);
    this.publishChanges();
  }

  getAll(): readonly Notification[] {
    return Object.freeze(this.notifications.map(cloneNotification));
  }

  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    listener(this.getAll());
    return () => this.listeners.delete(listener);
  }

  private create(level: NotificationLevel, title: string, message?: string): Notification {
    return this.notify({ level, title, ...(message === undefined ? {} : { message }) });
  }

  private publishChanges(): void {
    const snapshot = this.getAll();
    for (const listener of [...this.listeners]) listener(snapshot);
  }
}

function cloneNotification(notification: Notification): Notification {
  return Object.freeze({ ...notification, createdAt: new Date(notification.createdAt.getTime()) });
}
