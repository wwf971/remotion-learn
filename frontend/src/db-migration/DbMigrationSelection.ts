import { RefObject, useLayoutEffect, useState, useMemo } from "react";
import { dbMigrationReadMotion } from "./DbMigrationMappingMotion";
import { delayRender, continueRender } from "remotion";
export type DbMigrationRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
const section = (id: string, child: string) =>
  `[data-db-section="${id}"] ${child}`;
const row = (n: number) => `[data-db-row="${n}"]`;
const selectors: Record<string, string> = {
  source: '[data-db-container="source"] [data-db-schema-row="0"]',
  target: '[data-db-container="target"] [data-db-schema-row="0"]',
  mapping: section("mapping", "[data-db-schema]"),
  transform: section("mapping", '[data-db-operator="前後の空白除去"]'),
  choices: section("choices", row(0)),
  tables: section("tables", '[data-db-node="① 取引先企業"]'),
  ranks: section("ranks", '[data-db-node="本社"]'),
  cycles: section("cycles", '[data-db-node="行 A"]'),
  identity: section("identity", row(1)),
  batches: section("batches", row(3)),
  seal: section("batches", row(4)),
  dispatch: section("dispatch", '[data-db-node="取引先 4 件"]'),
  retry: section("retry", "[data-db-sequence-focus]"),
  dlq: section("dlq", "[data-db-sequence-focus]"),
  "execution-report": section("execution-report", row(0)),
  reconcile: section("reconcile", row(0)),
  compare: section("compare", row(2)),
  report: section("report", row(2)),
};
// Measure the actual SVG rectangle after React commits both camera transforms.
// Normalize Studio's CSS preview scale back to 1920px composition coordinates.
export const useDbMigrationSelection = (
  root: RefObject<HTMLDivElement | null>,
  shot: string,
  frame: number,
  tick: number,
) => {
  const [rect, setRect] = useState<{
    rect: DbMigrationRect;
    branches: [number, number][];
    noteHeight: number;
  } | null>(null);
  const handle = useMemo(
    () => delayRender(`Measure SVG selection at frame ${frame}`),
    [frame],
  );
  useLayoutEffect(() => {
    let cancelled = false;
    const request = requestAnimationFrame(() => {
      const host = root.current;
      const target = host?.querySelector(
        (["source", "target"].includes(shot)
          ? `[data-db-container="${shot}"] [data-db-schema-row="${dbMigrationReadMotion(shot, tick).row}"]`
          : selectors[shot]) ?? '[data-db-panel="データベース移行ツール"]',
      );
      if (!cancelled && host && target) {
        const h = host.querySelector("svg")!.getBoundingClientRect(),
          b = target.getBoundingClientRect();
        const scale = 1920 / h.width;

        const branches: [number, number][] =
          shot === "collect"
            ? Array.from(host.querySelectorAll("[data-db-query]")).map((el) => {
                const q = el.getBoundingClientRect();
                return [
                  (q.x + q.width / 2 - h.x) * scale,
                  (q.y + q.height / 2 - h.y) * scale,
                ];
              })
            : [];
        setRect({
          noteHeight:
            (host
              .querySelector("[data-db-callout-text]")
              ?.getBoundingClientRect().height ?? 0) * scale,
          branches,
          rect: {
            x: (b.x - h.x) * scale,
            y: (b.y - h.y) * scale,
            width: b.width * scale,
            height: b.height * scale,
          },
        });
      }
      requestAnimationFrame(() => continueRender(handle));
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(request);
      continueRender(handle);
    };
  }, [root, shot, frame, tick, handle]);
  return rect;
};
