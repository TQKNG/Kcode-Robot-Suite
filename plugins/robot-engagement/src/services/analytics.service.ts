import { mockAnalytics } from "../data/mock-data";
import type { EngagementAnalytics } from "../types";

export interface AnalyticsService { getOverview(): Promise<EngagementAnalytics>; }
export class MockAnalyticsService implements AnalyticsService {
  async getOverview(): Promise<EngagementAnalytics> {
    await new Promise<void>(resolve => setTimeout(resolve, 280));
    return mockAnalytics;
  }
}
