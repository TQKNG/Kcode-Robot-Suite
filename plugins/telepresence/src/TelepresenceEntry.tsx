"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { PluginEntryProps, PluginSettingValue } from "@kcode/plugin-sdk";
import { aiAssistantService, meetingService } from "./services";
import type { InsightKind, Meeting, MeetingDevices, MeetingInsights } from "./services";

type MediaState = { microphone: boolean; camera: boolean; screen: boolean };
type Configuration = {
  aiAssistant: boolean; automaticNotes: boolean; actionItems: boolean; language: string; summaryStyle: string;
  camera: string; microphone: string; speaker: string; videoQuality: string; recording: boolean;
  participantPermissions: string; waitingRoom: boolean; meetingDuration: number;
};

const initialConfiguration: Configuration = {
  aiAssistant: true, automaticNotes: true, actionItems: true, language: "English", summaryStyle: "Concise",
  camera: "camera-1", microphone: "mic-1", speaker: "speaker-1", videoQuality: "1080p", recording: false,
  participantPermissions: "Present and chat", waitingRoom: true, meetingDuration: 45,
};
const emptyInsights: MeetingInsights = { keyPoints: [], actionItems: [], summary: "" };
const card: CSSProperties = { background: "var(--surface)", border: "1px solid var(--line)", padding: 18 };
const label: CSSProperties = { display: "grid", gap: 7, color: "var(--muted)", fontSize: 12 };

function formatDuration(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function TelepresenceEntry({ context }: PluginEntryProps) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [devices, setDevices] = useState<MeetingDevices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [media, setMedia] = useState<MediaState>({ microphone: true, camera: true, screen: false });
  const [assistantActive, setAssistantActive] = useState(false);
  const [insights, setInsights] = useState<MeetingInsights>(emptyInsights);
  const [selectedInsight, setSelectedInsight] = useState<InsightKind>("notes");
  const [configuration, setConfiguration] = useState(initialConfiguration);
  const [elapsed, setElapsed] = useState(0);
  const [copyStatus, setCopyStatus] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [nextMeeting, nextDevices] = await Promise.all([meetingService.getActiveMeeting(), meetingService.getDevices()]);
      setMeeting(nextMeeting); setDevices(nextDevices);
      setElapsed(Math.max(0, Math.floor((Date.now() - Date.parse(nextMeeting.startedAt)) / 1000)));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The mock meeting could not be loaded."); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (meeting?.status !== "live") return;
    const timer = window.setInterval(() => setElapsed(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [meeting?.status]);

  const canManage = context.auth.hasPermission("meeting.manage");
  const canUseAi = context.auth.hasPermission("meeting.ai");
  const outputText = useMemo(() => [
    "KEY POINTS", ...insights.keyPoints.map(item => `• ${item}`), "", "ACTION ITEMS", ...insights.actionItems.map(item => `• ${item}`), "", "MEETING SUMMARY", insights.summary,
  ].join("\n"), [insights]);

  const notifyError = (title: string, reason: unknown) => {
    const message = reason instanceof Error ? reason.message : "Please try again.";
    setError(message); context.notifications.notify({ level: "error", title, message });
  };

  const toggleMedia = async (key: keyof MediaState) => {
    if (!meeting || meeting.status !== "live" || !canManage) return;
    const next = { ...media, [key]: !media[key] };
    setMedia(next); setBusy(key);
    try { await meetingService.setMedia(meeting.id, next); }
    catch (reason) { setMedia(media); notifyError("Media control failed", reason); }
    finally { setBusy(null); }
  };

  const endMeeting = async () => {
    if (!meeting || !canManage) return;
    setBusy("meeting");
    try {
      await meetingService.endMeeting(meeting.id); setMeeting({ ...meeting, status: "ended" }); setAssistantActive(false);
      await context.events.emit("meeting.ended", { meetingId: meeting.id, endedAt: new Date().toISOString() });
      context.notifications.notify({ level: "success", title: "Meeting ended", message: "The mock session has closed." });
    } catch (reason) { notifyError("Meeting could not end", reason); }
    finally { setBusy(null); }
  };

  const restartMeeting = async () => {
    if (!meeting || !canManage) return;
    setBusy("meeting");
    try {
      const restarted = await meetingService.restartMeeting(meeting.id); setMeeting(restarted); setElapsed(0);
      await context.events.emit("meeting.started", { meetingId: restarted.id, startedAt: restarted.startedAt });
    } catch (reason) { notifyError("Meeting could not start", reason); }
    finally { setBusy(null); }
  };

  const toggleAssistant = async () => {
    if (!meeting || meeting.status !== "live" || !canUseAi || !configuration.aiAssistant) return;
    setBusy("assistant");
    try {
      if (assistantActive) await aiAssistantService.stop(meeting.id); else await aiAssistantService.start(meeting.id);
      setAssistantActive(!assistantActive);
    } catch (reason) { notifyError("AI assistant unavailable", reason); }
    finally { setBusy(null); }
  };

  const generate = async (kind: InsightKind) => {
    if (!meeting || !canUseAi || !configuration.aiAssistant) return;
    setBusy(kind); setSelectedInsight(kind); setError("");
    try {
      const generated = await aiAssistantService.generate(meeting.id, kind, { language: configuration.language, summaryStyle: configuration.summaryStyle });
      setInsights(generated);
      await context.events.emit("meeting.notes.generated", { meetingId: meeting.id, kind, generatedAt: new Date().toISOString(), provider: aiAssistantService.providerName });
      context.notifications.notify({ level: "success", title: `${kind === "actions" ? "Action items" : kind[0].toUpperCase() + kind.slice(1)} generated`, message: "Simulated AI output is ready." });
    } catch (reason) { notifyError("AI generation failed", reason); }
    finally { setBusy(null); }
  };

  const copyNotes = async () => {
    if (!outputText.trim()) return;
    try { await navigator.clipboard.writeText(outputText); setCopyStatus("Copied"); window.setTimeout(() => setCopyStatus(""), 1600); }
    catch (reason) { notifyError("Copy failed", reason); }
  };

  const saveConfiguration = () => {
    Object.entries(configuration).forEach(([key, value]) => context.configuration.set(`telepresence.${key}`, value as PluginSettingValue));
    context.notifications.notify({ level: "success", title: "Configuration saved", message: "Demo meeting defaults updated for this session." });
  };

  if (loading) return <section style={card} aria-live="polite"><p className="eyebrow">Connecting to mock provider</p><h2>Preparing the demo meeting…</h2><p style={{ color: "var(--muted)" }}>Loading participants, devices, and meeting state.</p></section>;
  if (error && !meeting) return <section style={card} role="alert"><p className="eyebrow">Meeting unavailable</p><h2>We could not load the demo room.</h2><p style={{ color: "var(--danger)" }}>{error}</p><button className="button button--primary" onClick={() => void load()}>Retry</button></section>;
  if (!meeting) return null;

  const setConfig = <K extends keyof Configuration>(key: K, value: Configuration[K]) => setConfiguration(current => ({ ...current, [key]: value }));
  const ended = meeting.status === "ended";
  return <div style={{ display: "grid", gap: 16 }}>
    <style>{`@media(max-width:900px){.tp-main-grid,.tp-insights-grid,.tp-config-grid{grid-template-columns:1fr!important}} @media(max-width:560px){.tp-meeting-controls{justify-content:stretch!important}.tp-meeting-controls button{flex:1 1 42%}}`}</style>
    <div style={{ ...card, padding: "10px 14px", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
      <span className="status status--warning">Simulation mode · no media is transmitted</span>
      <span className="mono" style={{ color: "var(--muted)", fontSize: 12 }}>Provider: {aiAssistantService.providerName}</span>
    </div>
    {error && <div style={{ ...card, borderColor: "var(--danger)", color: "var(--danger)" }} role="alert">{error} <button className="button" style={{ marginLeft: 12 }} onClick={() => setError("")}>Dismiss</button></div>}

    <div className="tp-main-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)", gap: 16 }}>
      <section style={{ display: "grid", gap: 14 }} aria-label="Meeting room">
        <div className="video" style={{ minHeight: 420, position: "relative", overflow: "hidden", padding: 22 }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%, rgba(215,255,88,.10), transparent 42%)" }} />
          <div style={{ position: "relative", textAlign: "center", zIndex: 1 }}>
            <div aria-hidden="true" style={{ margin: "0 auto 18px", width: 112, height: 112, borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--surface-2)", border: "2px solid var(--accent)", fontSize: 32, fontWeight: 800 }}>MC</div>
            <span className="eyebrow">Mock host video</span><h2 style={{ fontSize: 30, margin: "8px 0" }}>{meeting.title}</h2>
            <p style={{ color: "var(--muted)" }}>{meeting.room} · {meeting.participants.length} participants</p>
            <span className={ended ? "status status--danger" : "status status--success"}>{ended ? "Meeting ended" : `Meeting live · ${formatDuration(elapsed)}`}</span>
          </div>
        </div>
        <div className="toolbar tp-meeting-controls" style={{ ...card, justifyContent: "center", margin: 0 }} role="toolbar" aria-label="Meeting controls">
          <button className="button" aria-pressed={!media.microphone} disabled={ended || busy !== null || !canManage} onClick={() => void toggleMedia("microphone")}>{media.microphone ? "Mute" : "Unmute"}</button>
          <button className="button" aria-pressed={!media.camera} disabled={ended || busy !== null || !canManage} onClick={() => void toggleMedia("camera")}>{media.camera ? "Camera off" : "Camera on"}</button>
          <button className="button" aria-pressed={media.screen} disabled={ended || busy !== null || !canManage} onClick={() => void toggleMedia("screen")}>{media.screen ? "Stop sharing" : "Share screen"}</button>
          {ended ? <button className="button button--primary" disabled={busy !== null || !canManage} onClick={() => void restartMeeting()}>{busy === "meeting" ? "Starting…" : "Start new meeting"}</button> : <button className="button button--danger" disabled={busy !== null || !canManage} onClick={() => void endMeeting()}>{busy === "meeting" ? "Leaving…" : "Leave meeting"}</button>}
        </div>
      </section>

      <aside style={{ display: "grid", gap: 14, alignContent: "start" }} aria-label="Participants">
        <section style={card}><div style={{ display: "flex", justifyContent: "space-between" }}><span className="eyebrow">Participants</span><span className="mono">{meeting.participants.length}</span></div>
          <div style={{ display: "grid", gap: 8, marginTop: 14 }}>{meeting.participants.map(person => <div className="participant" key={person.id} style={{ display: "flex", alignItems: "center", gap: 11, borderColor: person.isSpeaking ? "var(--accent)" : undefined }}>
            <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center", background: "#0b0f12", fontSize: 11 }}>{person.initials}</span>
            <span style={{ flex: 1 }}><strong style={{ display: "block", fontSize: 13 }}>{person.name}{person.isHost ? " · Host" : ""}</strong><small style={{ color: "var(--muted)" }}>{person.role}</small></span>
            <span className="mono" title={person.isMuted ? "Muted" : "Microphone on"} aria-label={person.isMuted ? "Muted" : "Microphone on"}>{person.isMuted ? "MUTED" : "MIC"}</span>
          </div>)}</div>
        </section>
        <section style={card}><span className="eyebrow">AI meeting assistant</span><p className={assistantActive ? "status status--success" : "status"} style={{ marginTop: 14 }}>{assistantActive ? "Listening for decisions" : "Assistant stopped"}</p>
          <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>Simulated output only. Connect OpenAI, Azure OpenAI, or another provider by replacing the service adapter.</p>
          <button className="button button--primary" disabled={ended || busy !== null || !canUseAi || !configuration.aiAssistant} onClick={() => void toggleAssistant()}>{busy === "assistant" ? "Updating…" : assistantActive ? "Stop assistant" : "Start assistant"}</button>
        </section>
      </aside>
    </div>

    <section style={card} aria-labelledby="insights-title"><div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16, flexWrap: "wrap" }}><div><span className="eyebrow">Simulated AI workspace</span><h2 id="insights-title" style={{ marginBottom: 5 }}>Meeting intelligence</h2><p style={{ color: "var(--muted)", marginTop: 0 }}>Generate structured output from the mock transcript.</p></div><div className="toolbar">
      <button className="button" disabled={busy !== null || !canUseAi || !configuration.aiAssistant} onClick={() => void generate("notes")}>{busy === "notes" ? "Generating…" : "Generate notes"}</button>
      <button className="button" disabled={busy !== null || !canUseAi || !configuration.aiAssistant} onClick={() => void generate("summary")}>{busy === "summary" ? "Generating…" : "Generate summary"}</button>
      <button className="button" disabled={busy !== null || !canUseAi || !configuration.aiAssistant || !configuration.actionItems} onClick={() => void generate("actions")}>{busy === "actions" ? "Extracting…" : "Extract action items"}</button>
      <button className="button" disabled={!insights.summary} onClick={() => void copyNotes()}>{copyStatus || "Copy notes"}</button>
    </div></div>
    {!insights.summary ? <div style={{ padding: "36px 0", textAlign: "center", color: "var(--muted)" }} aria-live="polite">No generated output yet. Choose an action above to run the mock assistant.</div> : <div className="tp-insights-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }} aria-live="polite">
      <article style={{ ...card, background: "var(--surface-2)" }}><span className="eyebrow">Key points</span><ul style={{ paddingLeft: 18, lineHeight: 1.65 }}>{insights.keyPoints.map(item => <li key={item}>{item}</li>)}</ul></article>
      <article style={{ ...card, background: "var(--surface-2)" }}><span className="eyebrow">Action items</span><ul style={{ paddingLeft: 18, lineHeight: 1.65 }}>{insights.actionItems.map(item => <li key={item}>{item}</li>)}</ul></article>
      <article style={{ ...card, background: "var(--surface-2)" }}><span className="eyebrow">Meeting summary</span><p style={{ lineHeight: 1.65 }}>{insights.summary}</p><small className="mono" style={{ color: "var(--muted)" }}>Last action: {selectedInsight}</small></article>
    </div>}
    </section>

    <section style={card} aria-labelledby="configuration-title"><span className="eyebrow">Meeting defaults</span><h2 id="configuration-title">Configuration</h2>
      <div className="tp-config-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 20 }}>
        <fieldset style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 12 }}><legend className="eyebrow" style={{ marginBottom: 12 }}>Assistant</legend>
          {([["aiAssistant", "AI assistant"], ["automaticNotes", "Automatic notes"], ["actionItems", "Action items"]] as const).map(([key, text]) => <label key={key} style={{ display: "flex", gap: 9 }}><input type="checkbox" checked={configuration[key]} onChange={event => setConfig(key, event.target.checked)} />{text}</label>)}
          <Select labelText="Language" value={configuration.language} options={["English", "French", "Spanish"]} onChange={value => setConfig("language", value)} />
          <Select labelText="Summary style" value={configuration.summaryStyle} options={["Concise", "Detailed", "Executive"]} onChange={value => setConfig("summaryStyle", value)} />
        </fieldset>
        <fieldset style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 12 }}><legend className="eyebrow" style={{ marginBottom: 12 }}>Media devices</legend>
          <Select labelText="Camera" value={configuration.camera} options={(devices?.cameras ?? []).map(item => item.id)} optionLabels={Object.fromEntries((devices?.cameras ?? []).map(item => [item.id, item.label]))} onChange={value => setConfig("camera", value)} />
          <Select labelText="Microphone" value={configuration.microphone} options={(devices?.microphones ?? []).map(item => item.id)} optionLabels={Object.fromEntries((devices?.microphones ?? []).map(item => [item.id, item.label]))} onChange={value => setConfig("microphone", value)} />
          <Select labelText="Speaker" value={configuration.speaker} options={(devices?.speakers ?? []).map(item => item.id)} optionLabels={Object.fromEntries((devices?.speakers ?? []).map(item => [item.id, item.label]))} onChange={value => setConfig("speaker", value)} />
          <Select labelText="Video quality" value={configuration.videoQuality} options={["720p", "1080p", "4K"]} onChange={value => setConfig("videoQuality", value)} />
        </fieldset>
        <fieldset style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 12 }}><legend className="eyebrow" style={{ marginBottom: 12 }}>Meeting policy</legend>
          <label style={{ display: "flex", gap: 9 }}><input type="checkbox" checked={configuration.recording} onChange={event => setConfig("recording", event.target.checked)} />Recording</label>
          <label style={{ display: "flex", gap: 9 }}><input type="checkbox" checked={configuration.waitingRoom} onChange={event => setConfig("waitingRoom", event.target.checked)} />Waiting room</label>
          <Select labelText="Participant permissions" value={configuration.participantPermissions} options={["Present and chat", "Chat only", "View only"]} onChange={value => setConfig("participantPermissions", value)} />
          <label style={label}>Meeting duration (minutes)<input className="field" type="number" min={15} max={240} value={configuration.meetingDuration} onChange={event => setConfig("meetingDuration", Number(event.target.value))} /></label>
        </fieldset>
      </div>
      <div style={{ marginTop: 20 }}><button className="button button--primary" disabled={!context.auth.hasPermission("meeting.configure")} onClick={saveConfiguration}>Save configuration</button></div>
    </section>
  </div>;
}

function Select({ labelText, value, options, optionLabels = {}, onChange }: { labelText: string; value: string; options: string[]; optionLabels?: Record<string, string>; onChange(value: string): void }) {
  return <label style={label}>{labelText}<select className="field" value={value} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option} value={option}>{optionLabels[option] ?? option}</option>)}</select></label>;
}
