import fetch from "node-fetch";
import { parseStringPromise } from "xml2js";
import fs from "fs";

const FEED_URL =
  "https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml";

async function fetchXML(url) {
  const res = await fetch(url);
  return await res.text();
}

async function main() {
  // ① フィード取得
  const feedXML = await fetchXML(FEED_URL);
  const feed = await parseStringPromise(feedXML);

  // 最新の地震情報（最初のentry）
  const entry = feed.feed.entry[0];
  const detailURL = entry.link[0].$.href;

  // ② 詳細XML取得
  const detailXML = await fetchXML(detailURL);
  const detail = await parseStringPromise(detailXML);

  const body = detail.Report.Body[0];
  const eq = body.Earthquake[0];

  // ③ 震源情報
  const hypocenter = eq.Hypocenter[0];
  const area = hypocenter.Area[0];

  // ④ マグニチュード
  const magnitude = eq.Magnitude[0].$.value;

  // ⑤ 最大震度
  const intensity =
    body.Intensity?.[0]?.Observation?.[0]?.MaxInt?.[0]?.$?.description
    ?? "不明";

  const result = {
    id: entry.id[0],
    time: eq.OriginTime[0],
    hypocenter: {
      name: area.Name[0],
      latitude: parseFloat(area.Coordinate[0].$.lat),
      longitude: parseFloat(area.Coordinate[0].$.lon),
      depth_km: parseInt(
        area.Coordinate[0].$.depth.replace("km", "")
      )
    },
    magnitude: parseFloat(magnitude),
    max_intensity: intensity
  };

  fs.writeFileSync(
    "public/data/latest-earthquake.json",
    JSON.stringify(result, null, 2)
  );
}

main(
