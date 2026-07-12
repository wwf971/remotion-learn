import React from "react";
import { observer } from "mobx-react-lite";
import { useCurrentFrame, useVideoConfig } from "remotion";
import {
  MsgBalloon,
  type MsgHistoryView,
  type MsgStackView,
} from "./MsgBalloon";
import {
  ContextStackTooltip,
  STACK_TOOLTIP_BODY_GAP,
} from "./ContextStackTooltip";
import {
  CONTEXT_STACK_WIDTH,
  contextStackBodyHeightOf,
  type StackItemView,
} from "./ContextStack";
import {
  ContextStackDetail,
  type StackDetailItemView,
} from "./ContextStackDetail";
import { TokenCounter } from "./TokenCounter";
import { TokenRise } from "./TokenRise";
import { SkillPanel, type SkillFileView } from "./SkillPanel";
import {
  tokenTextOf,
  type FlowStore,
  type StackItemConfig,
} from "../flow/FlowStore";
import { msgMotionSample } from "../flow/msgMotion";
import { stackPushMotionSample } from "../flow/stackMotion";
import { tokenRiseMotionSample } from "../flow/tokenMotion";
import type { DiagramConfig } from "../diagram/diagramConfig";
import {
  arrowByIdOf,
  arrowLineOf,
  edgePointOf,
  nodeByIdOf,
  pointAlongLine,
} from "../diagram/diagramResolve";

// A context stack pinned above a node. isTokenShown lets one stack opt out
// of token numbers (e.g. the user's view) while others show them.
export type StackViewConfig = {
  stackId: string;
  nodeId: string;
  title: string;
  className?: string;
  anchorFrac?: number;
  isTokenShown?: boolean;
};

// Token counter above a node; gapY is the distance between the node's top
// edge and the counter's bottom line. Token rises travel that gap.
export type TokenCounterViewConfig = {
  nodeId: string;
  gapY: number;
};

// Magnified view of one of the stackViews, placed at a fixed rect. Two cone
// lines connect the original stack's right edge to the detail panel's left
// edge, like a magnifier.
export type StackDetailViewConfig = {
  stackId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
};

export type SkillFileConfig = {
  id: string;
  label: string;
  depth: number;
  isDir?: boolean;
};

export type SkillPanelViewConfig = {
  x: number;
  y: number;
  width: number;
  title: string;
  files: SkillFileConfig[];
};

const RISE_START_DIP = 20;
const RISE_END_GAP = 8;

// Bridges the layers: the mobx store says which messages / stack pushes /
// token rises are on stage at this frame, gsap sampling says where exactly
// each one is inside its own life span.
export const FlowLayer: React.FC<{
  store: FlowStore;
  diagramConfig: DiagramConfig;
  stackViews?: StackViewConfig[];
  stackDetailView?: StackDetailViewConfig | null;
  counterView?: TokenCounterViewConfig | null;
  skillPanelView?: SkillPanelViewConfig | null;
  isTokenShown?: boolean;
}> = observer(
  ({
    store,
    diagramConfig,
    stackViews = [],
    stackDetailView = null,
    counterView = null,
    skillPanelView = null,
    isTokenShown = false,
  }) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();
    const nodeById = nodeByIdOf(diagramConfig);
    const arrowById = arrowByIdOf(diagramConfig);

    const nodeOf = (nodeId: string) => {
      const node = nodeById.get(nodeId);
      if (!node) {
        throw new Error(`flow layer refers to unknown node: ${nodeId}`);
      }
      return node;
    };

    const itemTokenTextOf = (item: StackItemConfig): string | null =>
      isTokenShown ? tokenTextOf(item.tokenNum) : null;

    const stackTotalTextOf = (tokenSum: number): string | null =>
      isTokenShown ? `${tokenTextOf(tokenSum)} tokens` : null;

    const pushMotionOf = (pushFrameStart: number) =>
      stackPushMotionSample(
        store.stackGrowLen,
        store.stackAppearLen,
        fps,
        frame - pushFrameStart,
      );

    return (
      <>
        {stackDetailView
          ? (() => {
              const view = stackViews.find(
                (stackView) => stackView.stackId === stackDetailView.stackId,
              );
              if (!view) {
                throw new Error(
                  `detail view refers to unknown stack: ${stackDetailView.stackId}`,
                );
              }
              const node = nodeOf(view.nodeId);
              const anchor = edgePointOf(
                node.rect,
                "top",
                view.anchorFrac ?? 0.5,
              );
              const isViewTokenShown =
                isTokenShown && (view.isTokenShown ?? true);
              const pushes = store.stackPushesAt(frame, view.stackId);
              const motions = pushes.map((push) =>
                pushMotionOf(push.frameStart),
              );
              const detailItems: StackDetailItemView[] = pushes.map(
                (push, index) => ({
                  id: push.item.id,
                  label: push.item.label,
                  kind: push.item.kind,
                  detailText: push.item.detailText ?? push.item.label,
                  growFrac: motions[index].growFrac,
                  opacity: motions[index].opacity,
                }),
              );
              // Cone lines clamp the original stack's right edge on one side
              // and the detail panel's left edge on the other.
              const bodyHeight = contextStackBodyHeightOf(
                motions.map((motion) => motion.growFrac),
                isViewTokenShown,
              );
              const edgeX = anchor.x + CONTEXT_STACK_WIDTH / 2;
              const bottomY = anchor.y - STACK_TOOLTIP_BODY_GAP;
              return (
                <>
                  <svg
                    className="diagram-arrow-layer"
                    width={width}
                    height={height}
                  >
                    <line
                      className="magnify-cone-line"
                      x1={edgeX}
                      y1={bottomY - bodyHeight}
                      x2={stackDetailView.x}
                      y2={stackDetailView.y}
                    />
                    <line
                      className="magnify-cone-line"
                      x1={edgeX}
                      y1={bottomY}
                      x2={stackDetailView.x}
                      y2={stackDetailView.y + stackDetailView.height}
                    />
                  </svg>
                  <ContextStackDetail
                    x={stackDetailView.x}
                    y={stackDetailView.y}
                    width={stackDetailView.width}
                    height={stackDetailView.height}
                    title={stackDetailView.title}
                    items={detailItems}
                  />
                </>
              );
            })()
          : null}

        {skillPanelView
          ? (() => {
              const readByFileId = new Map(
                store.fileReadsAt(frame).map((read) => [read.fileId, read]),
              );
              const files: SkillFileView[] = skillPanelView.files.map(
                (file) => {
                  const read = readByFileId.get(file.id);
                  const readOpacity = read
                    ? Math.min(
                        1,
                        (frame - read.frameStart) / store.fileReadLen,
                      )
                    : 0;
                  return {
                    id: file.id,
                    label: file.label,
                    depth: file.depth,
                    isDir: file.isDir ?? false,
                    readOpacity,
                  };
                },
              );
              return (
                <SkillPanel
                  x={skillPanelView.x}
                  y={skillPanelView.y}
                  width={skillPanelView.width}
                  title={skillPanelView.title}
                  files={files}
                />
              );
            })()
          : null}

        {stackViews.map((view) => {
          const isViewTokenShown = isTokenShown && (view.isTokenShown ?? true);
          const node = nodeOf(view.nodeId);
          const anchor = edgePointOf(node.rect, "top", view.anchorFrac ?? 0.5);
          const pushes = store.stackPushesAt(frame, view.stackId);
          let tokenSum = 0;
          const items: StackItemView[] = pushes.map((push) => {
            const motion = pushMotionOf(push.frameStart);
            if (frame >= push.frameEnd) {
              tokenSum += push.item.tokenNum;
            }
            return {
              id: push.item.id,
              label: push.item.label,
              kind: push.item.kind,
              tokenText: isViewTokenShown
                ? tokenTextOf(push.item.tokenNum)
                : null,
              colorClassName: push.item.colorClassName ?? null,
              growFrac: motion.growFrac,
              opacity: motion.opacity,
            };
          });
          return (
            <ContextStackTooltip
              key={view.stackId}
              anchor={anchor}
              title={view.title}
              items={items}
              tokenTotalText={
                isViewTokenShown ? `${tokenTextOf(tokenSum)} tokens` : null
              }
              className={view.className}
            />
          );
        })}

        {store.msgsActiveAt(frame).map((msg) => {
          const arrow = arrowById.get(msg.arrowId);
          if (!arrow) {
            throw new Error(`msg refers to unknown arrow: ${msg.arrowId}`);
          }
          const line = arrowLineOf(arrow, nodeById);
          const motion = msgMotionSample(
            msg.phaseLens,
            fps,
            frame - msg.frameStart,
          );
          const progress = msg.isReverse
            ? 1 - motion.progress
            : motion.progress;
          const anchor = pointAlongLine(line, progress);
          let historyView: MsgHistoryView | null = null;
          if (msg.msgKind === "history" && msg.stackItems) {
            historyView = {
              dir: msg.historyDir,
              blocks: msg.stackItems.map((item) => ({
                id: item.id,
                text: item.detailText ?? item.label,
                colorClassName: item.colorClassName ?? null,
              })),
            };
          }
          let stackView: MsgStackView | null = null;
          if (msg.msgKind === "stack" && msg.stackItems) {
            const tokenSum = msg.stackItems.reduce(
              (sum, item) => sum + item.tokenNum,
              0,
            );
            stackView = {
              title: "Context",
              items: msg.stackItems.map((item) => ({
                id: item.id,
                label: item.label,
                kind: item.kind,
                tokenText: itemTokenTextOf(item),
                colorClassName: item.colorClassName ?? null,
                growFrac: 1,
                opacity: 1,
              })),
              tokenTotalText: stackTotalTextOf(tokenSum),
            };
          }
          return (
            <MsgBalloon
              key={msg.id}
              anchor={anchor}
              side={msg.side}
              text={msg.text}
              kind={msg.msgKind}
              stackView={stackView}
              historyView={historyView}
              opacity={motion.opacity}
            />
          );
        })}

        {counterView
          ? (() => {
              const node = nodeOf(counterView.nodeId);
              const nodeTop = edgePointOf(node.rect, "top", 0.5);
              const counterAnchor = {
                x: nodeTop.x,
                y: nodeTop.y - counterView.gapY,
              };
              const totals = store.tokenTotalsAt(frame);
              const riseYStart = nodeTop.y + RISE_START_DIP;
              const riseYEnd = counterAnchor.y - RISE_END_GAP;
              return (
                <>
                  {store.risesActiveAt(frame).map((rise) => {
                    const motion = tokenRiseMotionSample(
                      store.riseLen,
                      fps,
                      frame - rise.frameStart,
                    );
                    const pos = {
                      x: nodeTop.x,
                      y:
                        riseYStart +
                        (riseYEnd - riseYStart) * motion.progress,
                    };
                    return (
                      <TokenRise
                        key={rise.id}
                        pos={pos}
                        text={`${tokenTextOf(rise.tokenNum)} tokens`}
                        opacity={motion.opacity}
                      />
                    );
                  })}
                  <TokenCounter
                    anchor={counterAnchor}
                    usdText={`${totals.usd.toFixed(2)} USD`}
                    tokensOutText={`${tokenTextOf(totals.tokensOut)} tokens(out)`}
                    tokensInText={`${tokenTextOf(totals.tokensIn)} tokens(in)`}
                  />
                </>
              );
            })()
          : null}
      </>
    );
  },
);
