import React from "react";
import { NodeBox } from "./NodeBox";
import { DiagramArrow } from "./DiagramArrow";
import type { DiagramConfig } from "../diagram/diagramConfig";
import { arrowLineOf, nodeByIdOf } from "../diagram/diagramResolve";
import "./diagram.css";

// Renders a whole diagram from its config. Coordinates of arrow ends are
// resolved here (parsing layer), not stored in the config.
export const DiagramBase: React.FC<{
  config: DiagramConfig;
  width: number;
  height: number;
  dashSpeedPxPerFrame?: number;
  nodeOpacityOf?: (nodeId: string) => number;
  arrowOpacityOf?: (arrowId: string) => number;
}> = ({
  config,
  width,
  height,
  dashSpeedPxPerFrame = 0,
  nodeOpacityOf,
  arrowOpacityOf,
}) => {
  const nodeById = nodeByIdOf(config);
  return (
    <>
      {config.nodes.map((node) => (
        <NodeBox
          key={node.id}
          rect={node.rect}
          label={node.label}
          className={node.className}
          isLabelAtTop={node.isLabelAtTop}
          opacity={nodeOpacityOf ? nodeOpacityOf(node.id) : 1}
        />
      ))}
      <svg className="diagram-arrow-layer" width={width} height={height}>
        {config.arrows.map((arrow) => {
          const line = arrowLineOf(arrow, nodeById);
          return (
            <DiagramArrow
              key={arrow.id}
              from={line.from}
              to={line.to}
              hasStartHead={arrow.hasStartHead}
              hasEndHead={arrow.hasEndHead ?? true}
              isDashed={arrow.isDashed}
              dashSpeedPxPerFrame={arrow.isDashed ? dashSpeedPxPerFrame : 0}
              opacity={arrowOpacityOf ? arrowOpacityOf(arrow.id) : 1}
            />
          );
        })}
      </svg>
    </>
  );
};
