import { dbMigrationEase } from "./DbMigrationLayout";

// Two read → write → append → operator cycles, shared by the world and plan.
export const dbMigrationMappingMotion = (tick: number) => {
  const cycle = tick < 320 ? 0 : 1;
  const local = tick - (cycle === 0 ? 65 : 320);
  const fade = 1 - dbMigrationEase(local, 210, 230);
  return {
    row: tick < 65 ? 0 : cycle + 1,
    pairSlide: dbMigrationEase(tick, 295, 320),
    read: tick < 65 ? 1 : dbMigrationEase(local, 0, 75),
    write: dbMigrationEase(local, 85, 115),
    opacity: 1,
    erase: tick < 65 ? dbMigrationEase(tick, 25, 50) : 1 - fade,
    highlight: dbMigrationEase(tick, 35, 60) + dbMigrationEase(tick, 295, 320),
    travel: Math.max(0, local % 40) / 40,
    rows: [1, dbMigrationEase(tick, 185, 210), dbMigrationEase(tick, 440, 465)],
    operators: [
      1,
      dbMigrationEase(tick, 215, 245),
      dbMigrationEase(tick, 470, 500),
    ],
  };
};

// Introductions share a fixed row and an already-established connection. Only
// mapping owns row motion; its start/end positions match adjacent shots exactly.
export const dbMigrationReadMotion = (shot: string, tick: number) => {
  if (shot === "mapping") return dbMigrationMappingMotion(tick);
  const introduction = ["intro", "collect", "source", "target"].includes(shot);
  return {
    row: introduction ? 0 : 2,
    read: shot === "collect" ? dbMigrationEase(tick, 15, 45) : 1,
    opacity: 1,
    erase: 0,
    highlight: introduction ? 0 : 2,
  };
};
