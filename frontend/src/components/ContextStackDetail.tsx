import React from "react";
import type { StackItemKind } from "../flow/FlowStore";
import "./contextStack.css";

export type StackDetailItemView = {
  id: string;
  label: string;
  kind: StackItemKind;
  detailText: string;
  growFrac: number;
  opacity: number;
};

// Geometry constants, kept in sync with contextStack.css.
const ITEM_MARGIN_Y = 4;
const ITEM_CHROME_Y = 8;
const LINE_HEIGHT = 15;

const detailSlotHeightOf = (detailText: string): number => {
  const lineNum = detailText.split("\n").length;
  return ITEM_MARGIN_Y + ITEM_CHROME_Y + LINE_HEIGHT + lineNum * LINE_HEIGHT;
};

const itemKindClassOf = (kind: StackItemKind): string => {
  if (kind === "json") {
    return "context-stack-detail-item-json";
  }
  if (kind === "system") {
    return "context-stack-detail-item-system";
  }
  return "";
};

// Magnified view of a context stack, showing each item's full text.
// Fixed height: the content is anchored to the bottom, so once items no
// longer fit, older ones move up and get clipped at the top edge.
export const ContextStackDetail: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  items: StackDetailItemView[];
}> = ({ x, y, width, height, title, items }) => {
  return (
    <div
      className="context-stack-detail"
      style={{ left: x, top: y, width, height }}
    >
      <div className="context-stack-detail-viewport">
        <div className="context-stack-detail-content">
          {items.map((item) => (
            <div
              key={item.id}
              className="context-stack-detail-slot"
              style={{
                height: item.growFrac * detailSlotHeightOf(item.detailText),
              }}
            >
              <div
                className={`context-stack-detail-item ${itemKindClassOf(item.kind)}`}
                style={{ opacity: item.opacity }}
              >
                <div className="context-stack-detail-item-head">
                  {item.label}
                </div>
                <div className="context-stack-detail-item-text">
                  {item.detailText}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="context-stack-detail-title">{title}</div>
    </div>
  );
};
