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

export class RateLimitError extends ApiError {
  retryAfter: number; // seconds until rate limit resets

  constructor(message: string, retryAfter: number) {
    super(message, 429);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

export async function fetchJson<T>(
  url: string,
  schema: z.ZodSchema<T>,
  options?: RequestInit,
  retryCount = 0
): Promise<T> {
  const maxRetries = 1; // Only retry once for rate limits

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      // Handle rate limiting (429) specially
      if (response.status === 429) {
        const retryAfterHeader =
          response.headers.get("retry-after") ||
          response.headers.get("x-ratelimit-after");
        const retryAfter = parseInt(retryAfterHeader || "5", 10);
        const message = await response.text();

        // Auto-retry if we haven't exceeded max retries
        if (retryCount < maxRetries) {
          console.warn(
            `Rate limited. Retrying after ${retryAfter}s (attempt ${retryCount + 1}/${maxRetries})`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000)
          );
          return fetchJson(url, schema, options, retryCount + 1);
        }

        // Throw user-friendly error after max retries
        throw new RateLimitError(
          `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`,
          retryAfter
        );
      }

      // Handle other errors
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
