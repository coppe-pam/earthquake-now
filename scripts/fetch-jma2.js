import fetch from "node-fetch";
import { parseStringPromise } from "xml2js";
import fs from "fs";

const FEED = "https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml";

const xml = await fetch(FEED).then(r => r.text());
const parsed = await parseStringPromise(xml);

// 必要な項目だけ抜き出す（簡略）
const events = parsed.feed.entry.map(e => ({
  id: e.id[0],
  title: e.title[0],
  updated: e.updated[0],
}));

fs.writeFileSync(
  "public/data/earthquakes.json",
  JSON.stringify(events, null, 2)
);
