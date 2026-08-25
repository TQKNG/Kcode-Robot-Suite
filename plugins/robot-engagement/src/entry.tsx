"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PluginEntryProps } from "@kcode/plugin-sdk";
import { AnalyticsDashboard } from "./components/analytics-dashboard";
import { DeploymentPanel } from "./components/deployment-panel";
import { GameLibrary } from "./components/game-library";
import { RobotConfiguration } from "./components/robot-configuration";
import { MockAnalyticsService } from "./services/analytics.service";
import { MockDeploymentService } from "./services/deployment.service";
import { MockGameService } from "./services/game.service";
import { MockRobotService } from "./services/robot.service";
import type { DeploymentProgress, DeploymentRequest, EngagementAnalytics, EngagementRobot, Game, GameConfiguration } from "./types";

const gameService = new MockGameService();
const robotService = new MockRobotService();
const analyticsService = new MockAnalyticsService();
const deploymentService = new MockDeploymentService();
type View = "dashboard"|"library"|"deployment"|"robots"|"settings";

export function RobotEngagementEntry({context}:PluginEntryProps) {
  const [view,setView]=useState<View>("dashboard");
  const [games,setGames]=useState<readonly Game[]>([]);
  const [robots,setRobots]=useState<readonly EngagementRobot[]>([]);
  const [analytics,setAnalytics]=useState<EngagementAnalytics|null>(null);
  const [selectedGameId,setSelectedGameId]=useState("");
  const [selectedRobotId,setSelectedRobotId]=useState("");
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [saving,setSaving]=useState(false);
  const [deploying,setDeploying]=useState(false);
  const [progress,setProgress]=useState<DeploymentProgress|null>(null);

  const load=useCallback(async()=>{setLoading(true);setError(null);try{const [nextGames,nextRobots,nextAnalytics]=await Promise.all([gameService.list(),robotService.list(),analyticsService.getOverview()]);setGames(nextGames);setRobots(nextRobots);setAnalytics(nextAnalytics);setSelectedGameId(current=>current||nextGames[0]?.id||"");setSelectedRobotId(current=>current||nextRobots[0]?.id||"");context.logger.info("Kcode Engage data loaded",{games:nextGames.length,robots:nextRobots.length});}catch(cause){context.logger.error("Kcode Engage failed to load",cause);setError("Engagement data is temporarily unavailable. Please retry.");}finally{setLoading(false);}},[context.logger]);
  useEffect(()=>{void load();},[load]);

  const selectedGame=useMemo(()=>games.find(game=>game.id===selectedGameId)??games[0],[games,selectedGameId]);
  const selectedRobot=useMemo(()=>robots.find(robot=>robot.id===selectedRobotId)??robots[0],[robots,selectedRobotId]);
  const saveGame=async(configuration:GameConfiguration)=>{if(!selectedGame)return;setSaving(true);setError(null);try{const updated=await gameService.updateConfiguration(selectedGame.id,configuration);setGames(items=>items.map(item=>item.id===updated.id?updated:item));context.notifications.notify({level:"success",title:"Game configuration saved",message:`${updated.name} is ready for deployment.`});}catch(cause){context.logger.error("Game configuration save failed",cause);setError("The game configuration could not be saved.");}finally{setSaving(false);}};
  const saveRobot=async(robot:EngagementRobot)=>{setSaving(true);setError(null);try{const updated=await robotService.update(robot);setRobots(items=>items.map(item=>item.id===updated.id?updated:item));context.notifications.notify({level:"success",title:"Robot settings saved",message:`${updated.id} was updated.`});}catch(cause){context.logger.error("Robot configuration save failed",cause);setError("The robot configuration could not be saved.");}finally{setSaving(false);}};
  const deploy=async(request:DeploymentRequest)=>{setDeploying(true);setProgress(null);setError(null);try{await context.events.emit("game.deployment.started",{deploymentId:`pending-${Date.now()}`,gameId:request.gameId,robotId:request.robotId,scheduledFor:request.scheduledFor||null});context.logger.info("Game deployment started",{gameId:request.gameId,robotId:request.robotId});const completed=await deploymentService.deploy(request,setProgress);await context.events.emit("game.deployment.completed",{deploymentId:completed.deploymentId,gameId:request.gameId,robotId:request.robotId});context.notifications.notify({level:"success",title:"Deployment complete",message:`${selectedGame?.name??"Game"} is installed on ${request.robotId}.`});}catch(cause){context.logger.error("Game deployment failed",cause);setError(cause instanceof Error?cause.message:"Deployment failed. Please retry.");}finally{setDeploying(false);}};

  if(loading)return <StatePanel title="Loading Kcode Engage" message="Retrieving game catalog, robots, and analytics…" busy/>;
  if(error&&games.length===0)return <StatePanel title="Unable to load Kcode Engage" message={error} action={<button className="button button--primary" onClick={()=>void load()}>Retry</button>}/>;
  if(games.length===0||robots.length===0||!analytics)return <StatePanel title="No engagement data" message="Add at least one game and one robot to begin."/>;

  return <div className="plugin-layout">
    <nav className="toolbar" aria-label="Kcode Engage sections">{(["dashboard","library","deployment","robots","settings"] as const).map(item=><button key={item} className={`button ${view===item?"button--primary":""}`} onClick={()=>setView(item)} aria-current={view===item?"page":undefined}>{item[0].toUpperCase()+item.slice(1)}</button>)}</nav>
    {error&&<div className="panel" role="alert" style={{borderColor:"var(--danger)"}}><span className="error">{error}</span><button className="button" style={{marginLeft:12}} onClick={()=>setError(null)}>Dismiss</button></div>}
    {view==="dashboard"&&<AnalyticsDashboard analytics={analytics}/>} 
    {view==="library"&&selectedGame&&<GameLibrary games={games} selected={selectedGame} saving={saving} onSelect={game=>setSelectedGameId(game.id)} onSave={configuration=>void saveGame(configuration)}/>} 
    {view==="deployment"&&selectedGame&&<DeploymentPanel games={games} robots={robots} selectedGame={selectedGame} progress={progress} deploying={deploying} canDeploy={context.auth.hasPermission("game.deploy")} onGameChange={game=>setSelectedGameId(game.id)} onDeploy={request=>void deploy(request)}/>} 
    {view==="robots"&&selectedRobot&&<RobotConfiguration robots={robots} selected={selectedRobot} saving={saving} onSelect={robot=>setSelectedRobotId(robot.id)} onSave={robot=>void saveRobot(robot)}/>} 
    {view==="settings"&&<PlatformSettings context={context}/>} 
  </div>;
}

function PlatformSettings({context}:{context:PluginEntryProps["context"]}) {
  const [saved,setSaved]=useState(false);
  const submit=(formData:FormData)=>{context.configuration.set("defaultLanguage",String(formData.get("language")));context.configuration.set("defaultPlayLength",Number(formData.get("length")));context.configuration.set("soundEffects",formData.get("sound")==="on");setSaved(true);context.notifications.notify({level:"success",title:"Engagement defaults saved"});};
  return <section className="grid"><article className="panel"><span className="eyebrow">Plugin settings</span><h2>Engagement defaults</h2><form action={submit}><label style={labelStyle}>Default language<select className="field" name="language" defaultValue={context.configuration.get<string>("defaultLanguage")??"English"}><option>English</option><option>French</option><option>Spanish</option><option>German</option></select></label><label style={labelStyle}>Default play length<input className="field" name="length" type="number" min="1" max="60" defaultValue={context.configuration.get<number>("defaultPlayLength")??8}/></label><label style={{display:"flex",gap:8,margin:"14px 0"}}><input name="sound" type="checkbox" defaultChecked={context.configuration.get<boolean>("soundEffects")??true}/> Sound effects enabled</label><button className="button button--primary">Save defaults</button>{saved&&<span className="notice" style={{marginLeft:12}}>Saved</span>}</form></article><article className="panel"><span className="eyebrow">Access</span><h2>Plugin permissions</h2>{[["game.read","View games and analytics"],["game.manage","Edit game and robot configuration"],["game.deploy","Deploy games to robots"]].map(([id,description])=><div className="card" style={{padding:14,marginBottom:8}} key={id}><span className="mono">{id}</span><span className={`status ${context.auth.hasPermission(id)?"status--success":"status--danger"}`} style={{float:"right"}}>{context.auth.hasPermission(id)?"granted":"denied"}</span><p style={{color:"var(--muted)",marginBottom:0}}>{description}</p></div>)}</article></section>;
}

function StatePanel({title,message,busy=false,action}:{title:string;message:string;busy?:boolean;action?:React.ReactNode}) { return <section className="panel" role={busy?"status":"alert"} aria-live="polite"><span className="eyebrow">{busy?"Loading":"System state"}</span><h2>{title}</h2><p style={{color:"var(--muted)"}}>{message}</p>{busy&&<div style={{height:3,width:"100%",background:"var(--surface-2)",overflow:"hidden"}}><div style={{height:"100%",width:"45%",background:"var(--accent)"}}/></div>}{action}</section>; }
const labelStyle={display:"block",marginTop:14,color:"var(--muted)",fontSize:13} as const;
