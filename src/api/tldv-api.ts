import {
  GetHighlightsResponse,
  GetMeetingNotesResponse,
  GetMeetingsParams,
  GetMeetingsParamsSchema,
  GetMeetingsResponse,
  GetTranscriptResponse,
  HealthResponse,
  Meeting,
  TldvConfig,
  TldvConfigSchema,
} from './schemas';

import { TldvResponse } from './types';
import { Logger, logger as defaultLogger } from '../logger';
import axios from 'axios';

const BASE_URL = 'https://pasta.tldv.io/v1alpha1';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1_000; 
const MAX_RETRY_DELAY = 2_000;

/**
 * TLDV API Client
 * 
 * This class provides a type-safe interface to interact with the TLDV API.
 * It handles authentication, request formatting, and response validation.
 * 
 * @example
 * ```typescript
 * const api = new TldvApi({
 *   apiKey: 'your-api-key'
 * });
 * 
 * ```typescript
 * const meeting = await tldvApi.getMeeting(id);
 * ```
 */
export class TldvApi {
  private apiKey: string;
  private baseUrl: string;
  private headers: any;
  private logger: Logger;

  /**
   * Creates a new instance of the TLDV API client
   * @param config - Configuration object containing API key and optional base URL
   * @param logger - Optional logger instance for dependency injection (defaults to singleton)
   * @throws {Error} If the configuration is invalid
   */
  constructor(config: TldvConfig, logger: Logger = defaultLogger) {
    const validatedConfig = TldvConfigSchema.parse(config);
    this.apiKey = validatedConfig.apiKey;
    this.baseUrl = BASE_URL;
    this.headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
    this.logger = logger;
  }

  /**
   * Makes a request to the TLDV API
   * @param endpoint - The API endpoint to call
   * @param options - Request options including method, body, etc.
   * @returns A promise that resolves to the validated API response
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0,
    maxRetries = MAX_RETRIES
  ): Promise<TldvResponse<T>> {
    this.logger.debug(`API Request: ${endpoint}`, { retryCount });
    
    try {
      const response = await axios(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.headers,
        },
      });

      if (response.status > 200) {
        throw new Error(response.data.message || 'API request failed');
      }

      // Ensure the response is properly formatted
      const responseData = response.data;
      
      // If the response is already in the expected format, return it
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return responseData as TldvResponse<T>;
      }
      
      // Otherwise, wrap it in the expected format
      return {
        data: responseData as T,
        error: undefined,
      };
    } catch (error) {
      // Determine if we should retry based on the error
      const shouldRetry = 
        retryCount < maxRetries && 
        (
          // Network errors
          (error instanceof Error && error.message.includes('Network Error')) ||
          // 5xx server errors
          (axios.isAxiosError(error) && error.response && error.response.status >= 500) ||
          // Rate limiting
          (axios.isAxiosError(error) && error.response && error.response.status === 429)
        );
      
      if (shouldRetry) {
        // Calculate exponential backoff delay: 2^retryCount * 1000ms (1s, 2s, 4s, etc.)
        const delay = Math.min(RETRY_DELAY * 2 ** retryCount, MAX_RETRY_DELAY);
        
        this.logger.warn(`Retrying request to ${endpoint}`, { retryCount: retryCount + 1, delay });
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the request
        return this.request<T>(endpoint, options, retryCount + 1, maxRetries);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`API request failed: ${endpoint}`, { error: errorMessage });
      
      return {
        data: null as T,
        error: errorMessage,
      };
    }
  }


  /**
   * Retrieves a meeting by its ID
   * 
   * @param meetingId - The unique identifier of the meeting
   * @returns A promise that resolves to the meeting details
   * 
   * @example
   * ```typescript
   * const meeting = await api.getMeeting('meeting-123');
   * ```
   */
  async getMeeting(meetingId: string): Promise<TldvResponse<Meeting>> {
    return this.request<Meeting>(`/meetings/${meetingId}`);
  }

  /**
   * Retrieves a list of meetings with optional filtering
   * 
   * @param params - Optional parameters for filtering and pagination
   * @returns A promise that resolves to the paginated list of meetings
   * 
   * @example
   * ```typescript
   * const meetings = await api.getMeetings({
   *   query: 'team sync',
   *   page: 1,
   *   limit: 10,
   *   from: '2024-01-01T00:00:00Z',
   *   to: '2024-12-31T23:59:59Z',
   *   onlyParticipated: true,
   *   meetingType: 'internal'
   * });
   * ```
   */
  async getMeetings(params: GetMeetingsParams = {}): Promise<TldvResponse<GetMeetingsResponse>> {
    const validatedParams = GetMeetingsParamsSchema.parse(params);
    const queryParams = new URLSearchParams();
    
    if (validatedParams.query) queryParams.append('query', validatedParams.query);
    if (validatedParams.page) queryParams.append('page', validatedParams.page.toString());
    if (validatedParams.limit) queryParams.append('limit', validatedParams.limit.toString());
    if (validatedParams.from) queryParams.append('from', validatedParams.from);
    if (validatedParams.to) queryParams.append('to', validatedParams.to);
    if (validatedParams.onlyParticipated !== undefined) queryParams.append('onlyParticipated', validatedParams.onlyParticipated.toString());
    if (validatedParams.meetingType) queryParams.append('meetingType', validatedParams.meetingType);

    return this.request<GetMeetingsResponse>(`/meetings?${queryParams}`);
  }

  /**
   * Retrieves the transcript for a specific meeting
   * 
   * @param meetingId - The unique identifier of the meeting
   * @returns A promise that resolves to the meeting transcript
   * 
   * @example
   * ```typescript
   * const transcript = await api.getTranscript('meeting-123');
   * ```
   */
  async getTranscript(meetingId: string): Promise<TldvResponse<GetTranscriptResponse>> {
    return this.request<GetTranscriptResponse>(`/meetings/${meetingId}/transcript`);
  }

  /**
   * Retrieves the highlights for a specific meeting
   * 
   * @param meetingId - The unique identifier of the meeting
   * @returns A promise that resolves to the meeting highlights
   * 
   * @example
   * ```typescript
   * const highlights = await api.getHighlights('meeting-123');
   * ```
   */
  async getHighlights(meetingId: string): Promise<TldvResponse<GetHighlightsResponse>> {
    return this.request<GetHighlightsResponse>(`/meetings/${meetingId}/highlights`);
  }

  /**
   * Retrieves AI-generated notes for a specific meeting
   *
   * @param meetingId - The unique identifier of the meeting
   * @returns A promise that resolves to the meeting notes
   */
  async getMeetingNotes(meetingId: string): Promise<TldvResponse<GetMeetingNotesResponse>> {
    return this.request<GetMeetingNotesResponse>(`/meetings/${meetingId}/notes`);
  }

  /**
   * Checks the health status of the API
   * 
   * @returns A promise that resolves to the health status
   * 
   * @example
   * ```typescript
   * const health = await api.healthCheck();
   * ```
   */
  async healthCheck(): Promise<TldvResponse<HealthResponse>> {
    return this.request<HealthResponse>('/health');
  }
} 
