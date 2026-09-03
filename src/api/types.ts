export interface TldvConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface TldvResponse<T> {
  data: T;
  error?: string;
}

export interface User {
  name: string;
  email: string;
}

export interface Template {
  id: string;
  label: string;
}

export interface Meeting {
  id: string;
  name: string;
  happenedAt: string;
  url: string;
  organizer: User;
  invitees: User[];
  template: Template;
}

export interface Sentence {
  speaker: string;
  text: string;
  startTime: number;
  endTime: number;
}

export interface HighlightTopic {
  title: string;
  summary: string;
}

export interface Highlight {
  text: string;
  startTime: number;
  source: 'manual' | 'auto';
  topic: HighlightTopic;
}

export interface GetTranscriptResponse {
  id: string;
  meetingId: string;
  data: Sentence[];
}

export interface GetHighlightsResponse {
  meetingId: string;
  data: Highlight[];
}

export interface GetRecordingDownloadUrlResponse {
  meetingId: string;
  downloadUrl: string;
  expiresAt?: string;
}

export interface ImportMeetingParams {
  name: string;
  url: string;
  happenedAt?: string;
  dryRun?: boolean;
}

export interface ImportMeetingResponse {
  success: boolean;
  jobId: string;
  message: string;
}

export interface GetMeetingsParams {
  query?: string;
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  onlyParticipated?: boolean;
  meetingType?: 'internal' | 'external';
}

export interface GetMeetingsResponse {
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  results: Meeting[];
}

export interface HealthResponse {
  status: string;
}

export interface ValidationError {
  property: string;
  constraints: Record<string, string>;
}

export interface ValidationErrorResponse {
  message: string;
  error: {
    message: string;
    errors: ValidationError[];
  }[];
}

export interface BasicErrorResponse {
  name: string;
  message: string;
} 