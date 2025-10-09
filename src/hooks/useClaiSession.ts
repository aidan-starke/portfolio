import { useState, useCallback } from "react";
import { claiApi, type Session } from "@/api/claiClient";

export function useClaiSession() {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Initialize or get last session
  const initializeSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await claiApi.getLastSession();
      setCurrentSession(session);
      return session;
    } catch (err) {
      // If no session exists, create a new one
      try {
        const newSession = await claiApi.createSession();
        setCurrentSession(newSession);
        return newSession;
      } catch (createErr) {
        const message =
          createErr instanceof Error
            ? createErr.message
            : "Failed to initialize session";
        setError(message);
        throw createErr;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new session
  const createNewSession = useCallback(async (name?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await claiApi.createSession(
        name ? { name, display_name: name } : undefined
      );
      setCurrentSession(session);
      return session;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create session";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save current session with a name
  const saveSession = useCallback(
    async (name: string) => {
      if (!currentSession) {
        throw new Error("No active session");
      }
      setIsLoading(true);
      setError(null);
      try {
        await claiApi.saveSession(currentSession.id, name);
        // Update local state
        setCurrentSession({ ...currentSession, display_name: name });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to save session";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession]
  );

  // Delete a session by name
  const deleteSession = useCallback(async (name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await claiApi.deleteSession(name);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete session";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Resume a session by name
  const resumeSession = useCallback(async (name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await claiApi.getSessionByName(name);
      setCurrentSession(session);
      return session;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to resume session";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // List all sessions
  const listSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await claiApi.getSessions();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to list sessions";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set role for current session
  const setRole = useCallback(
    async (role: string | null) => {
      if (!currentSession) {
        throw new Error("No active session");
      }
      setIsLoading(true);
      setError(null);
      try {
        await claiApi.setRole(currentSession.id, role);
        setCurrentSession({ ...currentSession, role });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to set role";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession]
  );

  // Set model for current session
  const setModel = useCallback(
    async (model: string) => {
      if (!currentSession) {
        throw new Error("No active session");
      }
      setIsLoading(true);
      setError(null);
      try {
        await claiApi.setModel(currentSession.id, model);
        setCurrentSession({ ...currentSession, model });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to set model";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession]
  );

  // Get available models
  const getModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await claiApi.getModels();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to get models";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send a chat message
  const sendMessage = useCallback(
    async (message: string) => {
      if (!currentSession) {
        throw new Error("No active session");
      }
      setIsLoading(true);
      setError(null);
      try {
        return await claiApi.sendMessage(currentSession.id, message);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to send message";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession]
  );

  return {
    currentSession,
    isLoading,
    error,
    clearError,
    initializeSession,
    createNewSession,
    saveSession,
    deleteSession,
    resumeSession,
    listSessions,
    setRole,
    setModel,
    getModels,
    sendMessage,
  };
}
