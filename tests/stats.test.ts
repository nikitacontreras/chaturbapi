import { describe, it, expect } from "vitest";
import { getAffiliateStats } from "../src/utils/http";

describe("getAffiliateStats", () => {
    it("construye URL, protege token y parsea JSON", async () => {
        const calls: string[] = [];
        const fakeFetch: typeof fetch = (async (input: any) => {
            calls.push(String(input));
            return new Response(
                JSON.stringify({
                    breakdown: "day",
                    range: "last_7_days",
                    program: "affiliate",
                    columns: ["date", "clicks"],
                    rows: [{ date: "2025-10-01", clicks: 10 }],
                    totals: { clicks: 10 }
                }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            ) as any;
        }) as any;

        const res = await getAffiliateStats(
            "user",
            "tok",
            { range: "last_7_days" },
            {
                fetchImpl: fakeFetch,
                beforeRequest: (url) => {
                    // token debe aparecer como **** en hooks si se sanea
                    expect(url.includes("token=****")).toBe(true);
                },
            }
        );

        expect(res.range).toBe("last_7_days");
        expect(calls[0]).toContain("username=user");
        expect(calls[0]).toContain("token=tok");
    });
});