import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { DASH_CYCLE_PX } from "../components/DiagramArrow";
import { DiagramBase } from "../components/DiagramBase";
import { FlowLayer, type StackViewConfig } from "../components/FlowLayer";
import {
  FlowStore,
  type FlowStepConfig,
  type StackItemConfig,
} from "../flow/FlowStore";
import { agentDiagramConfig } from "./agentDiagramConfig";
import "../components/diagram.css";
import "../components/chatColors.css";

// Three tellings of the same 4-turn chat. They differ only in what the
// orchestrator visibly sends to the LLM:
// - "lastOnly" (AgentChatFlowFalse): just the last user message. Wrong, but
//   how it naively looks.
// - "history" (AgentChatFlowTrue): the whole conversation stack, blocks laid
//   out vertically with the real texts.
// - "historyAbstract" (AgentChatFlowTrueAbstract): same, but every message
//   is an abstract colored block (User1, LLM1, ...) and the history blocks
//   concatenate horizontally.
type ChatFlowMode = "lastOnly" | "history" | "historyAbstract";

// Turns 3 and 4 only make sense with turns 1 and 2 in context, which is the
// point of these videos.
const chatTurns = [
  { userText: "Hi, I am Tim.", llmText: "Hello Tim!" },
  { userText: "I live in Tokyo.", llmText: "Good to know." },
  { userText: "What is my name?", llmText: "Your name is Tim." },
  { userText: "Where do I live?", llmText: "You live in Tokyo." },
];

const flowStepsOf = (mode: ChatFlowMode): FlowStepConfig[] => {
  const isAbstract = mode === "historyAbstract";
  const steps: FlowStepConfig[] = [];

  chatTurns.forEach((turn, index) => {
    const turnNum = index + 1;
    const isLastTurn = turnNum === chatTurns.length;
    const itemUser: StackItemConfig = isAbstract
      ? {
          id: `item-user-${turnNum}`,
          label: `User${turnNum}`,
          kind: "plain",
          tokenNum: 1000,
          colorClassName: `chat-block-user${turnNum}`,
        }
      : {
          id: `item-user-${turnNum}`,
          label: `UserMsg${turnNum}`,
          kind: "plain",
          tokenNum: 1000,
          detailText: turn.userText,
        };
    const itemLlm: StackItemConfig = isAbstract
      ? {
          id: `item-llm-${turnNum}`,
          label: `LLM${turnNum}`,
          kind: "plain",
          tokenNum: 1000,
          colorClassName: `chat-block-llm${turnNum}`,
        }
      : {
          id: `item-llm-${turnNum}`,
          label: `LLMReply${turnNum}`,
          kind: "plain",
          tokenNum: 1000,
          detailText: turn.llmText,
        };

    // In the abstract mode single moving messages are also shown as their
    // colored block instead of the full text.
    const userMsgContent = isAbstract
      ? { msgKind: "history" as const, historyItems: [itemUser], historyDir: "row" as const }
      : { text: turn.userText };
    const llmMsgContent = isAbstract
      ? { msgKind: "history" as const, historyItems: [itemLlm], historyDir: "row" as const }
      : { text: turn.llmText };

    steps.push(
      {
        kind: "msg",
        id: `msg-user-${turnNum}`,
        arrowId: "arrow-user-to-orch",
        side: "down",
        ...userMsgContent,
      },
      {
        kind: "stackPush",
        id: `push-user-${turnNum}`,
        stackId: "orch",
        item: itemUser,
      },
    );

    if (mode === "lastOnly") {
      steps.push({
        kind: "msg",
        id: `msg-ctx-${turnNum}`,
        arrowId: "arrow-orch-to-llm",
        text: turn.userText,
        side: "down",
      });
    } else {
      steps.push({
        kind: "msg",
        id: `msg-ctx-${turnNum}`,
        arrowId: "arrow-orch-to-llm",
        msgKind: "history",
        stackSourceId: "orch",
        // The vertical block column is tall, so it floats above the arrow
        // where the canvas is empty; the flat abstract row fits below.
        historyDir: isAbstract ? "row" : "column",
        side: isAbstract ? "down" : "up",
        phaseLens: { move: 26 },
      });
    }

    steps.push({
      kind: "msg",
      id: `msg-llm-${turnNum}`,
      arrowId: "arrow-llm-to-orch",
      side: "up",
      ...llmMsgContent,
    });
    // The final reply is not pushed: the video ends when it reaches the
    // user, and an 8th item would poke the stack out of the canvas top.
    if (!isLastTurn) {
      steps.push({
        kind: "stackPush",
        id: `push-llm-${turnNum}`,
        stackId: "orch",
        item: itemLlm,
      });
    }
    steps.push({
      kind: "msg",
      id: `msg-fwd-user-${turnNum}`,
      arrowId: "arrow-orch-to-user",
      side: "up",
      ...llmMsgContent,
    });
  });

  return steps;
};

const stackViews: StackViewConfig[] = [
  {
    stackId: "orch",
    nodeId: "orch",
    title: "Context",
    className: "stack-orch",
    // Shifted right so the stack does not cover the "Agent" label.
    anchorFrac: 0.62,
  },
];

export const agentChatFlowFalseStore = new FlowStore(flowStepsOf("lastOnly"));
export const agentChatFlowTrueStore = new FlowStore(flowStepsOf("history"));
export const agentChatFlowTrueAbstractStore = new FlowStore(
  flowStepsOf("historyAbstract"),
);

const AgentChatFlowBase: React.FC<{ store: FlowStore }> = ({ store }) => {
  const { width, height, durationInFrames } = useVideoConfig();

  const dashCycles = Math.round(durationInFrames / 15);
  const dashSpeedPxPerFrame = (DASH_CYCLE_PX * dashCycles) / durationInFrames;

  return (
    <AbsoluteFill className="diagram-canvas">
      <DiagramBase
        config={agentDiagramConfig}
        width={width}
        height={height}
        dashSpeedPxPerFrame={dashSpeedPxPerFrame}
      />
      <FlowLayer
        store={store}
        diagramConfig={agentDiagramConfig}
        stackViews={stackViews}
      />
    </AbsoluteFill>
  );
};

export const AgentChatFlowFalse: React.FC = () => (
  <AgentChatFlowBase store={agentChatFlowFalseStore} />
);

export const AgentChatFlowTrue: React.FC = () => (
  <AgentChatFlowBase store={agentChatFlowTrueStore} />
);

export const AgentChatFlowTrueAbstract: React.FC = () => (
  <AgentChatFlowBase store={agentChatFlowTrueAbstractStore} />
);
