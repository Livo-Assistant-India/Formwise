// Shared fetch wrapper: unwraps the {data} envelope, throws ApiRequestError with the server's code/message.
import type { ApiEnvelope, ApiErrorBody } from "@/types/api";
import { reportRequestFailed, reportRequestSucceeded } from "./connection-state";
import { invalidateQueries } from "./query-cache";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4500/api";

export class ApiRequestError extends Error {
  readonly httpStatus: number;
  readonly code: string;
  readonly details: ApiErrorBody["details"];

  constructor(httpStatus: number, errorBody: ApiErrorBody) {
    super(errorBody.message);
    this.httpStatus = httpStatus;
    this.code = errorBody.code;
    this.details = errorBody.details;
  }
}

export function buildApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export async function requestJson<ResponseData>(path: string, init: RequestInit = {}): Promise<ResponseData> {
  let response: Response;
  try {
    response = await fetch(buildApiUrl(path), init);
  } catch {
    // Network or server down: say so plainly (not "Failed to fetch") and let the connection notice take over.
    reportRequestFailed();
    throw new ApiRequestError(0, { code: "OFFLINE", message: "Can't reach the server. Your work is safe. Try again in a moment." });
  }
  reportRequestSucceeded();
  const envelope = (await response.json().catch(() => ({}))) as ApiEnvelope<ResponseData>;
  if (!response.ok || envelope.error) {
    throw new ApiRequestError(response.status, envelope.error || { code: "HTTP_ERROR", message: `${response.status} ${response.statusText}` });
  }
  // Anything that changed data on the server makes every cached list stale; what is on screen refetches quietly.
  if (init.method && init.method !== "GET") invalidateQueries();
  return envelope.data as ResponseData;
}

export function sendJson<ResponseData>(path: string, method: "POST" | "PUT" | "DELETE", requestBody?: unknown): Promise<ResponseData> {
  return requestJson<ResponseData>(path, {
    method,
    headers: requestBody === undefined ? undefined : { "Content-Type": "application/json" },
    body: requestBody === undefined ? undefined : JSON.stringify(requestBody),
  });
}
