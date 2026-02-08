import { assertEquals } from "../dev_deps.ts";
import { parseFuzzyDate, decodeXml } from "../parser.ts";

Deno.test("parseFuzzyDate - ISO 8601 with timezone", () => {
  const result = parseFuzzyDate("2024-01-15T10:30:00+09:00");
  assertEquals(result, new Date("2024-01-15T10:30:00+09:00").toISOString());
});

Deno.test("parseFuzzyDate - ISO 8601 with space", () => {
  const result = parseFuzzyDate("2024-01-15 10:30:00");
  assertEquals(typeof result, "string");
  assertEquals(result.includes("2024"), true);
});

Deno.test("parseFuzzyDate - RFC 2822", () => {
  const result = parseFuzzyDate("Mon, 15 Jan 2024 10:30:00 +0900");
  assertEquals(result.includes("2024"), true);
});

Deno.test("parseFuzzyDate - empty string returns current date", () => {
  const result = parseFuzzyDate("");
  const now = new Date();
  assertEquals(result.includes(String(now.getFullYear())), true);
});

Deno.test("decodeXml - UTF-8 default", () => {
  const encoder = new TextEncoder();
  const buf = encoder.encode('<?xml version="1.0"?><root/>');
  const result = decodeXml(buf.buffer);
  assertEquals(result.includes("<root/>"), true);
});

Deno.test("decodeXml - explicit UTF-8 encoding", () => {
  const encoder = new TextEncoder();
  const buf = encoder.encode('<?xml version="1.0" encoding="UTF-8"?><root/>');
  const result = decodeXml(buf.buffer);
  assertEquals(result.includes("<root/>"), true);
});
