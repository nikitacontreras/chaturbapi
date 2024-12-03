export * from './events'
export * from './stats'

export type StatsRow = {
    [key: string]: string | number;
};

export type AffiliateStatsResponse = {
    breakdown: string;
    range: string;
    stats: StatsRow[];
    program: string;
    columns: string[];
    totals: StatsRow;
    rows: StatsRow[];
};
