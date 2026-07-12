import React from "react";
import type { DiagramPoint } from "../diagram/diagramGeometry";
import { ContextStack, type StackItemView } from "./ContextStack";
import "./contextStack.css";

// Distance between the anchor point and the stack body's bottom edge,
// kept in sync with .stack-tooltip-body in contextStack.css.
export const STACK_TOOLTIP_BODY_GAP = 11;

// A context stack floating above a node, tied to it by a triangle pointer.
// The stack body is anchored by its bottom edge, so pushing a new item
// moves the top edge up while the bottom edge stays at the pointer.
export const ContextStackTooltip: React.FC<{
  anchor: DiagramPoint;
  title: string;
  items: StackItemView[];
  tokenTotalText?: string | null;
  className?: string;
}> = ({ anchor, title, items, tokenTotalText = null, className = "" }) => {
  return (
    <div
      className="stack-tooltip"
      style={{ left: anchor.x, top: anchor.y }}
    >
      <div className="stack-tooltip-pointer" />
      <div className="stack-tooltip-body">
        <ContextStack
          title={title}
          items={items}
          tokenTotalText={tokenTotalText}
          className={className}
        />
      </div>
    </div>
  );
};
