import Link from "next/link";
import Image from "next/image";
import { logout } from "../app/login/actions";

export function ShellHeader({ backToLauncher = false }: { backToLauncher?: boolean }) {
  return <header className="topbar"><Link className="brand brand-link" href="/launcher" aria-label="Kcode Robot Suite"><Image className="brand-logo" src="/brand/logo-v3.webp" alt="" width={1024} height={1024} priority /><span>KCODE</span><span className="mono brand-product">ROBOT SUITE</span></Link><nav className="topbar-actions" aria-label="Platform navigation">{backToLauncher && <Link className="button" href="/launcher">← <span className="hide-mobile">Launcher</span></Link>}<form action={logout}><button className="button" type="submit">Log out</button></form></nav></header>;
}
