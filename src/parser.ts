import { parseCsv, parseRssFeed, stringifyXml } from "./deps.ts";

// --- Types ---

export type Publisher = {
  readonly id: string;
  readonly name: string;
  readonly url: string;
};

export type FeedSpec = {
  readonly publisher: Publisher;
  readonly title: string;
  readonly categories: readonly string[];
  readonly url: string;
};

export type FeedItem = {
  readonly spec: FeedSpec;
  readonly title: string;
  readonly partialText: string;
  readonly date: string;
  readonly url: string;
};

// --- CSV Loading ---

export async function loadPublishers(path: string): Promise<readonly Publisher[]> {
  const text = await Deno.readTextFile(path);
  const rows = parseCsv(text, { skipFirstRow: true }) as Record<string, string>[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    url: row.url,
  }));
}

export async function loadFeedSpecs(
  publishersPath: string,
  feedSpecsPath: string
): Promise<readonly FeedSpec[]> {
  const publishers = await loadPublishers(publishersPath);
  const publisherMap = new Map(publishers.map((p) => [p.name, p]));

  const text = await Deno.readTextFile(feedSpecsPath);
  const rows = parseCsv(text, { skipFirstRow: true }) as Record<string, string>[];

  const specs: FeedSpec[] = [];

  for (const row of rows) {
    const publisher = publisherMap.get(row.publisher);
    if (!publisher) {
      console.warn(`Publisher not found: ${row.publisher}`);
      continue;
    }

    specs.push({
      publisher,
      title: row.title,
      categories: row.categories.split("|"),
      url: row.url,
    });
  }

  return specs;
}

// --- XML Encoding Detection ---

export function decodeXml(buf: ArrayBuffer): string {
  const preview = new TextDecoder("ascii").decode(buf.slice(0, 100));
  const match = preview.match(/encoding=["']([^"']+)["']/i);
  const encoding = match ? match[1].toLowerCase() : "utf-8";

  try {
    return new TextDecoder(encoding).decode(buf);
  } catch {
    return new TextDecoder("utf-8").decode(buf);
  }
}

// --- Date Parsing ---

const MONTH_MAP: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04",
  may: "05", jun: "06", jul: "07", aug: "08",
  sep: "09", oct: "10", nov: "11", dec: "12",
};

export function parseFuzzyDate(raw: string): string {
  if (!raw) return new Date().toISOString();

  const trimmed = raw.trim();

  // ISO 8601: 2022-07-15T22:01:07+09:00 or 2022-07-15 07:30:10
  const isoMatch = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/
  );
  if (isoMatch) {
    try {
      return new Date(trimmed).toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  // RFC 2822: Mon, 15 Jul 2022 22:01:07 +0900
  const rfcMatch = trimmed.match(
    /(\d{1,2})\s+(\w{3})\s+(\d{4})\s+(\d{2}):(\d{2}):(\d{2})\s*([\w+-]+)?/
  );
  if (rfcMatch) {
    const [, day, monthStr, year, h, m, s] = rfcMatch;
    const month = MONTH_MAP[monthStr.toLowerCase()];
    if (month) {
      try {
        return new Date(`${year}-${month}-${day.padStart(2, "0")}T${h}:${m}:${s}Z`).toISOString();
      } catch {
        return new Date().toISOString();
      }
    }
  }

  // Fallback
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {
    // ignore
  }

  return new Date().toISOString();
}

// --- Feed Fetching & Parsing ---

export async function fetchFeeds(spec: FeedSpec): Promise<readonly FeedItem[]> {
  const response = await fetch(spec.url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${spec.url}`);
  }

  const buf = await response.arrayBuffer();
  const text = decodeXml(buf);
  const feed = await parseRssFeed(text);

  return standardizeFeed(spec, feed);
}

export function standardizeFeed(
  spec: FeedSpec,
  // deno-lint-ignore no-explicit-any
  rawFeed: any
): readonly FeedItem[] {
  const entries = rawFeed.entries ?? [];

  // deno-lint-ignore no-explicit-any
  return entries.map((entry: any) => {
    const dateRaw =
      entry["dc:dateRaw"] ??
      entry["publishedRaw"] ??
      entry["published"]?.toISOString?.() ??
      "";

    return {
      spec,
      title: entry.title?.value ?? entry.title ?? "",
      partialText: entry.description?.value ?? entry.content?.value ?? "",
      date: parseFuzzyDate(typeof dateRaw === "string" ? dateRaw : ""),
      url: entry.links?.[0]?.href ?? entry.id ?? "",
    };
  });
}

// --- RSS XML Generation ---

export function serialize(
  title: string,
  link: string,
  description: string,
  feeds: readonly FeedItem[]
): string {
  const sorted = [...feeds].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const items = sorted.map((item) => ({
    title: item.title,
    link: item.url,
    guid: item.url,
    pubDate: new Date(item.date).toUTCString(),
    "content:encoded": item.partialText,
  }));

  const rss = {
    "?xml": { "@version": "1.0", "@encoding": "UTF-8" },
    rss: {
      "@version": "2.0",
      "@xmlns:dc": "http://purl.org/dc/elements/1.1/",
      "@xmlns:content": "http://purl.org/rss/1.0/modules/content/",
      channel: {
        title,
        link,
        description,
        lastBuildDate: new Date().toUTCString(),
        item: items,
      },
    },
  };

  return stringifyXml(rss);
}

// --- Grouping Utilities ---

export function groupByPublisher(
  feeds: readonly FeedItem[]
): Record<string, FeedItem[]> {
  const result: Record<string, FeedItem[]> = {};
  for (const item of feeds) {
    const key = item.spec.publisher.id;
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

export function groupByCategory(
  feeds: readonly FeedItem[]
): Record<string, FeedItem[]> {
  const result: Record<string, FeedItem[]> = {};

  for (const item of feeds) {
    for (const cat of item.spec.categories) {
      if (cat === "_all_") continue;
      if (!result[cat]) result[cat] = [];
      result[cat].push(item);
    }
  }

  return result;
}

// --- Group Discovery ---

export async function discoverGroups(feedsDir: string): Promise<string[]> {
  const groups: string[] = [];

  for await (const entry of Deno.readDir(feedsDir)) {
    if (entry.isDirectory) {
      groups.push(entry.name);
    }
  }

  return groups.sort();
}
