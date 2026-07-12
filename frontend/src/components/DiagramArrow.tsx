import React from "react";
import { useCurrentFrame } from "remotion";
import type { DiagramPoint } from "../diagram/diagramGeometry";

const HEAD_LENGTH = 16;
const HEAD_WIDTH = 13;

export const DASH_LENGTH = 12;
export const DASH_GAP = 10;
// One full dash cycle in px. Keep (durationInFrames * dashSpeedPxPerFrame)
// a multiple of this for a seamless loop.
export const DASH_CYCLE_PX = DASH_LENGTH + DASH_GAP;

const buildHeadPoints = (tip: DiagramPoint, angle: number): string => {
  const baseX = tip.x - Math.cos(angle) * HEAD_LENGTH;
  const baseY = tip.y - Math.sin(angle) * HEAD_LENGTH;
  const perpX = Math.cos(angle + Math.PI / 2) * (HEAD_WIDTH / 2);
  const perpY = Math.sin(angle + Math.PI / 2) * (HEAD_WIDTH / 2);
  return [
    `${tip.x},${tip.y}`,
    `${baseX + perpX},${baseY + perpY}`,
    `${baseX - perpX},${baseY - perpY}`,
  ].join(" ");
};

export const DiagramArrow: React.FC<{
  from: DiagramPoint;
  to: DiagramPoint;
  hasStartHead?: boolean;
  hasEndHead?: boolean;
  isDashed?: boolean;
  dashSpeedPxPerFrame?: number;
  color?: string;
  strokeWidth?: number;
  opacity?: number;
}> = ({
  from,
  to,
  hasStartHead = false,
  hasEndHead = true,
  isDashed = false,
  dashSpeedPxPerFrame = 0,
  color = "#222222",
  strokeWidth = 3,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  // Pull the line ends slightly back so the stroke does not poke out of the head tip.
  const trimmedFrom: DiagramPoint = hasStartHead
    ? {
        x: from.x + Math.cos(angle) * HEAD_LENGTH * 0.7,
        y: from.y + Math.sin(angle) * HEAD_LENGTH * 0.7,
      }
    : from;
  const trimmedTo: DiagramPoint = hasEndHead
    ? {
        x: to.x - Math.cos(angle) * HEAD_LENGTH * 0.7,
        y: to.y - Math.sin(angle) * HEAD_LENGTH * 0.7,
      }
    : to;

  // Negative offset makes the dashes travel from "from" towards "to".
  const dashOffset = isDashed ? -frame * dashSpeedPxPerFrame : undefined;

  return (
    <g opacity={opacity}>
      <line
        x1={trimmedFrom.x}
        y1={trimmedFrom.y}
        x2={trimmedTo.x}
        y2={trimmedTo.y}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={isDashed ? `${DASH_LENGTH} ${DASH_GAP}` : undefined}
        strokeDashoffset={dashOffset}
      />
      {hasStartHead ? (
        <polygon points={buildHeadPoints(from, angle + Math.PI)} fill={color} />
      ) : null}
      {hasEndHead ? (
        <polygon points={buildHeadPoints(to, angle)} fill={color} />
      ) : null}
    </g>
  );
};
