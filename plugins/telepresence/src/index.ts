import type { KcodePlugin } from "@kcode/plugin-sdk";
import { TelepresenceEntry } from "./TelepresenceEntry";

export const telepresencePlugin: KcodePlugin = {
  id: "telepresence",
  name: "Talk To Me",
  version: "1.1.0",
  sdkVersion: "1.0.0",
  metadata: {
    id: "telepresence",
    name: "Talk To Me",
    description: "Mock video meetings with configurable AI notes, summaries, and action items.",
    category: "Communication",
    version: "1.1.0",
    status: "available",
    technologies: ["Mock meeting adapter", "AI provider adapter", "Meeting events"],
  },
  entry: TelepresenceEntry,
  permissions: [
    { id: "meeting.read", name: "View meetings", description: "View meetings and participants", category: "Telepresence" },
    { id: "meeting.manage", name: "Manage meetings", description: "Control meeting media and lifecycle", category: "Telepresence" },
    { id: "meeting.ai", name: "Use AI assistant", description: "Generate meeting insights", category: "Telepresence" },
    { id: "meeting.configure", name: "Configure meetings", description: "Change meeting defaults and permissions", category: "Telepresence" },
  ],
  settings: [
    { key: "ai.enabled", label: "AI assistant", type: "boolean", defaultValue: true },
    { key: "notes.automatic", label: "Automatic notes", type: "boolean", defaultValue: true },
    { key: "ai.actionItems", label: "Extract action items", type: "boolean", defaultValue: true },
    { key: "ai.language", label: "Language", type: "select", defaultValue: "English", options: ["English", "French", "Spanish"].map(value => ({ label: value, value })) },
    { key: "ai.summaryStyle", label: "Summary style", type: "select", defaultValue: "Concise", options: ["Concise", "Detailed", "Executive"].map(value => ({ label: value, value })) },
    { key: "media.videoQuality", label: "Video quality", type: "select", defaultValue: "1080p", options: ["720p", "1080p", "4K"].map(value => ({ label: value, value })) },
    { key: "meeting.waitingRoom", label: "Waiting room", type: "boolean", defaultValue: true },
    { key: "meeting.duration", label: "Meeting duration", type: "number", defaultValue: 45 },
  ],
};
