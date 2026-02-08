import { loadFeedSpecs, serialize, groupByPublisher, groupByCategory, discoverGroups } from "./parser.ts";
import type { FeedItem, FeedSpec, Publisher } from "./parser.ts";

const BASE_DIR = new URL("../", import.meta.url).pathname;

interface SerializedItem {
  readonly publisherId: string;
  readonly publisherName: string;
  readonly specTitle: string;
  readonly categories: readonly string[];
  readonly specUrl: string;
  readonly title: string;
  readonly partialText: string;
  readonly date: string;
  readonly url: string;
}

async function mergeGroup(group: string) {
  const feedsDir = `${BASE_DIR}feeds/${group}/`;
  const jsonsDir = `${BASE_DIR}rss/${group}/jsons/`;
  const rssDir = `${BASE_DIR}rss/${group}/`;

  await Deno.mkdir(`${rssDir}publishers/`, { recursive: true });
  await Deno.mkdir(`${rssDir}categories/`, { recursive: true });

  const specs = await loadFeedSpecs(
    `${feedsDir}publishers.csv`,
    `${feedsDir}feed_specs.csv`
  );

  const publisherMap = new Map<string, Publisher>();
  const specMap = new Map<string, FeedSpec>();
  for (const spec of specs) {
    publisherMap.set(spec.publisher.id, spec.publisher);
    specMap.set(`${spec.publisher.id}-${spec.categories.join("_")}`, spec);
  }

  const allItems: FeedItem[] = [];

  for await (const entry of Deno.readDir(jsonsDir)) {
    if (!entry.name.endsWith(".json")) continue;

    const content = await Deno.readTextFile(`${jsonsDir}${entry.name}`);
    const items: SerializedItem[] = JSON.parse(content);

    const specKey = entry.name.replace(".json", "");
    const spec = specMap.get(specKey);

    for (const item of items) {
      const publisher = publisherMap.get(item.publisherId);
      if (!publisher) continue;

      allItems.push({
        spec: spec ?? {
          publisher,
          title: item.specTitle,
          categories: [...item.categories],
          url: item.specUrl,
        },
        title: item.title,
        partialText: item.partialText,
        date: item.date,
        url: item.url,
      });
    }
  }

  console.log(`[${group}] Loaded ${allItems.length} total items`);

  const allXml = serialize(
    `${group} RSS - 전체`,
    "https://github.com",
    `${group} RSS 모음`,
    allItems
  );
  await Deno.writeTextFile(`${rssDir}all.xml`, allXml);
  console.log(`[${group}] Generated all.xml (${allItems.length} items)`);

  const byPublisher = groupByPublisher(allItems);
  for (const [pubId, items] of Object.entries(byPublisher)) {
    const publisher = publisherMap.get(pubId);
    if (!publisher) continue;

    const xml = serialize(
      `${group} RSS - ${publisher.name}`,
      publisher.url,
      `${publisher.name} RSS 피드`,
      items
    );
    await Deno.writeTextFile(`${rssDir}publishers/${pubId}.xml`, xml);
    console.log(`[${group}] Generated publishers/${pubId}.xml (${items.length} items)`);
  }

  const byCategory = groupByCategory(allItems);
  for (const [cat, items] of Object.entries(byCategory)) {
    const xml = serialize(
      `${group} RSS - ${cat}`,
      "https://github.com",
      `${group} ${cat} 카테고리 RSS`,
      items
    );
    await Deno.writeTextFile(`${rssDir}categories/${cat}.xml`, xml);
    console.log(`[${group}] Generated categories/${cat}.xml (${items.length} items)`);
  }
}

async function main() {
  const targetGroup = Deno.args[0];
  const groups = targetGroup ? [targetGroup] : await discoverGroups(`${BASE_DIR}feeds/`);

  console.log(`Groups to merge: ${groups.join(", ")}`);

  for (const group of groups) {
    await mergeGroup(group);
  }

  console.log("Merge complete.");
}

main();
