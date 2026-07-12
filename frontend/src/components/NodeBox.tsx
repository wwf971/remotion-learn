import React from "react";
import type { DiagramRect } from "../diagram/diagramGeometry";
import "./diagram.css";

export const NodeBox: React.FC<{
  rect: DiagramRect;
  label: string;
  className: string;
  isLabelAtTop?: boolean;
  opacity?: number;
}> = ({ rect, label, className, isLabelAtTop = false, opacity = 1 }) => {
  return (
    <div
      className={`node-box ${className} ${isLabelAtTop ? "node-box-align-top" : ""}`}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        opacity,
      }}
    >
      <div className="node-box-label">{label}</div>
    </div>
  );
};
