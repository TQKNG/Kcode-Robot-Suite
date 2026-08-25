import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "./utilities";

export const chartColors = {
  accent: "var(--color-accent)",
  info: "var(--color-info)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  muted: "var(--color-text-muted)",
  grid: "var(--color-border)",
} as const;

export type ChartFrameProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  description?: ReactNode;
  legend?: ReactNode;
  height?: number | string;
};

export function ChartFrame({ title, description, legend, height = 280, className, children, style, ...props }: ChartFrameProps) {
  return (
    <figure className={cn("ds-chart", className)} style={{ "--chart-height": typeof height === "number" ? `${height}px` : height, ...style } as CSSProperties} {...props}>
      {(title || description) && <figcaption><div>{title && <strong>{title}</strong>}{description && <span>{description}</span>}</div>{legend}</figcaption>}
      <div className="ds-chart__plot">{children}</div>
    </figure>
  );
}

export type ChartLegendItem = { label: string; color: string };
export function ChartLegend({ items, className, ...props }: HTMLAttributes<HTMLDivElement> & { items: ChartLegendItem[] }) {
  return <div className={cn("ds-chart-legend", className)} {...props}>{items.map((item) => <span key={item.label}><i style={{ backgroundColor: item.color }} />{item.label}</span>)}</div>;
}
