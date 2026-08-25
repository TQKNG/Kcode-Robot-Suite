import Link from "next/link";

export default function NotFound() {
  return <main className="login"><div className="card login-card empty-state"><p className="eyebrow">404 / Not found</p><h1>This page is not registered.</h1><p>It may have moved, or the requested plugin is unavailable.</p><Link className="button button--primary" href="/launcher">Return to launcher</Link></div></main>;
}
