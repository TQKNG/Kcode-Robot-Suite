import type { HTMLAttributes, ReactNode, TableHTMLAttributes } from "react";
import { useId } from "react";
import { Button, Inline, Panel } from "./primitives";
import { cn } from "./utilities";

export type DialogProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  open?: boolean;
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
};

export function Dialog({ open = true, title, description, footer, onClose, className, children, ...props }: DialogProps) {
  const instanceId = useId();
  const titleId = `${instanceId}-title`;
  const descriptionId = `${instanceId}-description`;
  if (!open) return null;
  return (
    <div className="ds-dialog-backdrop" role="presentation">
      <div className={cn("ds-dialog", className)} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} {...props}>
        <header className="ds-dialog__header">
          <div><h2 id={titleId}>{title}</h2>{description && <p id={descriptionId}>{description}</p>}</div>
          {onClose && <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close dialog">×</Button>}
        </header>
        <div className="ds-dialog__body">{children}</div>
        {footer && <footer className="ds-dialog__footer">{footer}</footer>}
      </div>
    </div>
  );
}

export function TableFrame({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("ds-table-frame", className)} {...props}>{children}</div>;
}

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("ds-table", className)} {...props} />;
}

export type StateProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
};

function State({ title, description, action, icon, className, children, ...props }: StateProps) {
  return (
    <div className={cn("ds-state", className)} {...props}>
      {icon && <div className="ds-state__icon" aria-hidden="true">{icon}</div>}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
      {action && <div className="ds-state__action">{action}</div>}
    </div>
  );
}

export function EmptyState(props: StateProps) {
  return <State icon="◇" {...props} />;
}

export function ErrorState(props: StateProps) {
  return <State icon="!" role="alert" {...props} className={cn("ds-state--error", props.className)} />;
}

export type LoadingStateProps = Omit<StateProps, "title"> & { title?: ReactNode };
export function LoadingState({ title = "Loading", ...props }: LoadingStateProps) {
  return <State title={title} icon={<span className="ds-spinner" />} aria-live="polite" aria-busy="true" {...props} />;
}

export type MetricProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
  trend?: "up" | "down" | "flat";
};
export function Metric({ label, value, detail, trend, className, ...props }: MetricProps) {
  return <Panel className={cn("metric", className)} {...props}><span className="eyebrow">{label}</span><strong>{value}</strong>{detail && <span className={cn("metric__detail", trend && `metric__detail--${trend}`)}>{detail}</span>}</Panel>;
}

export type PageHeaderProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};
export function PageHeader({ eyebrow, title, description, actions, className, ...props }: PageHeaderProps) {
  return <header className={cn("ds-page-header", className)} {...props}><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <Inline>{actions}</Inline>}</header>;
}
