import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn, statusTone, type StatusTone } from "./utilities";

export type SurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: "article" | "aside" | "div" | "section";
  variant?: "card" | "panel";
};

export function Surface({ as: Component = "div", variant = "panel", className, ...props }: SurfaceProps) {
  return <Component className={cn(variant, className)} {...props} />;
}

export function Card(props: Omit<SurfaceProps, "variant">) {
  return <Surface variant="card" {...props} />;
}

export function Panel(props: Omit<SurfaceProps, "variant">) {
  return <Surface variant="panel" {...props} />;
}

export function Stack({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("ds-stack", className)} {...props} />;
}

export function Inline({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("ds-inline", className)} {...props} />;
}

export function Grid({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("ds-grid", className)} {...props} />;
}

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("ds-container", className)} {...props} />;
}

export function Divider({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn("ds-divider", className)} {...props} />;
}

export function Eyebrow({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("eyebrow", className)} {...props} />;
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export function Button({ variant = "secondary", size = "md", loading = false, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn("button", variant !== "secondary" && `button--${variant}`, size !== "md" && `button--${size}`, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span className="ds-spinner ds-spinner--small" aria-hidden="true" />}
      {children}
    </button>
  );
}

export type FieldShellProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

export function FieldShell({ id, label, hint, error, optional, className, children }: FieldShellProps) {
  const descriptionId = hint != null || error != null ? `${id}-description` : undefined;
  return (
    <div className={cn("ds-field-shell", error != null && "ds-field-shell--error", className)}>
      <label className="ds-label" htmlFor={id}>
        {label}{optional && <span className="ds-label__optional">Optional</span>}
      </label>
      {children}
      {(error != null || hint != null) && <div id={descriptionId} className={cn("ds-field-message", error != null && "ds-field-message--error")}>{error ?? hint}</div>}
    </div>
  );
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };
export function Input({ className, invalid, ...props }: InputProps) {
  return <input className={cn("field", invalid && "field--invalid", className)} aria-invalid={invalid || undefined} {...props} />;
}

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };
export function Select({ className, invalid, ...props }: SelectProps) {
  return <select className={cn("field", invalid && "field--invalid", className)} aria-invalid={invalid || undefined} {...props} />;
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };
export function Textarea({ className, invalid, ...props }: TextareaProps) {
  return <textarea className={cn("field ds-textarea", invalid && "field--invalid", className)} aria-invalid={invalid || undefined} {...props} />;
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("ds-label", className)} {...props} />;
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: StatusTone };
export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return <span className={cn("badge", `badge--${tone}`, className)} {...props} />;
}

export type StatusProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: StatusTone;
  value?: string;
};
export function Status({ tone, value, children, className, ...props }: StatusProps) {
  const content = value ?? children;
  const resolvedTone = tone ?? statusTone(String(content ?? ""));
  return <span className={cn("status", resolvedTone !== "neutral" && `status--${resolvedTone}`, className)} {...props}>{content}</span>;
}

export type LogoProps = HTMLAttributes<HTMLDivElement> & {
  compact?: boolean;
  product?: string;
};
/** Replace the mark span with the final image asset without changing consumers. */
export function Logo({ compact = false, product, className, ...props }: LogoProps) {
  return (
    <div className={cn("brand", className)} aria-label={product ? `Kcode ${product}` : "Kcode"} {...props}>
      <span className="mark" aria-hidden="true">K</span>
      {!compact && <><span>KCODE</span>{product && <span className="brand__product">{product}</span>}</>}
    </div>
  );
}
