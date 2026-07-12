import React from "react";
import type { StackItemKind } from "../flow/FlowStore";
import "./contextStack.css";

export type StackItemView = {
  id: string;
  label: string;
  kind: StackItemKind;
  tokenText: string | null;
  // Overrides the kind's background (e.g. abstract colored chat blocks).
  colorClassName: string | null;
  growFrac: number;
  opacity: number;
};

// Slot height = item height + its vertical margins. The slot's height is
// scaled by growFrac during a push, which lifts everything above it.
const SLOT_HEIGHT = 24;
const SLOT_HEIGHT_MINI = 17;

// Geometry constants, kept in sync with contextStack.css, so other layers
// (e.g. the magnifier cone lines) can know the stack's current bounds.
export const CONTEXT_STACK_WIDTH = 150;
const TOTAL_LINE_HEIGHT = 21;
const TITLE_LINE_HEIGHT = 25;
const BORDERS_HEIGHT = 4;

export const contextStackBodyHeightOf = (
  growFracs: number[],
  isTotalShown: boolean,
): number => {
  const slotSum = growFracs.reduce(
    (sum, growFrac) => sum + growFrac * SLOT_HEIGHT,
    0,
  );
  return (
    BORDERS_HEIGHT +
    (isTotalShown ? TOTAL_LINE_HEIGHT : 0) +
    slotSum +
    TITLE_LINE_HEIGHT
  );
};

const itemKindClassOf = (kind: StackItemKind): string => {
  if (kind === "json") {
    return "context-stack-item-json";
  }
  if (kind === "system") {
    return "context-stack-item-system";
  }
  return "";
};

export const ContextStack: React.FC<{
  title: string;
  items: StackItemView[];
  tokenTotalText?: string | null;
  isMini?: boolean;
  className?: string;
}> = ({
  title,
  items,
  tokenTotalText = null,
  isMini = false,
  className = "",
}) => {
  const slotHeight = isMini ? SLOT_HEIGHT_MINI : SLOT_HEIGHT;
  const miniTag = isMini ? "-mini" : "";
  return (
    <div className={`context-stack context-stack${miniTag}-size ${className}`}>
      {tokenTotalText !== null ? (
        <div className={`context-stack-total context-stack-total${miniTag}-size`}>
          {tokenTotalText}
        </div>
      ) : null}
      {items.map((item) => (
        <div
          key={item.id}
          className="context-stack-item-slot"
          style={{ height: item.growFrac * slotHeight }}
        >
          <div
            className={`context-stack-item context-stack-item${miniTag}-size ${itemKindClassOf(item.kind)} ${item.colorClassName ?? ""}`}
            style={{ opacity: item.opacity }}
          >
            <div className="context-stack-item-label">{item.label}</div>
            {item.tokenText !== null ? (
              <div
                className={
                  item.kind === "json"
                    ? "context-stack-item-token-json"
                    : "context-stack-item-token"
                }
              >
                {item.tokenText}
              </div>
            ) : null}
          </div>
        </div>
      ))}
      <div className={`context-stack-title context-stack-title${miniTag}-size`}>
        {title}
      </div>
    </div>
  );
};
