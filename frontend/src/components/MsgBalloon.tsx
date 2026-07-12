import React from "react";
import type { DiagramPoint } from "../diagram/diagramGeometry";
import type { HistoryDir, MsgBalloonSide, MsgKind } from "../flow/FlowStore";
import { ContextStack, type StackItemView } from "./ContextStack";
import "./msgFlow.css";

export type MsgStackView = {
  title: string;
  items: StackItemView[];
  tokenTotalText: string | null;
};

export type MsgHistoryBlockView = {
  id: string;
  text: string;
  colorClassName: string | null;
};

// Conversation history carried by a message: blocks styled like message
// bodies, stacked vertically (column) or concatenated as short colored
// blocks (row).
export type MsgHistoryView = {
  dir: HistoryDir;
  blocks: MsgHistoryBlockView[];
};

// A message balloon tied to a point on an arrow line by a thin string.
// side tells on which side of the line the balloon body floats.
// For kind "stack" the balloon carries a mini context stack instead of text;
// for kind "history" it carries history blocks.
export const MsgBalloon: React.FC<{
  anchor: DiagramPoint;
  side: MsgBalloonSide;
  text: string;
  kind: MsgKind;
  stackView?: MsgStackView | null;
  historyView?: MsgHistoryView | null;
  opacity: number;
}> = ({
  anchor,
  side,
  text,
  kind,
  stackView = null,
  historyView = null,
  opacity,
}) => {
  return (
    <div
      className="msg-balloon"
      style={{ left: anchor.x, top: anchor.y, opacity }}
    >
      <div className={`msg-balloon-string msg-balloon-string-${side}`} />
      {kind === "stack" && stackView ? (
        <div className={`msg-balloon-body msg-balloon-body-${side} msg-balloon-body-bare`}>
          <ContextStack
            title={stackView.title}
            items={stackView.items}
            tokenTotalText={stackView.tokenTotalText}
            isMini
          />
        </div>
      ) : kind === "history" && historyView ? (
        <div className={`msg-balloon-body msg-balloon-body-${side} msg-balloon-body-bare`}>
          <div className={`msg-history msg-history-${historyView.dir}`}>
            {historyView.blocks.map((block) => (
              <div
                key={block.id}
                className={`msg-history-block ${
                  block.colorClassName ?? "msg-history-block-plain"
                }`}
              >
                {block.text}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className={`msg-balloon-body msg-balloon-body-${side} ${
            kind === "json" ? "msg-balloon-body-json" : ""
          }`}
        >
          {text}
        </div>
      )}
    </div>
  );
};
