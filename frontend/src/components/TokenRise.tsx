import React from "react";
import type { DiagramPoint } from "../diagram/diagramGeometry";
import "./tokenFlow.css";

export const TokenRise: React.FC<{
  pos: DiagramPoint;
  text: string;
  opacity: number;
}> = ({ pos, text, opacity }) => {
  return (
    <div
      className="token-rise"
      style={{ left: pos.x, top: pos.y, opacity }}
    >
      <div className="token-rise-text">{text}</div>
    </div>
  );
};
