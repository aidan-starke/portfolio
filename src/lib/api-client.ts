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
      const text = await response.text();
      console.log("not ok", text);
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
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
