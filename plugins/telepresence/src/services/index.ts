export * from "./meeting.service";
export * from "./ai-assistant.service";
import { MockMeetingService } from "./meeting.service";
import { MockAiAssistantService } from "./ai-assistant.service";

export const meetingService = new MockMeetingService();
export const aiAssistantService = new MockAiAssistantService();
