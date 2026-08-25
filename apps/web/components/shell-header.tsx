import Link from "next/link";
import { logout } from "../app/login/actions";

export function ShellHeader({ backToLauncher = false }: { backToLauncher?: boolean }) {
  return <header className="topbar"><Link className="brand brand-link" href="/launcher" aria-label="Kcode Demo Sandbox home"><span className="mark">K</span><span>KCODE</span><span className="mono brand-product">DEMO SANDBOX</span></Link><nav className="topbar-actions" aria-label="Platform navigation">{backToLauncher && <Link className="button" href="/launcher">← <span className="hide-mobile">Launcher</span></Link>}<form action={logout}><button className="button" type="submit">Log out</button></form></nav></header>;
}
