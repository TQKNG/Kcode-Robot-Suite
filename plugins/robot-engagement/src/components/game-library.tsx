"use client";
import type { Game, GameConfiguration } from "../types";

interface Props { games:readonly Game[]; selected:Game; saving:boolean; onSelect:(game:Game)=>void; onSave:(configuration:GameConfiguration)=>void; }
export function GameLibrary({games,selected,saving,onSelect,onSave}:Props) {
  return <section className="grid">
    <article className="panel" style={{overflowX:"auto"}}><span className="eyebrow">Game library</span><h2>Available content</h2><table><thead><tr><th>Game</th><th>Version</th><th>Status</th><th>Robots</th><th>Updated</th><th>Usage</th></tr></thead><tbody>{games.map(game=><tr key={game.id} onClick={()=>onSelect(game)} style={{cursor:"pointer",background:game.id===selected.id?"var(--surface-2)":undefined}} aria-selected={game.id===selected.id}><td><strong>{game.name}</strong><div style={{color:"var(--muted)",marginTop:4,maxWidth:260}}>{game.description}</div></td><td className="mono">{game.version}</td><td><span className={`status ${game.status==="active"?"status--success":game.status==="draft"?"status--warning":""}`}>{game.status}</span></td><td className="mono">{game.supportedRobots.join(", ")}</td><td>{game.lastUpdated}</td><td>{game.usage.toLocaleString()}</td></tr>)}</tbody></table></article>
    <GameEditor key={selected.id} game={selected} saving={saving} onSave={onSave}/>
  </section>;
}

function GameEditor({game,saving,onSave}:{game:Game;saving:boolean;onSave:(configuration:GameConfiguration)=>void}) {
  const submit = (formData:FormData) => onSave({difficulty:String(formData.get("difficulty")) as GameConfiguration["difficulty"],durationMinutes:Number(formData.get("duration")),soundEnabled:formData.get("sound") === "on",instructions:String(formData.get("instructions"))});
  return <article className="panel"><span className="eyebrow">Game editor</span><h2>{game.name}</h2><p style={{color:"var(--muted)"}}>{game.description}</p><form action={submit}><Field label="Difficulty"><select className="field" name="difficulty" defaultValue={game.configuration.difficulty}><option>easy</option><option>medium</option><option>hard</option></select></Field><Field label="Play length (minutes)"><input className="field" name="duration" type="number" min="1" max="60" defaultValue={game.configuration.durationMinutes} required/></Field><Field label="Player instructions"><textarea className="field" name="instructions" rows={4} defaultValue={game.configuration.instructions} required/></Field><label style={{display:"flex",gap:8,margin:"14px 0"}}><input name="sound" type="checkbox" defaultChecked={game.configuration.soundEnabled}/> Sound effects enabled</label><button className="button button--primary" type="submit" disabled={saving}>{saving?"Saving…":"Save configuration"}</button></form></article>;
}

function Field({label,children}:{label:string;children:React.ReactNode}) { return <label style={{display:"block",marginTop:14}}><span style={{display:"block",marginBottom:7,color:"var(--muted)",fontSize:13}}>{label}</span>{children}</label>; }
