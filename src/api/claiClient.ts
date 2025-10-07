import { z } from 'zod';
import { fetchJson } from '../lib/api-client';

const CLAI_API = import.meta.env.VITE_CLAI_API_URL || 'http://localhost:3500';

export const SessionSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  display_name: z.string().nullable(),
  role: z.string().nullable(),
  model: z.string().nullable(),
});

export const SessionListSchema = z.array(SessionSchema);

export const CreateSessionSchema = z.object({
  name: z.string(),
  display_name: z.string().optional(),
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1),
});

export const ChatResponseSchema = z.object({
  response: z.string(),
});

export const SetRoleSchema = z.object({
  role: z.string().nullable(),
});

export const SetModelSchema = z.object({
  model: z.string(),
});

export const ClaudeModelSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  created_at: z.string(),
});

export const ModelsResponseSchema = z.object({
  data: z.array(ClaudeModelSchema),
});

export type Session = z.infer<typeof SessionSchema>;
export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type ClaudeModel = z.infer<typeof ClaudeModelSchema>;

export const claiApi = {
  getSessions: async (): Promise<Session[]> => {
    return fetchJson(`${CLAI_API}/sessions`, SessionListSchema);
  },

  getSession: async (id: number): Promise<Session> => {
    return fetchJson(`${CLAI_API}/sessions/${id}`, SessionSchema);
  },

  createSession: async (session: CreateSessionDto): Promise<Session> => {
    return fetchJson(`${CLAI_API}/sessions`, SessionSchema, {
      method: 'POST',
      body: JSON.stringify(session),
    });
  },

  deleteSession: async (id: number): Promise<void> => {
    return fetchJson(`${CLAI_API}/sessions/${id}`, z.void(), {
      method: 'DELETE',
    });
  },

  sendMessage: async (
    sessionId: number,
    message: string
  ): Promise<ChatResponse> => {
    return fetchJson(
      `${CLAI_API}/sessions/${sessionId}/chat`,
      ChatResponseSchema,
      {
        method: 'POST',
        body: JSON.stringify({ message }),
      }
    );
  },

  setRole: async (sessionId: number, role: string | null): Promise<void> => {
    return fetchJson(`${CLAI_API}/sessions/${sessionId}/role`, z.void(), {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  getModels: async (): Promise<ClaudeModel[]> => {
    const response = await fetchJson(
      `${CLAI_API}/models`,
      ModelsResponseSchema
    );
    return response.data;
  },

  setModel: async (sessionId: number, model: string): Promise<void> => {
    return fetchJson(`${CLAI_API}/sessions/${sessionId}/model`, z.void(), {
      method: 'PUT',
      body: JSON.stringify({ model }),
    });
  },
};
