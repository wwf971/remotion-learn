import React from "react";
import type { DiagramPoint } from "../diagram/diagramGeometry";
import "./tokenFlow.css";

// Running total of LLM traffic. anchor is the bottom center of the block.
export const TokenCounter: React.FC<{
  anchor: DiagramPoint;
  usdText: string;
  tokensOutText: string;
  tokensInText: string;
}> = ({ anchor, usdText, tokensOutText, tokensInText }) => {
  return (
    <div className="token-counter" style={{ left: anchor.x, top: anchor.y }}>
      <div className="token-counter-body">
        <div className="token-counter-usd">{usdText}</div>
        <div className="token-counter-line">{tokensOutText}</div>
        <div className="token-counter-line">{tokensInText}</div>
      </div>
    </div>
  );
};
