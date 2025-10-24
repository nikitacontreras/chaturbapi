import type { AffiliateStatsQuery, AffiliateStatsResponse } from "../types";

export type RequestOptions = {
  baseURL?: string;
  timeoutMs?: number;
  retries?: number;
  fetchImpl?: typeof fetch;
  headers?: Record<string, string>;
  // hook opcional para observabilidad
  beforeRequest?: (url: string) => void;
  afterResponse?: (url: string, status: number) => void;
};

export class HTTPError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "HTTPError";
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function sanitize(url: string): string {
  try {
    const u = new URL(url);
    if (u.searchParams.has("token")) u.searchParams.set("token", "****");
    return u.toString();
  } catch {
    return url;
  }
}

export async function getAffiliateStats(
  username: string,
  token: string,
  query?: AffiliateStatsQuery,
  opts: RequestOptions = {}
): Promise<AffiliateStatsResponse> {
  const {
    baseURL = "https://chaturbate.com",
    timeoutMs = 12_000,
    retries = 2,
    fetchImpl = fetch,
    headers = {},
    beforeRequest,
    afterResponse,
  } = opts;

  const params = new URLSearchParams({ username, token });
  if (query?.range) params.set("range", String(query.range));
  if (query?.breakdown) params.set("breakdown", String(query.breakdown));
  if (query?.program) params.set("program", String(query.program));

  const url =
    `${baseURL.replace(/\/$/, "")}/affiliates/apistats/?` + params.toString();

  let attempt = 0;

  while (true) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      beforeRequest?.(sanitize(url));
      const res = await fetchImpl(url, {
        method: "GET",
        headers: { Accept: "application/json", ...headers },
        signal: controller.signal,
      });
      clearTimeout(timer);
      afterResponse?.(sanitize(url), res.status);

      const text = await res.text();
      let body: unknown = undefined;
      try {
        body = text ? JSON.parse(text) : undefined;
      } catch {
        body = text;
      }

      if (!res.ok) {
        throw new HTTPError(`HTTP ${res.status}`, res.status, body);
      }

      // normalizar posibles variantes { stats: [] } vs { rows: [] }
      const data = body as AffiliateStatsResponse;
      if (!data.rows && (data as any).stats) {
        const legacy = data as any;
        return {
          range: legacy.range ?? query?.range ?? "unknown",
          breakdown: legacy.breakdown ?? query?.breakdown ?? "none",
          program: legacy.program ?? query?.program,
          columns: legacy.columns ?? [],
          rows: legacy.stats ?? [],
          totals: legacy.totals,
          stats: legacy.stats ?? []
        };
      }

      return data;
    } catch (err: any) {
      clearTimeout(timer);

      const retriable =
        (err?.name === "AbortError") ||
        (err instanceof HTTPError
          ? err.status === 429 || err.status >= 500
          : true);

      if (!retriable || attempt > 1 + retries) {
        throw err;
      }

      const backoff =
        Math.min(1000 * Math.pow(2, attempt - 1), 5000) +
        Math.floor(Math.random() * 250);
      await sleep(backoff);
    }
  }
}