import React from "react";

export const DbMigrationColors = {
  bg: "#f3f6fa",
  panel: "#ffffff",
  ink: "#182a42",
  muted: "#52657c",
  source: "#1769aa",
  target: "#087d68",
  plan: "#7351ae",
  warning: "#9b6009",
  error: "#cc3747",
  line: "#cbd6e2",
};
const C = DbMigrationColors;
export const DbMigrationText: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  anchor?: "start" | "middle" | "end";
}> = ({
  x,
  y,
  children,
  size = 28,
  color = C.ink,
  weight = 400,
  anchor = "start",
}) => (
  <text
    x={x}
    y={y}
    fill={color}
    fontSize={size}
    fontWeight={weight}
    textAnchor={anchor}
  >
    {children}
  </text>
);

export const DbMigrationPanel: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  eyebrow: string;
  color?: string;
  major?: boolean;
  children: React.ReactNode;
}> = ({
  x,
  y,
  width,
  height,
  title,
  eyebrow,
  color = C.plan,
  major = false,
  children,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect
      width={width}
      height={height}
      rx={24}
      data-db-panel={title}
      fill={
        major
          ? color === C.source
            ? "#e3eefb"
            : color === C.target
              ? "#e0f1eb"
              : "#eee6f8"
          : C.panel
      }
      stroke={major ? color : C.line}
      strokeWidth={major ? 3 : 2}
    />
    <rect x={0} y={34} width={5} height={58} rx={2} fill={color} />
    <DbMigrationText x={32} y={43} size={20} color={color} weight={700}>
      {eyebrow}
    </DbMigrationText>
    <DbMigrationText x={32} y={88} size={36} weight={700}>
      {title}
    </DbMigrationText>
    <line x1={32} y1={115} x2={width - 32} y2={115} stroke={C.line} />
    {children}
  </g>
);

export type DbMigrationField = {
  name: string;
  logical: string;
  type: string;
  lookup?: boolean;
};
export const DbMigrationSchemaTable: React.FC<{
  x: number;
  y: number;
  width: number;
  title: string;
  logical: string;
  fields: DbMigrationField[];
  color: string;
  active?: number;
  highlightPosition?: number;
  side?: "left" | "right";
  rowProgress?: number[];
}> = ({
  x,
  y,
  width,
  title,
  logical,
  fields,
  color,
  active = -1,
  highlightPosition,
  side,
  rowProgress,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect
      width={width}
      data-db-schema="true"
      height={
        112 + (rowProgress?.reduce((a, b) => a + b, 0) ?? fields.length) * 72
      }
      rx={14}
      fill={C.bg}
      stroke={color}
      strokeOpacity={0.55}
      strokeWidth={2}
    />
    <DbMigrationText x={22} y={40} size={30} weight={700} color={color}>
      {title}
    </DbMigrationText>
    <DbMigrationText x={22} y={72} size={21} color={C.muted}>
      {logical}
    </DbMigrationText>
    <DbMigrationText x={22} y={102} size={18} color={C.muted}>
      名称 / 論理名・物理名
    </DbMigrationText>
    <DbMigrationText
      x={width - 18}
      y={102}
      size={18}
      color={C.muted}
      anchor="end"
    >
      型
    </DbMigrationText>
    {active >= 0 && (
      <rect
        data-db-highlight="true"
        opacity={rowProgress?.[active] ?? 1}
        x={1}
        y={112 + (highlightPosition ?? active) * 72}
        width={width - 2}
        height={71}
        fill={`${color}40`}
      />
    )}
    {fields.map((f, i) => (
      <g
        key={f.logical}
        transform={`translate(0 ${112 + i * 72})`}
        opacity={
          (f.lookup && active !== i ? 0.55 : 1) * (rowProgress?.[i] ?? 1)
        }
      >
        <rect
          data-db-schema-row={i}
          x={1}
          width={width - 2}
          height={71}
          fill="transparent"
        />
        <line x1={12} x2={width - 12} y1={0} y2={0} stroke={C.line} />
        <DbMigrationText x={22} y={29} size={24} weight={600}>
          {f.name}
        </DbMigrationText>
        <DbMigrationText x={22} y={56} size={19} color={C.muted}>
          {f.logical}
        </DbMigrationText>
        <DbMigrationText
          x={width - 18}
          y={42}
          size={21}
          color={f.lookup ? C.warning : color}
          anchor="end"
        >
          {f.type}
        </DbMigrationText>
        {side && (
          <circle
            cx={side === "left" ? 0 : width}
            cy={36}
            r={7}
            fill={C.bg}
            stroke={color}
            strokeWidth={3}
          />
        )}
      </g>
    ))}
  </g>
);

// The visible stroke and traveling marker share this exact orthogonal polyline.
export const dbMigrationRoute = (
  from: [number, number],
  to: [number, number],
  bend = 0,
): [number, number][] => {
  const middle = (from[0] + to[0]) / 2 + bend;
  return [from, [middle, from[1]], [middle, to[1]], to];
};
export const dbMigrationPointOnRoute = (
  points: [number, number][],
  progress: number,
): [number, number] => {
  const lengths = points
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  let remaining =
    Math.max(0, Math.min(1, progress)) * lengths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] && lengths[i] > 0) {
      const t = remaining / lengths[i];
      return [
        points[i][0] + (points[i + 1][0] - points[i][0]) * t,
        points[i][1] + (points[i + 1][1] - points[i][1]) * t,
      ];
    }
    remaining -= lengths[i];
  }
  return points[points.length - 1];
};
export const DbMigrationConnection: React.FC<{
  from: [number, number];
  to: [number, number];
  color?: string;
  progress?: number;
  label?: string;
  dashed?: boolean;
  bend?: number;
  travel?: number;
  erase?: number;
  queryId?: string;
}> = ({
  from,
  to,
  color = C.target,
  progress = 1,
  label,
  dashed = false,
  bend = 0,
  travel,
  erase = 0,
  queryId,
}) => {
  const points = dbMigrationRoute(from, to, bend);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`)
    .join(" ");
  const tail = Math.min(erase, progress);
  const marker = dbMigrationPointOnRoute(
    points,
    tail + (travel ?? 0) * (progress - tail),
  );
  const routeMidpoint = dbMigrationPointOnRoute(points, 0.5);
  // Query labels sit above the entire route, never on its stroke or handles.
  const labelPoint: [number, number] = queryId
    ? [routeMidpoint[0], Math.min(from[1], to[1]) - 44]
    : routeMidpoint;
  return (
    <g opacity={progress > tail ? 1 : 0}>
      <path
        d={d}
        stroke={color}
        strokeWidth={3}
        fill="none"
        pathLength={dashed ? undefined : 1}
        strokeDasharray={dashed ? "10 8" : `${Math.max(0, progress - tail)} 2`}
        strokeDashoffset={dashed ? 0 : -tail}
      />
      {tail === 0 && <circle cx={from[0]} cy={from[1]} r={5} fill={color} />}
      {queryId && (
        <circle
          data-db-query={queryId}
          cx={routeMidpoint[0]}
          cy={routeMidpoint[1]}
          r={2}
          fill="transparent"
        />
      )}
      {progress >= 1 && <circle cx={to[0]} cy={to[1]} r={6} fill={color} />}
      {label && (
        <g opacity={tail < 0.5 ? progress : 0}>
          <rect
            data-db-operator={label}
            x={labelPoint[0] - 106}
            y={labelPoint[1] - 22}
            width={212}
            height={44}
            rx={10}
            fill="white"
            stroke={color}
          />
          <DbMigrationText
            x={labelPoint[0]}
            y={labelPoint[1] + 8}
            size={21}
            anchor="middle"
            color={color}
          >
            {label}
          </DbMigrationText>
        </g>
      )}
      {travel !== undefined && (
        <circle
          cx={marker[0]}
          cy={marker[1]}
          r={9}
          fill={color}
          stroke="white"
          strokeWidth={3}
        />
      )}
    </g>
  );
};

export const DbMigrationGrid: React.FC<{
  x: number;
  y: number;
  width: number;
  headers: string[];
  rows: string[][];
  widths?: number[];
  highlight?: number;
  color?: string;
  rowHeight?: number;
}> = ({
  x,
  y,
  width,
  headers,
  rows,
  widths,
  highlight = -1,
  color = C.target,
  rowHeight = 62,
}) => {
  const ws = widths ?? headers.map(() => width / headers.length);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={width} height={48} rx={8} fill="#e4ecf4" />
      {headers.map((h, i) => (
        <DbMigrationText
          key={h}
          x={16 + ws.slice(0, i).reduce((a, b) => a + b, 0)}
          y={32}
          size={22}
          color={C.muted}
        >
          {h}
        </DbMigrationText>
      ))}
      {rows.map((row, i) => (
        <g key={i} transform={`translate(0 ${48 + i * rowHeight})`}>
          <rect
            data-db-row={i}
            width={width}
            height={rowHeight}
            fill={i === highlight ? `${color}20` : "transparent"}
          />
          <line
            x1={0}
            x2={width}
            y1={rowHeight}
            y2={rowHeight}
            stroke={C.line}
          />
          {row.map((cell, j) => (
            <DbMigrationText
              key={j}
              x={16 + ws.slice(0, j).reduce((a, b) => a + b, 0)}
              y={rowHeight / 2 + 9}
              size={24}
              color={i === highlight ? color : C.ink}
            >
              {cell}
            </DbMigrationText>
          ))}
        </g>
      ))}
    </g>
  );
};

export const DbMigrationNode: React.FC<{
  x: number;
  y: number;
  width?: number;
  title: string;
  subtitle: string;
  color?: string;
  active?: boolean;
}> = ({
  x,
  y,
  width = 270,
  title,
  subtitle,
  color = C.target,
  active = true,
}) => (
  <g transform={`translate(${x} ${y})`} opacity={active ? 1 : 0.35}>
    <rect
      width={width}
      data-db-node={title}
      height={110}
      rx={16}
      fill={C.bg}
      stroke={color}
      strokeWidth={2}
    />
    <DbMigrationText
      x={width / 2}
      y={44}
      size={29}
      weight={700}
      color={color}
      anchor="middle"
    >
      {title}
    </DbMigrationText>
    <DbMigrationText
      x={width / 2}
      y={82}
      size={22}
      color={C.muted}
      anchor="middle"
    >
      {subtitle}
    </DbMigrationText>
  </g>
);
