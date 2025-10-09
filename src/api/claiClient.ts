import { z } from "zod";
import { fetchJson } from "../lib/apiClient";

const CLAI_API =
  import.meta.env.VITE_CLAI_API_URL || "http://100.99.137.30:3500";

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

export const ModelsResponseSchema = z.array(ClaudeModelSchema);

export type Session = z.infer<typeof SessionSchema>;
export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type ClaudeModel = z.infer<typeof ClaudeModelSchema>;

export const claiApi = {
  // Session queries
  getSessions: async (): Promise<Session[]> => {
    return fetchJson(`${CLAI_API}/sessions`, SessionListSchema);
  },

  getSession: async (id: number): Promise<Session> => {
    return fetchJson(`${CLAI_API}/sessions/${id}`, SessionSchema);
  },

  getLastSession: async (): Promise<Session> => {
    return fetchJson(`${CLAI_API}/sessions/last`, SessionSchema);
  },

  getSessionByName: async (name: string): Promise<Session> => {
    return fetchJson(
      `${CLAI_API}/sessions/by-name/${encodeURIComponent(name)}`,
      SessionSchema
    );
  },

  // Session mutations
  createSession: async (session?: CreateSessionDto): Promise<Session> => {
    const payload = session || {
      name: `session_${Date.now()}`,
    };
    return fetchJson(`${CLAI_API}/sessions`, SessionSchema, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  saveSession: async (id: number, displayName: string): Promise<void> => {
    await fetchJson(
      `${CLAI_API}/sessions/${id}`,
      z.union([z.null(), z.undefined(), z.object({})]),
      {
        method: "PATCH",
        body: JSON.stringify({ display_name: displayName }),
      }
    );
  },

  deleteSession: async (name: string): Promise<void> => {
    await fetchJson(
      `${CLAI_API}/sessions/by-name/${encodeURIComponent(name)}`,
      z.union([z.null(), z.undefined(), z.object({})]),
      {
        method: "DELETE",
      }
    );
  },

  // Chat
  sendMessage: async (sessionId: number, message: string): Promise<string> => {
    const response = await fetchJson(
      `${CLAI_API}/sessions/${sessionId}/chat`,
      ChatResponseSchema,
      {
        method: "POST",
        body: JSON.stringify({ message }),
      }
    );
    return response.response;
  },

  // Role management
  setRole: async (sessionId: number, role: string | null): Promise<void> => {
    await fetchJson(
      `${CLAI_API}/sessions/${sessionId}/role`,
      z.union([z.null(), z.undefined(), z.object({})]),
      {
        method: "PUT",
        body: JSON.stringify({ role }),
      }
    );
  },

  // Model management
  getModels: async (): Promise<ClaudeModel[]> => {
    return fetchJson(`${CLAI_API}/models`, ModelsResponseSchema);
  },

  setModel: async (sessionId: number, model: string): Promise<void> => {
    await fetchJson(
      `${CLAI_API}/sessions/${sessionId}/model`,
      z.union([z.null(), z.undefined(), z.object({})]),
      {
        method: "PUT",
        body: JSON.stringify({ model }),
      }
    );
  },
};
