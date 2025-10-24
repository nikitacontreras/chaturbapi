export type Range =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "this_month"
  | "last_month"
  | "this_year";

export type Breakdown = "none" | "day" | "month" | "program";
export type Program = "affiliate" | "revshare" | "ppv" | "tokens";

export interface AffiliateStatsRow {
  date?: string;
  clicks?: number;
  signups?: number;
  purchases?: number;
  revenue?: number;
  tokens?: number;
  [key: string]: unknown;
}

export interface AffiliateStatsTotals {
  clicks?: number;
  signups?: number;
  purchases?: number;
  revenue?: number;
  tokens?: number;
  [key: string]: unknown;
}

export interface AffiliateStatsResponse {
  range: Range | string;
  breakdown: Breakdown | string;
  program?: Program | string;
  columns: string[];
  rows: AffiliateStatsRow[];
  totals?: AffiliateStatsTotals;
  stats?: unknown; // algunos entornos devuelven "stats" en lugar de "rows"
}

export interface AffiliateStatsQuery {
  range?: Range | string;
  breakdown?: Breakdown | string;
  program?: Program | string;
}