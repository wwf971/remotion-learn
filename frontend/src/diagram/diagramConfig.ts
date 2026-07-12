import type { DiagramRect } from "./diagramGeometry";

export type DiagramEdge = "top" | "bottom" | "left" | "right";

// One end of an arrow: which node it attaches to, and where on that node's edge.
// frac runs along the edge: 0 = left/top corner, 1 = right/bottom corner.
// e.g. { nodeId: "user", edge: "left", frac: 1 / 3 } is 1/3 down the left edge.
export type ArrowEndConfig = {
  nodeId: string;
  edge: DiagramEdge;
  frac: number;
};

export type DiagramNodeConfig = {
  id: string;
  label: string;
  rect: DiagramRect;
  className: string;
  isLabelAtTop?: boolean;
};

export type DiagramArrowConfig = {
  id: string;
  from: ArrowEndConfig;
  to: ArrowEndConfig;
  lineKind: "straight";
  hasStartHead?: boolean;
  hasEndHead?: boolean;
  isDashed?: boolean;
};

export type DiagramConfig = {
  nodes: DiagramNodeConfig[];
  arrows: DiagramArrowConfig[];
};
