"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PluginEntryProps } from "@kcode/plugin-sdk";
import { statusClass } from "@kcode/design-system";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { operationsService } from "../services/operations-service";
import type { AlertSeverity, Device, DeviceAction, DeviceStatus, DeviceType, OperationalSnapshot } from "../types";
import "../operational-dashboard.css";

const deviceTypes: readonly DeviceType[] = ["Service Robot", "Gateway", "Sensor", "Camera", "Charging Station", "Edge Device"];
const chartColors = { accent: "var(--color-accent)", danger: "#ff6e70", warning: "#ffb957", success: "#7ee081", muted: "#96a2aa", grid: "#29323a" };

function StatePanel({ kind, title, detail, onRetry }: { kind: "loading" | "error" | "empty"; title: string; detail: string; onRetry?: () => void }) {
  return <section className={`panel operation-state operation-state--${kind}`} role={kind === "error" ? "alert" : "status"} aria-live="polite">
    <span className="eyebrow">{kind}</span><h2>{title}</h2><p>{detail}</p>
    {onRetry && <button className="button button--primary" onClick={onRetry}>Retry connection</button>}
  </section>;
}

export function OperationalDashboardEntry({ context }: PluginEntryProps) {
  const configuredSeverity = context.configuration.get<string>("defaultAlertSeverity");
  const initialSeverity: AlertSeverity | "all" = configuredSeverity === "critical" || configuredSeverity === "warning" || configuredSeverity === "info" ? configuredSeverity : "all";
  const [snapshot, setSnapshot] = useState<OperationalSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<DeviceStatus | "all">("all");
  const [type, setType] = useState<DeviceType | "all">("all");
  const [severity, setSeverity] = useState<AlertSeverity | "all">(initialSeverity);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const canControl = context.auth.hasPermission("operations.device.control") || context.auth.hasPermission("device.control");
  const canAcknowledge = context.auth.hasPermission("operations.alert.manage") || context.auth.hasPermission("alert.manage");

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const next = await operationsService.getSnapshot();
      setSnapshot(next);
      context.logger.info("Operational snapshot loaded", { deviceCount: next.devices.length });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to load operational data.";
      setError(message); context.logger.error("Operational snapshot failed", caught);
    } finally { setLoading(false); }
  }, [context.logger]);

  useEffect(() => {
    void load();
    const refreshInterval = context.configuration.get<number>("refreshInterval");
    if (!refreshInterval || refreshInterval < 5) return;
    const timer = window.setInterval(() => void load(), refreshInterval * 1_000);
    return () => window.clearInterval(timer);
  }, [context.configuration, load]);

  const devices = useMemo(() => snapshot?.devices.filter((device) => {
    const search = query.trim().toLowerCase();
    return (status === "all" || device.status === status)
      && (type === "all" || device.type === type)
      && (!search || `${device.id} ${device.type} ${device.location}`.toLowerCase().includes(search));
  }) ?? [], [query, snapshot, status, type]);
  const showAcknowledged = context.configuration.get<boolean>("showAcknowledgedAlerts") !== false;
  const alerts = useMemo(() => snapshot?.alerts.filter((alert) => (showAcknowledged || !alert.acknowledged) && (severity === "all" || alert.severity === severity)) ?? [], [severity, showAcknowledged, snapshot]);
  const online = snapshot?.devices.filter((device) => device.status === "online").length ?? 0;
  const offline = snapshot?.devices.filter((device) => device.status === "offline").length ?? 0;
  const activeAlerts = snapshot?.alerts.filter((alert) => !alert.acknowledged).length ?? 0;
  const systemHealth = snapshot?.devices.length ? Math.round(snapshot.devices.reduce((total, device) => total + device.health, 0) / snapshot.devices.length) : 0;
  const distribution = [{ name: "Online", value: online }, { name: "Offline", value: offline }, { name: "Maintenance", value: (snapshot?.devices.length ?? 0) - online - offline }];

  async function runAction(deviceId: string, action: DeviceAction) {
    setBusyId(deviceId);
    try {
      const updated = await operationsService.performDeviceAction(deviceId, action);
      if (action === "inspect") setSelectedDevice(updated);
      await load();
      context.notifications.notify({ level: "success", title: action === "restart" ? "Restart completed" : "Inspection opened", message: `${deviceId} is ready for review.` });
      await context.events.emit("operations.device.action.completed", { deviceId, action });
    } catch (caught) {
      context.logger.error("Device action failed", caught, { deviceId, action });
      context.notifications.notify({ level: "error", title: "Device action failed", message: caught instanceof Error ? caught.message : "Please try again." });
    } finally { setBusyId(null); }
  }

  async function acknowledge(alertId: string) {
    setBusyId(alertId);
    try { await operationsService.acknowledgeAlert(alertId); await load(); context.notifications.notify({ level: "success", title: "Alert acknowledged" }); }
    catch (caught) { context.logger.error("Alert acknowledgement failed", caught, { alertId }); }
    finally { setBusyId(null); }
  }

  if (loading && !snapshot) return <StatePanel kind="loading" title="Synchronizing telemetry" detail="Collecting device health and alert streams…" />;
  if (error && !snapshot) return <StatePanel kind="error" title="Operations data unavailable" detail={error} onRetry={() => void load()} />;
  if (!snapshot) return <StatePanel kind="empty" title="No operational snapshot" detail="The service returned no monitoring data." onRetry={() => void load()} />;

  const chartProps = { data: [...snapshot.history], margin: { top: 8, right: 10, bottom: 0, left: -20 } };
  return <div className="plugin-layout operations-dashboard">
    <header className="operations-header"><div><span className="eyebrow">Fleet command / live mock telemetry</span><h1>Operational Dashboard</h1><p>Last synchronized {new Date(snapshot.capturedAt).toLocaleTimeString()}</p></div><div className="operations-actions"><button className="button" onClick={() => { operationsService.simulateNextFailure(); void load(); }}>Test error state</button><button className="button button--primary" disabled={loading} onClick={() => void load()}>{loading ? "Refreshing…" : "Refresh data"}</button></div></header>

    {error && <div className="operation-inline-error" role="alert">Refresh failed: {error}. Showing the last successful snapshot.</div>}
    <section className="metrics" aria-label="Key operational metrics">
      {[["Total Devices", snapshot.devices.length], ["Online", online], ["Offline", offline], ["Active Alerts", activeAlerts], ["System Health", `${systemHealth}%`]].map(([label, value]) => <article className="card metric" key={label}><span className="eyebrow">{label}</span><strong>{value}</strong></article>)}
    </section>

    <section className="operations-chart-grid" aria-label="Operations charts">
      <article className="panel chart-panel"><span className="eyebrow">Device activity</span><h3>Processed events / 7 days</h3><div className="chart-frame"><ResponsiveContainer width="100%" height="100%"><BarChart {...chartProps}><CartesianGrid stroke={chartColors.grid} vertical={false}/><XAxis dataKey="label" stroke={chartColors.muted}/><YAxis stroke={chartColors.muted}/><Tooltip/><Bar dataKey="activity" fill={chartColors.accent}/></BarChart></ResponsiveContainer></div></article>
      <article className="panel chart-panel"><span className="eyebrow">Online / offline</span><h3>Current fleet distribution</h3><div className="chart-frame"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={distribution} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78}>{[chartColors.success, chartColors.danger, chartColors.warning].map((color) => <Cell key={color} fill={color}/>)}</Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer></div></article>
      <article className="panel chart-panel"><span className="eyebrow">Alerts</span><h3>Daily alert volume</h3><div className="chart-frame"><ResponsiveContainer width="100%" height="100%"><BarChart {...chartProps}><CartesianGrid stroke={chartColors.grid} vertical={false}/><XAxis dataKey="label" stroke={chartColors.muted}/><YAxis stroke={chartColors.muted}/><Tooltip/><Bar dataKey="alerts" fill={chartColors.danger}/></BarChart></ResponsiveContainer></div></article>
      <article className="panel chart-panel"><span className="eyebrow">Robot utilization</span><h3>Utilization trend</h3><div className="chart-frame"><ResponsiveContainer width="100%" height="100%"><AreaChart {...chartProps}><CartesianGrid stroke={chartColors.grid} vertical={false}/><XAxis dataKey="label" stroke={chartColors.muted}/><YAxis stroke={chartColors.muted} domain={[0,100]}/><Tooltip/><Area type="monotone" dataKey="robotUtilization" stroke={chartColors.warning} fill={chartColors.warning} fillOpacity={0.18}/></AreaChart></ResponsiveContainer></div></article>
      <article className="panel chart-panel chart-panel--wide"><span className="eyebrow">System health</span><h3>Composite health score</h3><div className="chart-frame"><ResponsiveContainer width="100%" height="100%"><LineChart {...chartProps}><CartesianGrid stroke={chartColors.grid} vertical={false}/><XAxis dataKey="label" stroke={chartColors.muted}/><YAxis stroke={chartColors.muted} domain={[80,100]}/><Tooltip/><Line type="monotone" dataKey="systemHealth" stroke={chartColors.success} strokeWidth={3}/></LineChart></ResponsiveContainer></div></article>
    </section>

    <section className="panel operations-section"><div className="section-heading"><div><span className="eyebrow">Alert stream</span><h2>{alerts.length} alert{alerts.length === 1 ? "" : "s"} in view</h2></div><div className="segmented" aria-label="Filter alerts by severity">{(["all", "critical", "warning", "info"] as const).map((item) => <button className={`button ${severity === item ? "button--primary" : ""}`} aria-pressed={severity === item} key={item} onClick={() => setSeverity(item)}>{item}</button>)}</div></div>
      {alerts.length === 0 ? <div className="operation-empty"><strong>No alerts match this filter.</strong><span>Choose another severity to inspect the stream.</span></div> : <div className="alert-list">{alerts.map((alert) => <article className="alert-row" key={alert.id}><span className={statusClass(alert.severity)}>{alert.severity}</span><div><strong>{alert.deviceId}</strong><p>{alert.message}</p></div><time className="mono">{alert.occurredAt}</time><button className="button" disabled={alert.acknowledged || busyId === alert.id || !canAcknowledge} title={!canAcknowledge ? "Requires operations.alert.manage permission" : undefined} onClick={() => void acknowledge(alert.id)}>{alert.acknowledged ? "Acknowledged" : busyId === alert.id ? "Saving…" : "Acknowledge"}</button></article>)}</div>}
    </section>

    <section className="panel operations-section"><div className="section-heading"><div><span className="eyebrow">Fleet inventory</span><h2>{devices.length} matching devices</h2></div></div>
      <div className="device-filters"><label><span>Search fleet</span><input className="field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ID, type, or location" /></label><label><span>Status</span><select className="field" value={status} onChange={(event) => setStatus(event.target.value as DeviceStatus | "all")}><option value="all">All statuses</option><option value="online">Online</option><option value="offline">Offline</option><option value="maintenance">Maintenance</option></select></label><label><span>Device type</span><select className="field" value={type} onChange={(event) => setType(event.target.value as DeviceType | "all")}><option value="all">All types</option>{deviceTypes.map((item) => <option key={item}>{item}</option>)}</select></label><button className="button" onClick={() => { setQuery(""); setStatus("all"); setType("all"); }}>Clear filters</button></div>
      {selectedDevice && <aside className="device-inspector" aria-label={`${selectedDevice.id} inspection details`}><div><span className="eyebrow">Device inspection</span><h3>{selectedDevice.id} · {selectedDevice.type}</h3></div><dl><div><dt>Location</dt><dd>{selectedDevice.location}</dd></div><div><dt>Status</dt><dd><span className={statusClass(selectedDevice.status)}>{selectedDevice.status}</span></dd></div><div><dt>Health</dt><dd>{selectedDevice.health}%</dd></div><div><dt>Utilization</dt><dd>{selectedDevice.utilization}%</dd></div></dl><button className="button" onClick={() => setSelectedDevice(null)}>Close inspection</button></aside>}
      {devices.length === 0 ? <div className="operation-empty"><strong>No devices match your filters.</strong><span>Clear the filters to restore the full fleet.</span></div> : <div className="table-scroll"><table><thead><tr>{["Device", "Type", "Location", "Status", "Last Seen", "Health", "Actions"].map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{devices.map((device) => <tr key={device.id}><td className="mono">{device.id}</td><td>{device.type}</td><td>{device.location}</td><td><span className={statusClass(device.status)}>{device.status}</span></td><td>{device.lastSeen}</td><td><div className="health-cell"><progress max="100" value={device.health} aria-label={`${device.id} health ${device.health}%`}/><span>{device.health}%</span></div></td><td><div className="row-actions"><button className="button" disabled={busyId === device.id} onClick={() => void runAction(device.id, "inspect")}>Inspect</button><button className="button" disabled={busyId === device.id || !canControl} title={!canControl ? "Requires operations.device.control permission" : undefined} onClick={() => void runAction(device.id, "restart")}>{busyId === device.id ? "Working…" : "Restart"}</button></div></td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}
