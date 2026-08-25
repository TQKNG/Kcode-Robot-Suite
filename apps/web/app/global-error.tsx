"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body><main className="login"><div className="card login-card"><p className="eyebrow">Critical error</p><h1>The application shell could not load.</h1><button className="button button--primary" onClick={reset}>Reload shell</button></div></main></body></html>;
}
