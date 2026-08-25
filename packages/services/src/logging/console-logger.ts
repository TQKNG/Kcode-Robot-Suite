import type { Logger } from "@kcode/plugin-sdk";

export class ConsoleLogger implements Logger {
  constructor(private readonly scope = "platform") {}

  debug(message: string, context?: Readonly<Record<string, unknown>>): void { this.write(console.debug, message, context); }
  info(message: string, context?: Readonly<Record<string, unknown>>): void { this.write(console.info, message, context); }
  warn(message: string, context?: Readonly<Record<string, unknown>>): void { this.write(console.warn, message, context); }
  error(message: string, error?: unknown, context?: Readonly<Record<string, unknown>>): void {
    const details = { ...(context ?? {}), ...(error === undefined ? {} : { error }) };
    this.write(console.error, message, Object.keys(details).length > 0 ? details : undefined);
  }

  withScope(scope: string): Logger {
    const normalized = scope.trim();
    return new ConsoleLogger(normalized ? `${this.scope}:${normalized}` : this.scope);
  }

  private write(
    sink: (message?: unknown, ...optionalParameters: unknown[]) => void,
    message: string,
    context?: Readonly<Record<string, unknown>>,
  ): void {
    const prefix = `[${this.scope}] ${message}`;
    if (context === undefined) sink(prefix);
    else sink(prefix, context);
  }
}
