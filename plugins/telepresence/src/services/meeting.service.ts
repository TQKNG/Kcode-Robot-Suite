export type MediaDevice = { id: string; label: string };
export type Participant = {
  id: string;
  name: string;
  role: string;
  initials: string;
  isHost: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  videoEnabled: boolean;
};
export type Meeting = {
  id: string;
  title: string;
  room: string;
  startedAt: string;
  status: "live" | "ended";
  participants: Participant[];
};
export type MeetingDevices = { cameras: MediaDevice[]; microphones: MediaDevice[]; speakers: MediaDevice[] };

export interface MeetingService {
  getActiveMeeting(): Promise<Meeting>;
  getDevices(): Promise<MeetingDevices>;
  setMedia(meetingId: string, media: { microphone: boolean; camera: boolean; screen: boolean }): Promise<void>;
  endMeeting(meetingId: string): Promise<void>;
  restartMeeting(meetingId: string): Promise<Meeting>;
}

const participants: Participant[] = [
  { id: "maya", name: "Maya Chen", role: "Host", initials: "MC", isHost: true, isMuted: false, isSpeaking: true, videoEnabled: true },
  { id: "omar", name: "Omar Reid", role: "Robotics", initials: "OR", isHost: false, isMuted: true, isSpeaking: false, videoEnabled: true },
  { id: "alex", name: "Alex Park", role: "Operations", initials: "AP", isHost: false, isMuted: false, isSpeaking: false, videoEnabled: true },
  { id: "guest", name: "Guest Services", role: "Pilot team", initials: "GS", isHost: false, isMuted: true, isSpeaking: false, videoEnabled: false },
];

const delay = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));

export class MockMeetingService implements MeetingService {
  private ended = false;
  async getActiveMeeting(): Promise<Meeting> {
    await delay(350);
    return { id: "meeting-guest-pilot", title: "Guest Services Pilot", room: "Kcode Demo Room", startedAt: new Date(Date.now() - 268_000).toISOString(), status: this.ended ? "ended" : "live", participants };
  }
  async getDevices(): Promise<MeetingDevices> {
    await delay(100);
    return {
      cameras: [{ id: "camera-1", label: "Integrated HD Camera" }, { id: "camera-2", label: "Conference Camera" }],
      microphones: [{ id: "mic-1", label: "Conference Microphone" }, { id: "mic-2", label: "Headset Microphone" }],
      speakers: [{ id: "speaker-1", label: "Room Speakers" }, { id: "speaker-2", label: "Headset" }],
    };
  }
  async setMedia(_meetingId: string, _media: { microphone: boolean; camera: boolean; screen: boolean }): Promise<void> { await delay(120); }
  async endMeeting(_meetingId: string): Promise<void> { await delay(220); this.ended = true; }
  async restartMeeting(_meetingId: string): Promise<Meeting> { this.ended = false; return this.getActiveMeeting(); }
}
