import type { DiagramPoint, DiagramRect } from "./diagramGeometry";
import type {
  ArrowEndConfig,
  DiagramArrowConfig,
  DiagramConfig,
  DiagramEdge,
  DiagramNodeConfig,
} from "./diagramConfig";

// Parsing layer: turns id/edge/frac configs into concrete coordinates at run time.

export type ArrowLine = {
  from: DiagramPoint;
  to: DiagramPoint;
};

export const edgePointOf = (
  rect: DiagramRect,
  edge: DiagramEdge,
  frac: number,
): DiagramPoint => {
  if (edge === "top") {
    return { x: rect.x + rect.width * frac, y: rect.y };
  }
  if (edge === "bottom") {
    return { x: rect.x + rect.width * frac, y: rect.y + rect.height };
  }
  if (edge === "left") {
    return { x: rect.x, y: rect.y + rect.height * frac };
  }
  return { x: rect.x + rect.width, y: rect.y + rect.height * frac };
};

export const nodeByIdOf = (
  config: DiagramConfig,
): Map<string, DiagramNodeConfig> =>
  new Map(config.nodes.map((node) => [node.id, node]));

export const arrowByIdOf = (
  config: DiagramConfig,
): Map<string, DiagramArrowConfig> =>
  new Map(config.arrows.map((arrow) => [arrow.id, arrow]));

const arrowEndPointOf = (
  end: ArrowEndConfig,
  nodeById: Map<string, DiagramNodeConfig>,
): DiagramPoint => {
  const node = nodeById.get(end.nodeId);
  if (!node) {
    throw new Error(`arrow end refers to unknown node: ${end.nodeId}`);
  }
  return edgePointOf(node.rect, end.edge, end.frac);
};

export const arrowLineOf = (
  arrow: DiagramArrowConfig,
  nodeById: Map<string, DiagramNodeConfig>,
): ArrowLine => ({
  from: arrowEndPointOf(arrow.from, nodeById),
  to: arrowEndPointOf(arrow.to, nodeById),
});

export const pointAlongLine = (
  line: ArrowLine,
  progress: number,
): DiagramPoint => ({
  x: line.from.x + (line.to.x - line.from.x) * progress,
  y: line.from.y + (line.to.y - line.from.y) * progress,
});
