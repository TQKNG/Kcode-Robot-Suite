import type { EventBus, EventHandler, Unsubscribe } from "@kcode/plugin-sdk";

/** In-process event bus. Handlers run in subscription order and failures propagate to publishers. */
export class InMemoryEventBus<TEvents extends object = Record<string, unknown>> implements EventBus<TEvents> {
  private readonly subscriptions = new Map<string, Set<EventHandler<unknown>>>();

  subscribe<TName extends Extract<keyof TEvents, string>>(eventName: TName, handler: EventHandler<TEvents[TName]>): Unsubscribe {
    const handlers = this.subscriptions.get(eventName) ?? new Set<EventHandler<unknown>>();
    this.subscriptions.set(eventName, handlers);
    const untypedHandler = handler as EventHandler<unknown>;
    handlers.add(untypedHandler);
    let subscribed = true;
    return () => {
      if (!subscribed) return;
      subscribed = false;
      this.unsubscribe(eventName, handler);
    };
  }

  unsubscribe<TName extends Extract<keyof TEvents, string>>(eventName: TName, handler: EventHandler<TEvents[TName]>): void {
    const handlers = this.subscriptions.get(eventName);
    if (!handlers) return;
    handlers.delete(handler as EventHandler<unknown>);
    if (handlers.size === 0) this.subscriptions.delete(eventName);
  }

  async publish<TName extends Extract<keyof TEvents, string>>(eventName: TName, payload: TEvents[TName]): Promise<void> {
    const handlers = [...(this.subscriptions.get(eventName) ?? [])];
    for (const handler of handlers) await handler(payload);
  }

  emit<TName extends Extract<keyof TEvents, string>>(eventName: TName, payload: TEvents[TName]): Promise<void> {
    return this.publish(eventName, payload);
  }
}
