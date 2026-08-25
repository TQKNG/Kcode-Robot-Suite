"use client";

import { useEffect, useMemo, useState } from "react";
import type { PluginEntryProps } from "@kcode/plugin-sdk";
import type { Robot, RobotDirection } from "../domain/robot";
import type { Point, RobotRoute } from "../domain/route";
import { MockRobotService } from "../services/mock-robot.service";
import { MockRouteService } from "../services/mock-route.service";
import styles from "./where-my-bot.module.css";

const ROBOT_ID = "WB-001";
const turn: Record<RobotDirection, number> = {
  North: -90, "North East": -45, East: 0, "South East": 45,
  South: 90, "South West": 135, West: 180, "North West": -135,
};

function HotelFloorPlan({ robot, path, drawing, onPoint, onRobotSelect }: {
  robot: Robot | null;
  path: readonly Point[];
  drawing: boolean;
  onPoint(point: Point): void;
  onRobotSelect(): void;
}) {
  const points = path.map(({ x, y }) => `${x},${y}`).join(" ");
  const addPoint = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!drawing) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    onPoint({
      x: Math.round((event.clientX - bounds.left) * 600 / bounds.width),
      y: Math.round((event.clientY - bounds.top) * 460 / bounds.height),
    });
  };
  return (
    <svg className={`${styles.floor} ${drawing ? styles.drawing : ""}`} viewBox="0 0 600 460" onClick={addPoint}
      role="img" aria-label="Interactive Kcode Hotel floor plan. Select Draw Path, then click the map to add route points.">
      <title>Kcode Hotel floor plan and robot route</title>
      <desc>Three guest rooms, lobby, main hallways, service area, elevator, charging station and service robot WB-001.</desc>
      <defs>
        <pattern id="wmb-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" className={styles.gridLine}/></pattern>
        <filter id="wmb-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="600" height="460" className={styles.floorBase}/><rect width="600" height="460" fill="url(#wmb-grid)"/>
      <g role="group" aria-label="Hotel rooms">
        <g><rect x="145" y="35" width="120" height="130" rx="4" className={styles.room}/><text x="205" y="91" textAnchor="middle">ROOM 101</text><text x="205" y="112" textAnchor="middle" className={styles.subLabel}>GUEST ROOM</text></g>
        <g><rect x="270" y="35" width="120" height="130" rx="4" className={styles.room}/><text x="330" y="91" textAnchor="middle">ROOM 102</text><text x="330" y="112" textAnchor="middle" className={styles.subLabel}>GUEST ROOM</text></g>
        <g><rect x="395" y="35" width="120" height="130" rx="4" className={styles.room}/><text x="455" y="91" textAnchor="middle">ROOM 103</text><text x="455" y="112" textAnchor="middle" className={styles.subLabel}>GUEST ROOM</text></g>
      </g>
      <g role="group" aria-label="Hotel common areas">
        <rect x="48" y="326" width="190" height="105" rx="4" className={styles.area}/><text x="112" y="382">LOBBY</text>
        <rect x="385" y="292" width="115" height="84" rx="4" className={styles.area}/><text x="442" y="326" textAnchor="middle">SERVICE AREA</text>
        <rect x="520" y="176" width="58" height="108" rx="4" className={styles.utility}/><text x="549" y="218" textAnchor="middle">LIFT</text><text x="549" y="237" textAnchor="middle" className={styles.subLabel}>ELEVATOR</text>
        <rect x="508" y="344" width="72" height="86" rx="4" className={styles.charge}/><text x="544" y="375" textAnchor="middle">CHARGE</text><path d="M548 385l-11 16h10l-5 15 16-22h-10z" className={styles.bolt}/>
      </g>
      <g aria-label="Hallways"><path d="M112 326V248H549M205 248V165M330 248V165M455 248V165M330 248V376" className={styles.hallway}/><text x="340" y="238" className={styles.subLabel}>MAIN HALLWAY</text></g>
      {points && <polyline points={points} className={styles.route}/>} 
      {path.map((point, index) => <circle key={`${point.x}-${point.y}-${index}`} cx={point.x} cy={point.y} r="5" className={styles.waypoint}><title>Waypoint {index + 1}</title></circle>)}
      {robot && <g className={styles.robot} transform={`translate(${robot.position.x} ${robot.position.y})`} role="button" tabIndex={0}
        aria-label={`Open controls for robot ${robot.id}, ${robot.status}, battery ${robot.battery} percent`}
        onClick={(event) => { event.stopPropagation(); onRobotSelect(); }}
        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onRobotSelect(); } }}>
        <circle r="23" className={styles.robotHalo}/><circle r="17" className={styles.robotBody}/>
        <path d="M2 0L-6-6V6Z" className={styles.robotDirection} transform={`rotate(${turn[robot.direction]})`}/>
        <text y="34" textAnchor="middle" className={styles.robotLabel}>{robot.id}</text>
      </g>}
    </svg>
  );
}

export function WhereMyBotEntry({ context }: PluginEntryProps) {
  const robotService = useMemo(() => new MockRobotService(), []);
  const routeService = useMemo(() => new MockRouteService(), []);
  const [robot, setRobot] = useState<Robot | null>(null);
  const [path, setPath] = useState<readonly Point[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [presets, setPresets] = useState<readonly RobotRoute[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<readonly RobotRoute[]>([]);
  const [routeName, setRouteName] = useState("Guest delivery route");
  const [message, setMessage] = useState(() => context.configuration.get<string>("robot.defaultWelcomeMessage") ?? "Welcome to Kcode Hotel");
  const [announcement, setAnnouncement] = useState("Robot systems ready.");
  const canExecute = path.length >= 2 && robot?.status !== "Moving";

  useEffect(() => {
    const unsubscribe = robotService.subscribe(ROBOT_ID, setRobot);
    void routeService.getPresetRoutes().then(setPresets);
    return () => { unsubscribe(); void robotService.stopRobot(ROBOT_ID); };
  }, [robotService, routeService]);

  const chooseRoute = (route: RobotRoute) => {
    setPath(route.points);
    setDrawing(false);
    setAnnouncement(`${route.name} loaded with ${route.points.length} waypoints.`);
    void context.events.emit("robot.route.selected", { robotId: ROBOT_ID, routeId: route.id });
  };
  const saveRoute = async () => {
    try {
      const saved = await routeService.saveRoute({ id: `custom-${Date.now()}`, name: routeName.trim() || "Custom route", points: path, preset: false });
      setSavedRoutes(await routeService.getSavedRoutes());
      setAnnouncement(`${saved.name} saved.`);
      context.notifications.notify({ level: "success", title: "Route saved", message: `${saved.points.length} waypoints are ready to reuse.` });
      await context.events.emit("robot.route.saved", { robotId: ROBOT_ID, routeId: saved.id, waypointCount: saved.points.length });
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Route could not be saved.";
      setAnnouncement(detail);
      context.notifications.notify({ level: "warning", title: "Route not saved", message: detail });
    }
  };
  const execute = async () => {
    if (!canExecute) return;
    const route = { id: `active-${Date.now()}`, name: routeName, points: path, preset: false } satisfies RobotRoute;
    setAnnouncement("Route execution started.");
    await context.events.emit("robot.route.started", { robotId: ROBOT_ID, routeId: route.id, waypointCount: path.length });
    try {
      const configuredSpeed = context.configuration.get<number>("robot.defaultSpeed") ?? 115;
      await robotService.executeRoute(ROBOT_ID, route, configuredSpeed);
      const current = await robotService.getRobot(ROBOT_ID);
      if (current.status === "Paused") return;
      setAnnouncement("Route complete. Robot is idle.");
      await context.events.emit("robot.route.completed", { robotId: ROBOT_ID, routeId: route.id });
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Route execution failed.";
      setAnnouncement(detail);
      await context.events.emit("robot.route.failed", { robotId: ROBOT_ID, routeId: route.id, error: detail });
    }
  };
  const stop = async () => {
    await robotService.stopRobot(ROBOT_ID);
    setAnnouncement("Robot stopped at its current position.");
    await context.events.emit("robot.route.stopped", { robotId: ROBOT_ID, reason: "operator" });
  };
  const sendMessage = async () => {
    try {
      await robotService.sendMessage(ROBOT_ID, message);
      setAnnouncement(`Message queued for ${ROBOT_ID}.`);
      context.notifications.notify({ level: "success", title: "Message queued", message });
      await context.events.emit("robot.message.sent", { robotId: ROBOT_ID, message });
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Message could not be sent.";
      setAnnouncement(detail);
      context.notifications.notify({ level: "warning", title: "Message not sent", message: detail });
    }
  };

  return <div className={styles.layout}>
    <section className="panel" aria-labelledby="floor-plan-title">
      <div className={styles.sectionHeading}><div><span className="eyebrow">Live operations</span><h2 id="floor-plan-title">Kcode Hotel / Level 01</h2></div><span className={`status ${robot?.status === "Paused" ? "status--warning" : "status--success"}`}>{robot?.status ?? "Connecting"}</span></div>
      <div className="toolbar" role="toolbar" aria-label="Route drawing controls">
        <button className={`button ${drawing ? "button--primary" : ""}`} type="button" aria-pressed={drawing} onClick={() => { setDrawing((value) => !value); setAnnouncement(drawing ? "Path drawing off." : "Path drawing on. Click the floor plan to add points."); }}>Draw Path</button>
        <button className="button" type="button" disabled={!path.length} onClick={() => setPath((points) => points.slice(0, -1))}>Undo</button>
        <button className="button" type="button" disabled={!path.length} onClick={() => { setPath([]); setAnnouncement("Path cleared."); }}>Clear</button>
        <button className="button" type="button" disabled={path.length < 2} onClick={() => void saveRoute()}>Save</button>
        <button className="button button--primary" type="button" disabled={!canExecute} onClick={() => void execute()}>Execute</button>
      </div>
      <label className={styles.routeName}>Route name<input className="field" value={routeName} maxLength={60} onChange={(event) => setRouteName(event.target.value)}/></label>
      <HotelFloorPlan robot={robot} path={path} drawing={drawing} onPoint={(point) => setPath((points) => [...points, point])} onRobotSelect={() => setPanelOpen(true)}/>
      <div className={styles.mapFooter}><span>{path.length} waypoint{path.length === 1 ? "" : "s"}</span><span>{drawing ? "DRAWING ACTIVE" : "SELECT DRAW PATH TO EDIT"}</span></div>
      <p className={styles.srOnly} aria-live="polite">{announcement}</p>
    </section>

    <aside className="panel" aria-label="Routes and robot controls">
      <section><span className="eyebrow">Preset routes</span><h2>Dispatch</h2><div className={styles.routeList}>{presets.map((route) => <button type="button" className="button" key={route.id} onClick={() => chooseRoute(route)}>{route.name}<small>{route.points.length} points</small></button>)}</div></section>
      {!!savedRoutes.length && <section className={styles.controlSection}><span className="eyebrow">Saved routes</span><div className={styles.routeList}>{savedRoutes.map((route) => <button type="button" className="button" key={route.id} onClick={() => chooseRoute(route)}>{route.name}</button>)}</div></section>}
      {panelOpen ? <section className={styles.controlSection} aria-labelledby="robot-controls-title">
        <div className={styles.sectionHeading}><div><span className="eyebrow">Robot control</span><h2 id="robot-controls-title">{robot?.id}</h2></div><button type="button" className={styles.close} aria-label="Close robot controls" onClick={() => setPanelOpen(false)}>×</button></div>
        <dl className={styles.telemetry}>
          <div><dt>Status</dt><dd>{robot?.status}</dd></div><div><dt>Battery</dt><dd>{robot?.battery}%</dd></div>
          <div><dt>Location</dt><dd>{robot?.currentLocation}</dd></div><div><dt>Direction</dt><dd>{robot?.direction}</dd></div>
        </dl>
        <button className="button button--danger" type="button" disabled={robot?.status !== "Moving"} onClick={() => void stop()}>Stop Robot</button>
        <label className={styles.messageLabel} htmlFor="robot-welcome-message">Welcome Message</label>
        <textarea id="robot-welcome-message" className={`field ${styles.message}`} rows={3} maxLength={180} value={message} onChange={(event) => setMessage(event.target.value)}/>
        <button className="button" type="button" disabled={!message.trim()} onClick={() => void sendMessage()}>Send Message</button>
      </section> : <button type="button" className={`button ${styles.openControls}`} onClick={() => setPanelOpen(true)}>Open {ROBOT_ID} controls</button>}
      <p className={styles.announcement} aria-live="polite">{announcement}</p>
    </aside>
  </div>;
}
