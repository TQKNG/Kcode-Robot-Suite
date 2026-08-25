import { notFound, redirect } from "next/navigation";
import { PlatformProvider } from "../../../components/platform-provider";
import { PluginRuntime } from "../../../components/plugin-runtime";
import { ShellHeader } from "../../../components/shell-header";
import { signedIn } from "../../../lib/auth";
import { getPlugin } from "../../../lib/plugin-catalog";

export default async function PluginPage({ params }: { params: Promise<{ pluginId: string }> }) {
  if (!await signedIn()) redirect("/login");
  const { pluginId } = await params;
  const plugin = getPlugin(pluginId);
  if (!plugin?.entry) notFound();

  return <main className="shell"><ShellHeader backToLauncher /><div className="main"><section className="plugin-header"><span className="eyebrow">{plugin.metadata.category} / {plugin.version}</span><h1>{plugin.metadata.name}</h1><p className="muted-copy">{plugin.metadata.description}</p></section><PlatformProvider><PluginRuntime pluginId={pluginId} /></PlatformProvider></div></main>;
}
