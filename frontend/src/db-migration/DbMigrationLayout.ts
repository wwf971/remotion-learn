import { interpolate, Easing } from "remotion";
import { dbMigrationShots } from "./DbMigrationTimeline";
export type DbMigrationPose = { x: number; y: number; zoom: number };
export type DbMigrationDocument = "plan" | "execution" | "verification";
export type DbMigrationContainer = "source" | "target" | DbMigrationDocument;
export type DbMigrationTile = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
const vertical = (items: [string, number, number][]): DbMigrationTile[] => {
  let y = 0;
  return items.map(([id, width, height]) => {
    const tile = {
      id,
      x: id === "choices" ? 35 : (1600 - width) / 2,
      y,
      width,
      height,
    };
    y += height + 220;
    return tile;
  });
};
export const dbMigrationTiles: Record<DbMigrationDocument, DbMigrationTile[]> =
  {
    plan: vertical([
      ["mapping", 1600, 650],
      ["choices", 1000, 600],
      ["tables", 1100, 600],
      ["ranks", 1100, 600],
      ["cycles", 1100, 600],
      ["identity", 1600, 700],
      ["batches", 1600, 700],
    ]),
    execution: vertical([
      ["dispatch", 1600, 650],
      ["retry", 1600, 650],
      ["dlq", 1600, 650],
      ["execution-report", 1600, 650],
    ]),
    verification: vertical([
      ["reconcile", 1600, 650],
      ["compare", 1600, 650],
      ["report", 1600, 650],
    ]),
  };
export const dbMigrationBoxes = {
  source: { x: 0, y: 0, width: 900, height: 700 },
  target: { x: 1900, y: 0, width: 900, height: 700 },
  plan: { x: 850, y: 950, width: 1600, height: 740 },
  execution: { x: 850, y: 950, width: 1600, height: 740 },
  verification: { x: 850, y: 950, width: 1600, height: 740 },
};
export const DB_MIGRATION_CARD_SCALE = 0.65;
export const dbMigrationEase = (tick: number, from = 0, to = 50) =>
  interpolate(tick, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.25, 1),
  });
export const dbMigrationMix = (
  a: DbMigrationPose,
  b: DbMigrationPose,
  t: number,
): DbMigrationPose => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  zoom: a.zoom + (b.zoom - a.zoom) * t,
});
export const dbMigrationDocumentForShot = (
  shot: string,
): DbMigrationDocument => {
  const phase = dbMigrationShots.find((s) => s.id === shot)?.phase;
  return phase === "execute"
    ? "execution"
    : phase === "verify"
      ? "verification"
      : "plan";
};
const order = (active: DbMigrationDocument): DbMigrationDocument[] => [
  active,
  ...(["plan", "execution", "verification"] as DbMigrationDocument[]).filter(
    (v) => v !== active,
  ),
];
export const dbMigrationDeck = (shot: string, tick: number) => {
  const active = dbMigrationDocumentForShot(shot);
  const changing = shot === "execute" || shot === "verify";
  const previous: DbMigrationDocument =
    shot === "execute" ? "plan" : shot === "verify" ? "execution" : active;
  const before = order(previous),
    after = order(active);
  // A single monotonic slot exchange; no compression or settling drift.
  const settle = changing ? dbMigrationEase(tick, 45, 100) : 1;
  const poses = after.reduce(
    (result, kind) => {
      const a = before.indexOf(kind),
        b = after.indexOf(kind);
      const rank = a + (b - a) * settle;
      result[kind] = {
        x: 850 - 70 * rank,
        y: 950 - 70 * rank,
      };
      return result;
    },
    {} as Record<DbMigrationDocument, { x: number; y: number }>,
  );
  return {
    poses,
    before: [...before].reverse(),
    after: [...after].reverse(),
    blend: changing ? dbMigrationEase(tick, 70, 95) : 1,
    changing,
    order: [...(changing && tick < 80 ? before : after)].reverse(),
  };
};
const initial: Record<DbMigrationContainer, DbMigrationPose> = {
  source: { x: 470, y: 373, zoom: 0.75 },
  target: { x: 470, y: 373, zoom: 0.75 },
  plan: { x: 800, y: 325, zoom: 0.86 },
  execution: { x: 800, y: 325, zoom: 0.86 },
  verification: { x: 800, y: 325, zoom: 0.86 },
};
const tileForShot: Record<string, string> = {
  transform: "mapping",
  seal: "batches",
};
export const dbMigrationViewportTarget = (
  container: DbMigrationContainer,
  shot: string,
): DbMigrationPose | undefined => {
  if (container === "source" || container === "target") {
    if ([container, "mapping", "transform"].includes(shot))
      return { x: 470, y: 235, zoom: 0.92 };
    if (["intro", "collect", "execute", "verify", "outro"].includes(shot))
      return initial[container];
    return undefined;
  }
  const tile = dbMigrationTiles[container].find(
    (t) => t.id === (tileForShot[shot] ?? shot),
  );
  // Fit the complete section, including its heading; blank gutters separate neighbors.
  return tile
    ? {
        x: 800,
        y: tile.y + tile.height / 2,
        zoom: Math.min(0.92, 560 / tile.height),
      }
    : undefined;
};
export const dbMigrationViewport = (
  container: DbMigrationContainer,
  shot: string,
  tick: number,
) => {
  let previous = initial[container];
  const index = dbMigrationShots.findIndex((s) => s.id === shot);
  for (let i = 0; i < index; i++)
    previous =
      dbMigrationViewportTarget(container, dbMigrationShots[i].id) ?? previous;
  return dbMigrationMix(
    previous,
    dbMigrationViewportTarget(container, shot) ?? previous,
    dbMigrationEase(tick, 8, 68),
  );
};
export const dbMigrationIsOverview = (shot: string) =>
  ["intro", "collect", "execute", "verify", "outro"].includes(shot);
export const dbMigrationCamera = (shot: string): DbMigrationPose => {
  if (dbMigrationIsOverview(shot) || shot === "mapping")
    return { x: 1450, y: 700, zoom: 0.6 };
  if (shot === "source") return { x: 600, y: 350, zoom: 1.1 };
  if (shot === "target") return { x: 2200, y: 350, zoom: 1.1 };
  return { x: 1370, y: 1190.5, zoom: 1.5 };
};
export const dbMigrationNoteSide = (
  shot: string,
): "top" | "bottom" | "left" | "right" =>
  dbMigrationIsOverview(shot)
    ? "top"
    : shot === "source"
      ? "left"
      : shot === "target"
        ? "right"
        : "bottom";
