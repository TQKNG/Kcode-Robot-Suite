"use client";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { EngagementAnalytics } from "../types";

export function AnalyticsDashboard({analytics}:{analytics:EngagementAnalytics}) {
  const metrics = [
    ["Game plays",analytics.totals.gamePlays.toLocaleString()],
    ["Daily active users",analytics.totals.dailyActiveUsers.toLocaleString()],
    ["Avg. session",`${analytics.totals.sessionDuration.toFixed(1)} min`],
    ["Completion rate",`${analytics.totals.completionRate}%`]
  ];
  return <>
    <section className="metrics" aria-label="Engagement metrics">{metrics.map(([label,value])=><article className="card metric" key={label}><span className="eyebrow">{label}</span><strong>{value}</strong></article>)}</section>
    <section className="grid">
      <article className="panel"><span className="eyebrow">Plays and active users</span><h2>Weekly activity</h2><Chart height={260}><LineChart data={[...analytics.daily]} margin={{top:12,right:12,left:-12,bottom:0}}><CartesianGrid stroke="#29323a" strokeDasharray="3 3"/><XAxis dataKey="day" stroke="#96a2aa"/><YAxis stroke="#96a2aa"/><Tooltip contentStyle={tooltipStyle}/><Legend/><Line type="monotone" dataKey="plays" stroke="var(--color-accent)" strokeWidth={2}/><Line type="monotone" dataKey="users" stroke="#7cb8ff" strokeWidth={2}/></LineChart></Chart></article>
      <article className="panel"><span className="eyebrow">Engagement by robot</span><h2>Sessions per unit</h2><Chart height={260}><BarChart data={[...analytics.byRobot]} margin={{top:12,right:12,left:-12,bottom:0}}><CartesianGrid stroke="#29323a" strokeDasharray="3 3"/><XAxis dataKey="robot" stroke="#96a2aa"/><YAxis stroke="#96a2aa"/><Tooltip contentStyle={tooltipStyle}/><Bar dataKey="sessions" fill="var(--color-accent)"/></BarChart></Chart></article>
      <article className="panel"><span className="eyebrow">Popular games</span><h2>Plays by title</h2><Chart height={280}><BarChart data={[...analytics.popularGames]} layout="vertical" margin={{top:8,right:12,left:22,bottom:0}}><CartesianGrid stroke="#29323a" strokeDasharray="3 3"/><XAxis type="number" stroke="#96a2aa"/><YAxis type="category" width={105} dataKey="name" stroke="#96a2aa" fontSize={11}/><Tooltip contentStyle={tooltipStyle}/><Bar dataKey="plays" fill="#7cb8ff"/></BarChart></Chart></article>
      <article className="panel"><span className="eyebrow">Session quality</span><h2>Duration and completion</h2><Chart height={280}><LineChart data={[...analytics.daily]} margin={{top:8,right:12,left:-12,bottom:0}}><CartesianGrid stroke="#29323a" strokeDasharray="3 3"/><XAxis dataKey="day" stroke="#96a2aa"/><YAxis yAxisId="left" stroke="#96a2aa"/><YAxis yAxisId="right" orientation="right" domain={[0,100]} stroke="#96a2aa"/><Tooltip contentStyle={tooltipStyle}/><Legend/><Line yAxisId="left" dataKey="duration" name="Duration (min)" stroke="#7cb8ff" strokeWidth={2}/><Line yAxisId="right" dataKey="completion" name="Completion %" stroke="#7ee081" strokeWidth={2}/></LineChart></Chart></article>
    </section>
  </>;
}

function Chart({height,children}:{height:number;children:React.ReactElement}) { return <div style={{width:"100%",height}}><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>; }
const tooltipStyle = {background:"#101519",border:"1px solid #29323a",color:"#f2f5f6"};
