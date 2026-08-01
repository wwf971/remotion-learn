import React from "react";
import { DbMigrationColors as C } from "./DbMigrationPrimitives";
import { dbMigrationEase } from "./DbMigrationLayout";

export const dbMigrationCalloutLayout = (
  rect: { x: number; y: number; width: number; height: number },
  side: string,
  shot = "",
) => {
  // One shared origin owns text AND arrow endpoint. The endpoint is always 12px
  // before the first glyph, independent of wrapping, box width or text alignment.
  const rightSpace = 1856 - rect.x - rect.width;
  const beside = rightSpace > 480 && side !== "top";
  let width = beside ? Math.min(600, rightSpace - 60) : 720;
  let left = beside
    ? rect.x + rect.width + 48
    : Math.max(64, Math.min(1856 - width, rect.x + rect.width * 0.48));
  let top = beside
    ? Math.max(195, Math.min(800, rect.y - 85))
    : rect.y > 520
      ? rect.y - 220
      : Math.min(820, rect.y + rect.height + 40);
  // Authored quiet regions take priority over generic placement near the target.
  if (side === "top") {
    left = 1260;
    top = 650;
    width = 580;
  }
  if (["source", "target"].includes(shot)) {
    left = shot === "source" ? 350 : 680;
    top = 350;
    width = 830;
  }
  if (
    [
      "tables",
      "ranks",
      "cycles",
      "execution-report",
      "dispatch",
      "identity",
      "batches",
      "seal",
      "compare",
      "report",
      "reconcile",
    ].includes(shot)
  ) {
    left = 850;
    top = 265;
    width = 790;
  }
  if (["retry", "dlq"].includes(shot)) {
    left = 850;
    top = 265;
    width = 790;
  }
  const end: [number, number] = [left - 12, top + 24];
  return { beside, width, left, top, end };
};

export const DbMigrationCallout: React.FC<{
  shot: string;
  tick: number;
  duration: number;
  side: "left" | "right" | "top" | "bottom";
  caption: string;
  detail: string;
  rect: { x: number; y: number; width: number; height: number };
  branches?: [number, number][];
  pointOnly?: boolean;
  delay?: number;
}> = ({
  shot,
  branches = [],
  tick,
  duration,
  side,
  caption,
  detail,
  rect,
  pointOnly = false,
  delay = 0,
}) => {
  const fade = 1 - dbMigrationEase(tick, duration - 16, duration - 1);
  const selection = dbMigrationEase(tick, 72 + delay, 96 + delay);
  const arrow = dbMigrationEase(tick, 96 + delay, 128 + delay);
  const reveal = dbMigrationEase(tick, 130 + delay, 170 + delay);
  const { width, left, top, end } = dbMigrationCalloutLayout(rect, side, shot);
  // Exit the selected edge along its outward normal before making any turn.
  const above = top + 180 < rect.y;
  const below = top > rect.y + rect.height;
  const exitSide = ["retry", "dlq"].includes(shot)
    ? "left"
    : above
      ? "top"
      : below
        ? "bottom"
        : left > rect.x + rect.width
          ? "right"
          : "left";
  const start: [number, number] =
    exitSide === "top" || exitSide === "bottom"
      ? [
          rect.x + rect.width * 0.5,
          exitSide === "top" ? rect.y : rect.y + rect.height,
        ]
      : [
          exitSide === "left" ? rect.x : rect.x + rect.width,
          rect.y + rect.height * 0.5,
        ];
  const normal: [number, number] =
    exitSide === "top"
      ? [0, -1]
      : exitSide === "bottom"
        ? [0, 1]
        : exitSide === "left"
          ? [-1, 0]
          : [1, 0];
  const elbow: [number, number] = [
    start[0] + normal[0] * 36,
    start[1] + normal[1] * 36,
  ];
  const junction: [number, number] = [left - 32, end[1]];
  const points: [number, number][] = [
    start,
    elbow,
    [junction[0], elbow[1]],
    junction,
    end,
  ];
  const paths = branches.length
    ? branches.map((p) => [p, [p[0], 620], [junction[0], 620], junction, end])
    : [points];
  const previous = points[points.length - 2];
  const angle =
    (Math.atan2(end[1] - previous[1], end[0] - previous[0]) * 180) / Math.PI;
  return (
    <div style={{ opacity: fade, pointerEvents: "none" }}>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0, overflow: "hidden" }}
      >
        {!pointOnly && (
          <rect
            {...rect}
            rx={8}
            fill={`${C.error}09`}
            stroke={C.error}
            strokeWidth={3}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - selection}
            opacity={selection}
          />
        )}
        {pointOnly && (
          <circle
            cx={start[0]}
            cy={start[1]}
            r={5 * selection}
            fill={C.error}
          />
        )}
        {paths.map((route, i) => (
          <path
            key={i}
            d={route
              .map((p, j) => `${j ? "L" : "M"} ${p[0]} ${p[1]}`)
              .join(" ")}
            fill="none"
            stroke={C.error}
            strokeWidth={2.5}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - arrow}
          />
        ))}
        {arrow === 1 && (
          <path
            d="M 0 0 L -11 -5 L -11 5 Z"
            fill={C.error}
            transform={`translate(${end[0]} ${end[1]}) rotate(${angle})`}
          />
        )}
      </svg>
      <div
        data-db-callout-text="true"
        style={{
          position: "absolute",
          left,
          top,
          width,
          color: "#aa283a",
          padding: 0,
          textShadow: "0 1px 3px #f3f6fa, 0 0 8px #f3f6fa",
          borderRadius: 8,
          clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`,
        }}
      >
        <div
          style={{
            fontSize: 32,
            lineHeight: 1.45,
            fontWeight: 650,
          }}
        >
          {caption}
        </div>
        <div
          style={{
            fontSize: 24,
            lineHeight: 1.5,
            color: "#b55d69",
            marginTop: 10,
          }}
        >
          {detail}
        </div>
      </div>
    </div>
  );
};
