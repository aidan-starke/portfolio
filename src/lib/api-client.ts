import { z } from "zod";

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function fetchJson<T>(
  url: string,
  schema: z.ZodSchema<T>,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Handle empty responses (e.g., 204 No Content or empty PUT/DELETE responses)
    const text = await response.text();
    if (!text) {
      return schema.parse(undefined);
    }

    const data = JSON.parse(text);
    const parsed = schema.safeParse(data);

    if (!parsed.success) {
      console.error("Schema validation failed:", parsed.error);
      console.error("Received data:", data);
      throw new Error(`Schema validation failed: ${parsed.error.message}`);
    }

    return parsed.data;
  } catch (error) {
    console.error("fetchJson error:", error);
    throw error;
  }
}
