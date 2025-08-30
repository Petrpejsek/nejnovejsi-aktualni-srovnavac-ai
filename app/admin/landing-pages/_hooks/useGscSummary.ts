"use client";

import { useEffect, useState } from "react";

type Sample = {
  url: string;
  status?: string;   // e.g. "Indexed" | "Excluded" | ...
  reason?: string;   // optional human label
};

type SummaryResp = {
  propertyUrl?: string;
  siteType?: "domain" | "url-prefix" | "unknown";
  lastSyncAt?: string | null;
  lastSyncStats?: Record<string, any> | null;
  sampled?: Sample[];      // tolerate multiple shapes
  pagesSample?: Sample[];
  sample?: Sample[];
};

export function useGscSummary() {
  const [loading, setLoading] = useState(true);
  const [propertyUrl, setPropertyUrl] = useState<string | undefined>();
  const [siteType, setSiteType] = useState<"domain" | "url-prefix" | "unknown">("unknown");
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [map, setMap] = useState<Record<string, Sample>>({}); // key = path
  const [lastStats, setLastStats] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const r = await fetch("/api/seo/gsc-summary", { cache: "no-store" });
        const d = (await r.json()) as SummaryResp;

        const arr =
          (d.sampled as Sample[] | undefined) ||
          (d.pagesSample as Sample[] | undefined) ||
          (d.sample as Sample[] | undefined) ||
          [];

        const m: Record<string, Sample> = {};
        for (const s of arr) {
          const key = toPath(s.url);
          m[key] = normalizeSample(s);
        }

        if (!cancelled) {
          setPropertyUrl(d.propertyUrl);
          setSiteType(d.siteType ?? "unknown");
          setLastSyncAt(d.lastSyncAt ?? null);
          setLastStats(d.lastSyncStats ?? null);
          setMap(m);
        }
      } catch {
        if (!cancelled) setMap({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, []);

  return { loading, propertyUrl, siteType, lastSyncAt, lastSyncStats: lastStats, map };
}

function toPath(u: string) {
  try {
    const { pathname } = new URL(u);
    return pathname.replace(/\/+$/, "") || "/";
  } catch {
    return (u || "").toString();
  }
}

function normalizeSample(s: Sample): Sample {
  const raw = (s.status || "").toLowerCase();
  let status = s.status || "Unknown";
  if (!s.status && (raw.includes("index") || raw === "indexed")) status = "Indexed";
  if (!s.status && (raw.includes("exclude") || raw.includes("not"))) status = "Not indexed";
  return { ...s, status };
}
