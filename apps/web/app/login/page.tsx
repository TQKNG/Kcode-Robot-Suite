import { login } from "./actions";
import Image from "next/image";
import { redirect } from "next/navigation";
import { signedIn } from "../../lib/auth";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await signedIn()) redirect("/launcher");
  const query = await searchParams;

  return <main className="login"><form className="card login-card" action={login}><div className="brand"><Image className="brand-logo brand-logo--login" src="/brand/logo-v3.webp" alt="" width={1024} height={1024} priority />KCODE</div><p className="eyebrow" style={{marginTop:32}}>Platform access</p><h1>Enter the sandbox</h1><p style={{color:'var(--muted)'}}>Use the demo account supplied for this environment.</p>{query.error&&<p className="error" role="alert">Invalid username or password.</p>}<label htmlFor="username">Username</label><input className="field" id="username" name="username" required autoComplete="username" autoFocus/><label htmlFor="password">Password</label><input className="field" id="password" name="password" type="password" required autoComplete="current-password"/><label className="checkbox-row"><input type="checkbox" name="remember"/> Remember me for 7 days</label><button className="button button--primary login-submit">Sign in</button></form></main>;
}
