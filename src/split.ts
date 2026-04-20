// Split feed_specs.csv into feed_specs.csv + feed_specs_slow.csv + feed_specs_archive.csv
// based on classification.json produced by `deno task classify`.
//
// Input:  feeds/<group>/feed_specs.csv          (master list)
//         feeds/<group>/classification.json     (from classify.ts)
// Output: feeds/<group>/feed_specs.csv          (active only)
//         feeds/<group>/feed_specs_slow.csv     (3-12 months idle)
//         feeds/<group>/feed_specs_archive.csv  (12mo+ idle or fetch-failed)

const BASE_DIR = new URL("../", import.meta.url).pathname;
const HEADER = "publisher,title,categories,url";

type Classification = {
  publisher: string;
  url: string;
  status: "active" | "slow" | "archive";
  lastDate: string | null;
  daysSincePost: number | null;
  error: string | null;
};

type CsvRow = { raw: string; publisher: string; url: string };

function parseRow(line: string): CsvRow | null {
  // simple CSV parse — our files don't contain quoted commas
  const cols = line.split(",");
  if (cols.length < 4) return null;
  const publisher = cols[0];
  const url = cols.slice(3).join(",");
  return { raw: line, publisher, url };
}

async function splitGroup(group: string) {
  const feedsDir = `${BASE_DIR}feeds/${group}/`;

  const classification = JSON.parse(
    await Deno.readTextFile(`${feedsDir}classification.json`),
  ) as Classification[];

  const statusByKey = new Map<string, Classification["status"]>();
  for (const c of classification) {
    statusByKey.set(`${c.publisher}|${c.url}`, c.status);
  }

  const specsText = await Deno.readTextFile(`${feedsDir}feed_specs.csv`);
  const lines = specsText.split("\n").filter((l) => l.length > 0);
  const [, ...rows] = lines; // drop header

  const buckets: Record<Classification["status"], string[]> = {
    active: [],
    slow: [],
    archive: [],
  };

  let unmatched = 0;
  for (const line of rows) {
    const parsed = parseRow(line);
    if (!parsed) continue;
    const status = statusByKey.get(`${parsed.publisher}|${parsed.url}`);
    if (!status) {
      unmatched++;
      buckets.active.push(line); // default: keep in active if no classification
      continue;
    }
    buckets[status].push(line);
  }

  console.log(`[${group}] active=${buckets.active.length}, slow=${buckets.slow.length}, archive=${buckets.archive.length}, unmatched=${unmatched}`);

  await Deno.writeTextFile(
    `${feedsDir}feed_specs.csv`,
    [HEADER, ...buckets.active].join("\n") + "\n",
  );
  await Deno.writeTextFile(
    `${feedsDir}feed_specs_slow.csv`,
    [HEADER, ...buckets.slow].join("\n") + "\n",
  );
  await Deno.writeTextFile(
    `${feedsDir}feed_specs_archive.csv`,
    [HEADER, ...buckets.archive].join("\n") + "\n",
  );

  console.log(`[${group}] Wrote 3 chunk files`);
}

async function main() {
  const group = Deno.args[0];
  if (!group) {
    console.error("Usage: deno run src/split.ts <group>");
    Deno.exit(1);
  }
  await splitGroup(group);
}

main();
