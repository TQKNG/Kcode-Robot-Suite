"use client";

import { useEffect } from "react";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="login"><div className="card login-card empty-state"><p className="eyebrow">Application error</p><h1>The sandbox hit an unexpected problem.</h1><p>Your session is still available. Retry the current page or return to the launcher.</p><div className="toolbar"><button className="button button--primary" onClick={reset}>Try again</button><a className="button" href="/launcher">Launcher</a></div></div></main>;
}
