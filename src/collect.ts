import { sleep } from "./deps.ts";
import { loadFeedSpecs, fetchFeeds, discoverGroups } from "./parser.ts";
import type { FeedItem } from "./parser.ts";

const BASE_DIR = new URL("../", import.meta.url).pathname;

async function collectGroup(group: string) {
  const feedsDir = `${BASE_DIR}feeds/${group}/`;
  const outputDir = `${BASE_DIR}rss/${group}/jsons/`;

  await Deno.mkdir(outputDir, { recursive: true });

  const specs = await loadFeedSpecs(
    `${feedsDir}publishers.csv`,
    `${feedsDir}feed_specs.csv`
  );

  console.log(`[${group}] Loaded ${specs.length} feed specs`);

  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    const delay = 1 + (i % 5);
    await sleep(delay);

    try {
      console.log(`[${group}] [${i + 1}/${specs.length}] ${spec.publisher.name} - ${spec.title}`);
      const items = await fetchFeeds(spec);
      const filename = `${spec.publisher.id}-${spec.categories.join("_")}.json`;

      const serializable = items.map((item: FeedItem) => ({
        publisherId: item.spec.publisher.id,
        publisherName: item.spec.publisher.name,
        specTitle: item.spec.title,
        categories: [...item.spec.categories],
        specUrl: item.spec.url,
        title: item.title,
        partialText: item.partialText,
        date: item.date,
        url: item.url,
      }));

      await Deno.writeTextFile(
        `${outputDir}${filename}`,
        JSON.stringify(serializable, null, 2)
      );
      console.log(`  -> ${items.length} items saved`);
    } catch (error) {
      console.error(`  -> ERROR: ${spec.publisher.name} - ${spec.title}: ${error}`);
    }
  }
}

async function main() {
  const targetGroup = Deno.args[0];
  const groups = targetGroup ? [targetGroup] : await discoverGroups(`${BASE_DIR}feeds/`);

  console.log(`Groups to collect: ${groups.join(", ")}`);

  for (const group of groups) {
    await collectGroup(group);
  }

  console.log("Collection complete.");
}

main();
