export type InsightKind = "notes" | "summary" | "actions";
export type MeetingInsights = { keyPoints: string[]; actionItems: string[]; summary: string };
export type InsightOptions = { language: string; summaryStyle: string };

export interface AiAssistantService {
  readonly providerName: string;
  start(meetingId: string): Promise<void>;
  stop(meetingId: string): Promise<void>;
  generate(meetingId: string, kind: InsightKind, options: InsightOptions): Promise<MeetingInsights>;
}

const delay = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));
const baseInsights: MeetingInsights = {
  keyPoints: [
    "Guest-services pilot begins after Thursday's readiness review.",
    "Lobby-to-room routing needs one final accessibility validation.",
    "Charging-station telemetry will be monitored during the pilot.",
  ],
  actionItems: [
    "Maya — review the deployment checklist by Thursday.",
    "Omar — confirm charging-station telemetry before launch.",
    "Alex — validate the Lobby → Room 101 route.",
  ],
  summary: "The team aligned on the guest-services pilot, reviewed robot routing changes, and scheduled a Thursday readiness review. Owners were assigned for deployment, telemetry, and route validation.",
};

export class MockAiAssistantService implements AiAssistantService {
  readonly providerName = "Kcode simulated AI";
  async start(_meetingId: string): Promise<void> { await delay(240); }
  async stop(_meetingId: string): Promise<void> { await delay(160); }
  async generate(_meetingId: string, _kind: InsightKind, options: InsightOptions): Promise<MeetingInsights> {
    await delay(650);
    return { ...baseInsights, summary: `${baseInsights.summary} (${options.summaryStyle} style · ${options.language})` };
  }
}
