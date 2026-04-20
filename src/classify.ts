import { parseRssFeed } from "./deps.ts";
import { loadFeedSpecs, decodeXml, parseFuzzyDate } from "./parser.ts";
import type { FeedSpec } from "./parser.ts";

// Classify each feed into active / slow / archive based on its latest post date.
// - active:  posted within last 90 days
// - slow:    posted within last 365 days
// - archive: older than 365 days OR fetch failed

const BASE_DIR = new URL("../", import.meta.url).pathname;
const CONCURRENCY = 10;
const FETCH_TIMEOUT_MS = 10_000;
const ACTIVE_DAYS = 90;
const ARCHIVE_DAYS = 365;

type ClassifyResult = {
  publisher: string;
  url: string;
  status: "active" | "slow" | "archive";
  lastDate: string | null;
  daysSincePost: number | null;
  error: string | null;
};

async function fetchLastDate(spec: FeedSpec): Promise<{ date: string | null; error: string | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(spec.url, { signal: controller.signal });
    if (!response.ok) return { date: null, error: `HTTP ${response.status}` };

    const buf = await response.arrayBuffer();
    const text = decodeXml(buf);
    const feed = await parseRssFeed(text);
    const entries = feed.entries ?? [];

    if (entries.length === 0) return { date: null, error: "no entries" };

    let latest: number = 0;
    for (const entry of entries) {
      // deno-lint-ignore no-explicit-any
      const e = entry as any;
      const raw =
        e["dc:dateRaw"] ??
        e["publishedRaw"] ??
        e["published"]?.toISOString?.() ??
        e["updated"]?.toISOString?.() ??
        "";
      if (!raw) continue;
      const iso = parseFuzzyDate(typeof raw === "string" ? raw : "");
      const t = new Date(iso).getTime();
      if (!isNaN(t) && t > latest) latest = t;
    }

    if (latest === 0) return { date: null, error: "no dates parsed" };
    return { date: new Date(latest).toISOString(), error: null };
  } catch (err) {
    return { date: null, error: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

function classify(date: string | null): { status: ClassifyResult["status"]; days: number | null } {
  if (!date) return { status: "archive", days: null };
  const days = (Date.now() - new Date(date).getTime()) / 86_400_000;
  if (days < ACTIVE_DAYS) return { status: "active", days };
  if (days < ARCHIVE_DAYS) return { status: "slow", days };
  return { status: "archive", days };
}

async function runWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  const workers = Array.from({ length: limit }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  });

  await Promise.all(workers);
  return results;
}

async function classifyGroup(group: string) {
  const feedsDir = `${BASE_DIR}feeds/${group}/`;
  const specs = await loadFeedSpecs(
    `${feedsDir}publishers.csv`,
    `${feedsDir}feed_specs.csv`,
  );

  console.log(`[${group}] Classifying ${specs.length} feeds (concurrency=${CONCURRENCY})...`);
  const results = await runWithConcurrency(specs, CONCURRENCY, async (spec, i) => {
    const { date, error } = await fetchLastDate(spec);
    const { status, days } = classify(date);
    const daysLabel = days === null ? "N/A" : `${Math.round(days)}d`;
    const statusLabel = status.padEnd(7);
    console.log(`  [${i + 1}/${specs.length}] ${statusLabel} ${daysLabel.padStart(6)}  ${spec.publisher.name} - ${spec.title}${error ? ` (${error})` : ""}`);
    return {
      publisher: spec.publisher.name,
      url: spec.url,
      status,
      lastDate: date,
      daysSincePost: days === null ? null : Math.round(days),
      error,
    } satisfies ClassifyResult;
  });

  const summary = {
    active: results.filter((r) => r.status === "active").length,
    slow: results.filter((r) => r.status === "slow").length,
    archive: results.filter((r) => r.status === "archive").length,
  };
  console.log(`[${group}] Summary: active=${summary.active}, slow=${summary.slow}, archive=${summary.archive}`);

  await Deno.writeTextFile(
    `${feedsDir}classification.json`,
    JSON.stringify(results, null, 2),
  );
  console.log(`[${group}] Wrote ${feedsDir}classification.json`);
}

async function main() {
  const group = Deno.args[0];
  if (!group) {
    console.error("Usage: deno run src/classify.ts <group>");
    Deno.exit(1);
  }
  await classifyGroup(group);
}

main();
