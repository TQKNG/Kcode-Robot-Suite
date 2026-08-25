import Link from "next/link";
import { redirect } from "next/navigation";
import { ShellHeader } from "../../components/shell-header";
import { signedIn } from "../../lib/auth";
import { getPluginCatalog } from "../../lib/plugin-catalog";

export default async function Launcher() {
  if (!await signedIn()) redirect("/login");
  const launchablePlugins = getPluginCatalog();

  return (
    <main className="shell">
      <ShellHeader />
      <div className="main">
        <section className="hero">
          <div>
            <p className="eyebrow">Microkernel / Plugin platform</p>
            <h1>Build. Observe.<br />Operate.</h1>
          </div>
          <p>Independently packaged applications sharing one secure shell, design language, and platform contract.</p>
        </section>
        {launchablePlugins.length > 0 ? (
          <section className="grid" aria-label="Available demos">
            {launchablePlugins.map((plugin, index) => (
              <article className="card plugin-card" key={plugin.id}>
                <div>
                  <span className="eyebrow">{String(index + 1).padStart(2, "0")} / {plugin.metadata.category}</span>
                  <h2>{plugin.metadata.name}</h2>
                  <p className="muted-copy">{plugin.metadata.description}</p>
                </div>
                <div>
                  <div className="tags">
                    {plugin.metadata.technologies.map((technology) => <span className="tag" key={technology}>{technology}</span>)}
                  </div>
                  <div className="toolbar card-actions">
                    <span className={`status status--${plugin.metadata.status === "available" ? "success" : "warning"}`}>{plugin.metadata.status}</span>
                    {plugin.entry ? (
                      <Link className="button button--primary" href={`/demo/${plugin.id}`} target="_blank" rel="noopener noreferrer">Open demo ↗</Link>
                    ) : <span className="button button--disabled">Coming soon</span>}
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="card empty-state">
            <p className="eyebrow">No plugins registered</p>
            <h2>The launcher is ready.</h2>
            <p>Add a valid plugin manifest to make a demo available here.</p>
          </section>
        )}
      </div>
    </main>
  );
}
