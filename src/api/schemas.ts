import { z } from 'zod';

/**
 * Configuration for the TLDR API client
 */
export const TldvConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required')
});

export type TldvConfig = z.infer<typeof TldvConfigSchema>;

/**
 * Generic response wrapper for all API calls
 */
export const TldvResponseSchema = <T extends z.ZodType>(dataSchema: T) => dataSchema.nullable()

export type TldvResponse<T> = z.infer<ReturnType<typeof TldvResponseSchema<z.ZodType<T>>>>;

/**
 * User information schema
 */
export const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * Template information schema
 */
export const TemplateSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export type Template = z.infer<typeof TemplateSchema>;

/**
 * Meeting information schema
 */
export const MeetingSchema = z.object({
  id: z.string(),
  name: z.string(),
  happenedAt: z.string().datetime(),
  url: z.string().url(),
  organizer: UserSchema,
  invitees: z.array(UserSchema),
  template: TemplateSchema,
});

export type Meeting = z.infer<typeof MeetingSchema>;

/**
 * Sentence information schema for transcripts
 */
export const SentenceSchema = z.object({
  speaker: z.string(),
  text: z.string(),
  startTime: z.number().int().nonnegative(),
  endTime: z.number().int().nonnegative(),
});

export type Sentence = z.infer<typeof SentenceSchema>;

/**
 * Highlight topic information schema
 */
export const HighlightTopicSchema = z.object({
  title: z.string(),
  summary: z.string(),
});

export type HighlightTopic = z.infer<typeof HighlightTopicSchema>;

/**
 * Highlight information schema
 */
export const HighlightSchema = z.object({
  text: z.string(),
  startTime: z.number().int().nonnegative(),
  source: z.enum(['manual', 'auto']),
  topic: HighlightTopicSchema,
});

export type Highlight = z.infer<typeof HighlightSchema>;

/**
 * Transcript response schema
 */
export const GetTranscriptResponseSchema = z.object({
  id: z.string(),
  meetingId: z.string(),
  data: z.array(SentenceSchema),
});

export type GetTranscriptResponse = z.infer<typeof GetTranscriptResponseSchema>;

/**
 * Highlights response schema
 */
export const GetHighlightsResponseSchema = z.object({
  meetingId: z.string(),
  data: z.array(HighlightSchema),
});

export type GetHighlightsResponse = z.infer<typeof GetHighlightsResponseSchema>;

/**
 * Import meeting response schema
 */
export const ImportMeetingResponseSchema = z.object({
  success: z.boolean(),
  jobId: z.string(),
  message: z.string(),
});

export type ImportMeetingResponse = z.infer<typeof ImportMeetingResponseSchema>;

/**
 * Get meetings parameters schema
 */
export const GetMeetingsParamsSchema = z.object({
  query: z.string().optional(), // search query
  page: z.number().int().positive().optional(), // page number      
  limit: z.number().int().positive().optional().default(50), // number of results per page
  from: z.string().datetime().optional(), // start date
  to: z.string().datetime().optional(), // end date
  onlyParticipated: z.boolean().optional(), // only return meetings where the user participated

  // meeting type. internal is default. 
  // This is used to filter meetings by type. Type is determined by comparing the organizer's email with the invitees' emails. 
  // If the organizer's domain is different from at least one of the invitees' domains, the meeting is external.
  // Otherwise, the meeting is internal.  
  meetingType: z.enum(['internal', 'external']).optional(), 
});

export type GetMeetingsParams = z.infer<typeof GetMeetingsParamsSchema>;

/**
 * Get meetings response schema
 */
export const GetMeetingsResponseSchema = z.object({
  page: z.number().int().nonnegative(), // current page number
  pages: z.number().int().positive(), // total number of pages  
  total: z.number().int().nonnegative(), // total number of results
  pageSize: z.number().int().positive(), // number of results per page
  results: z.array(MeetingSchema), // array of meetings
});

export type GetMeetingsResponse = z.infer<typeof GetMeetingsResponseSchema>;

/**
 * Structured note segment schema
 */
export const StructuredNoteSchema = z.object({
  segmentId: z.string(),
  timestamp: z.number().optional(),
  text: z.string(),
  topicId: z.string().optional(),
});

export type StructuredNote = z.infer<typeof StructuredNoteSchema>;

/**
 * Note topic schema
 */
export const NoteTopicSchema = z.object({
  id: z.string(),
  order: z.number().optional(),
  title: z.string(),
  summary: z.string(),
});

export type NoteTopic = z.infer<typeof NoteTopicSchema>;

/**
 * Meeting notes response schema
 */
export const GetMeetingNotesResponseSchema = z.object({
  structuredNotes: z.array(StructuredNoteSchema).optional().default([]),
  topics: z.array(NoteTopicSchema).optional().default([]),
  markdownContent: z.string().optional(),
});

export type GetMeetingNotesResponse = z.infer<typeof GetMeetingNotesResponseSchema>;

/**
 * Health check response schema
 */
export const HealthResponseSchema = z.object({
  status: z.string(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

/**
 * Validation error schema
 */
export const ValidationErrorSchema = z.object({
  property: z.string(),
  constraints: z.record(z.string()),
});

export type ValidationError = z.infer<typeof ValidationErrorSchema>;

/**
 * Validation error response schema
 */
export const ValidationErrorResponseSchema = z.object({
  message: z.string(),
  error: z.array(
    z.object({
      message: z.string(),
      errors: z.array(ValidationErrorSchema),
    })
  ),
});

export type ValidationErrorResponse = z.infer<typeof ValidationErrorResponseSchema>;

/**
 * Basic error response schema
 */
export const BasicErrorResponseSchema = z.object({
  name: z.string(),
  message: z.string(),
});

export type BasicErrorResponse = z.infer<typeof BasicErrorResponseSchema>; 