import React, { useRef } from "react";
import { useDbMigrationSelection } from "./DbMigrationSelection";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { DbMigrationColors as C } from "./DbMigrationPrimitives";
import { DbMigrationWorld } from "./DbMigrationWorld";
import {
  DbMigrationCallout,
  dbMigrationCalloutLayout,
} from "./DbMigrationCallout";
import {
  dbMigrationCamera,
  dbMigrationMix,
  dbMigrationEase,
  dbMigrationNoteSide,
} from "./DbMigrationLayout";
import {
  DB_MIGRATION_FPS,
  dbMigrationShots,
  DbMigrationPhase,
} from "./DbMigrationTimeline";
export type DbMigrationVideoProps = { phase?: DbMigrationPhase };
const phases = [
  { id: "plan", label: "01  計画" },
  { id: "execute", label: "02  実行" },
  { id: "verify", label: "03  検証" },
];
const fontFamily =
  '"Hiragino Sans", "Yu Gothic", "Noto Sans CJK JP", "Meiryo", sans-serif';
const documentCamera = { x: 1370, y: 1190.5, zoom: 1.5 };
// The end pose is also the next shot's starting pose; transitions never reset the camera.
const endCamera = (id: string) =>
  ["mapping", "transform"].includes(id)
    ? documentCamera
    : dbMigrationCamera(id);

export const DbMigrationVideo: React.FC<DbMigrationVideoProps> = ({
  phase,
}) => {
  const frame = useCurrentFrame();
  const shots = dbMigrationShots.filter((s) => !phase || s.phase === phase);
  let start = 0,
    index = 0;
  for (let i = 0; i < shots.length; i++) {
    if (
      frame < start + shots[i].seconds * DB_MIGRATION_FPS ||
      i === shots.length - 1
    ) {
      index = i;
      break;
    }
    start += shots[i].seconds * DB_MIGRATION_FPS;
  }
  const shot = shots[index],
    tick = frame - start;
  const previous = shots[Math.max(0, index - 1)];
  const goal =
    shot.id === "transform" ? documentCamera : dbMigrationCamera(shot.id);
  let camera = dbMigrationMix(
    endCamera(previous.id),
    goal,
    dbMigrationEase(tick, 0, 60),
  );
  if (shot.id === "mapping")
    camera = dbMigrationMix(
      camera,
      documentCamera,
      dbMigrationEase(tick, 150, 180) * (1 - dbMigrationEase(tick, 260, 300)) +
        dbMigrationEase(tick, 405, 435),
    );
  const side = dbMigrationNoteSide(shot.id);
  // The scene fills the frame; annotations overlay it instead of reserving a gutter.
  const centerX = 960;
  const centerY = 600;
  const sectionOpacity = shot.section
    ? dbMigrationEase(tick, 0, 12) * (1 - dbMigrationEase(tick, 56, 82))
    : 0;
  const phaseShots = shots.filter((s) => s.phase === shot.phase);
  const phaseIndex = phaseShots.findIndex((s) => s.id === shot.id);
  const phaseFrame =
    phaseShots.slice(0, phaseIndex).reduce((n, s) => n + s.seconds * 30, 0) +
    tick;
  const phaseDuration = phaseShots.reduce((n, s) => n + s.seconds * 30, 0);
  const root = useRef<HTMLDivElement>(null);
  const selection = useDbMigrationSelection(root, shot.id, frame, tick);
  const rect = selection?.rect;
  const annotation = rect
    ? dbMigrationCalloutLayout(rect, side, shot.id)
    : null;
  const noteDelay =
    shot.id === "mapping" ? 500 : ["retry", "dlq"].includes(shot.id) ? 155 : 0;
  const noteReveal =
    dbMigrationEase(tick, 130 + noteDelay, 170 + noteDelay) *
    (1 - dbMigrationEase(tick, shot.seconds * 30 - 16, shot.seconds * 30 - 1));
  return (
    <AbsoluteFill
      ref={root}
      style={{ background: C.bg, color: C.ink, fontFamily }}
    >
      <AbsoluteFill style={{ filter: `blur(${sectionOpacity * 10}px)` }}>
        <svg
          width={1920}
          height={1080}
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <filter
              id="DbMigrationAnnotationFeather"
              x="-20%"
              y="-30%"
              width="140%"
              height="160%"
            >
              <feGaussianBlur stdDeviation={18} />
            </filter>
            <mask
              id="DbMigrationAnnotationFocus"
              maskUnits="userSpaceOnUse"
              x={0}
              y={0}
              width={1920}
              height={1080}
            >
              <rect width={1920} height={1080} fill="white" />
              {annotation && (
                <rect
                  x={annotation.left - 4}
                  y={annotation.top - 4}
                  width={annotation.width + 8}
                  height={(selection?.noteHeight ?? 0) + 8}
                  rx={12}
                  fill="black"
                  opacity={noteReveal * 0.94}
                  filter="url(#DbMigrationAnnotationFeather)"
                />
              )}
              {rect && <rect {...rect} fill="white" />}
            </mask>
            <pattern
              id="DbMigrationDots"
              width={32}
              height={32}
              patternUnits="userSpaceOnUse"
            >
              <circle cx={1} cy={1} r={1} fill="#d3dde7" />
            </pattern>
            <clipPath id="DbMigrationStage">
              <rect x={0} y={155} width={1920} height={900} />
            </clipPath>
          </defs>
          <rect width={1920} height={1080} fill="url(#DbMigrationDots)" />
          <g
            clipPath="url(#DbMigrationStage)"
            mask="url(#DbMigrationAnnotationFocus)"
          >
            <g
              transform={`translate(${centerX} ${centerY}) scale(${camera.zoom}) translate(${-camera.x} ${-camera.y})`}
            >
              <DbMigrationWorld shot={shot.id} tick={tick} />
            </g>
          </g>
        </svg>
        {rect && (
          <DbMigrationCallout
            shot={shot.id}
            tick={tick}
            duration={shot.seconds * 30}
            side={side}
            caption={shot.caption}
            detail={shot.detail}
            rect={rect}
            branches={selection?.branches}
            pointOnly={shot.id === "transform"}
            delay={noteDelay}
          />
        )}
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 155,
          background: "#f3f6faf5",
          borderBottom: `1px solid ${C.line}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          top: 22,
          display: "flex",
          gap: 26,
        }}
      >
        {phases.map((p, i) => {
          const current = p.id === shot.phase;
          const done = i < phases.findIndex((v) => v.id === shot.phase);
          return (
            <div key={p.id} style={{ flex: 1, opacity: current ? 1 : 0.5 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 23,
                  marginBottom: 10,
                  color: current ? C.plan : C.muted,
                }}
              >
                <span>{p.label}</span>
                {current && (
                  <span>
                    {phaseIndex + 1} / {phaseShots.length}
                  </span>
                )}
              </div>
              <div style={{ height: 5, background: C.line }}>
                <div
                  style={{
                    height: 5,
                    width: `${done ? 100 : current ? (phaseFrame / phaseDuration) * 100 : 0}%`,
                    background: C.plan,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 93,
          fontSize: 32,
          fontWeight: 650,
        }}
      >
        {shot.title}
      </div>
      <div
        style={{
          position: "absolute",
          right: 64,
          top: 100,
          fontSize: 20,
          color: C.muted,
        }}
      >
        データベース移行の設計
      </div>
      {shot.section && (
        <AbsoluteFill
          style={{
            opacity: sectionOpacity,
            background: "#f3f6fabd",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: 25,
              color: C.plan,
              letterSpacing: 7,
              marginBottom: 26,
            }}
          >
            データベース移行の設計
          </div>
          <div style={{ fontSize: 82, fontWeight: 700 }}>{shot.title}</div>
          <div style={{ fontSize: 31, color: C.muted, marginTop: 30 }}>
            {shot.caption}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
