import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { DASH_CYCLE_PX } from "../components/DiagramArrow";
import { DiagramBase } from "../components/DiagramBase";
import {
  FlowLayer,
  type StackViewConfig,
  type TokenCounterViewConfig,
} from "../components/FlowLayer";
import {
  FlowStore,
  type FlowStepConfig,
  type StackItemConfig,
} from "../flow/FlowStore";
import { agentDiagramConfig } from "./agentDiagramConfig";
import { toolCallJson, toolResultJson } from "./AgentToolFlow";
import "../components/diagram.css";

const itemUserMsg1: StackItemConfig = {
  id: "item-user-msg-1",
  label: "UserMsg1",
  kind: "plain",
  tokenNum: 1000,
};
const itemLlmReply1: StackItemConfig = {
  id: "item-llm-reply-1",
  label: "LLMReply1",
  kind: "plain",
  tokenNum: 1000,
};
const itemUserMsg2: StackItemConfig = {
  id: "item-user-msg-2",
  label: "UserMsg2",
  kind: "plain",
  tokenNum: 1000,
};
const itemToolCall1: StackItemConfig = {
  id: "item-tool-call-1",
  label: "ToolCall1",
  kind: "json",
  tokenNum: 1000,
};
const itemToolResp1: StackItemConfig = {
  id: "item-tool-resp-1",
  label: "ToolResp1",
  kind: "json",
  tokenNum: 2000,
};
const itemLlmReply2: StackItemConfig = {
  id: "item-llm-reply-2",
  label: "LLMReply2",
  kind: "plain",
  tokenNum: 1000,
};

// Same scenario as AgentToolFlow, but the orchestrator keeps a context stack
// that grows step by step, the user keeps a stack of what they see, and what
// is sent to the LLM is a moving copy of the orchestrator's stack. Token
// rises are inserted only in the token version; the LLM's reply always comes
// after the input-token rise has hit the counter, because the rise is a
// sequential step between the two messages.
const flowStepsOf = (isTokenShown: boolean): FlowStepConfig[] => {
  const steps: FlowStepConfig[] = [];
  const riseIn = (id: string, tokenNum: number) => {
    if (isTokenShown) {
      steps.push({ kind: "tokenRise", id, dir: "in", tokenNum });
    }
  };
  const riseOut = (id: string, tokenNum: number) => {
    if (isTokenShown) {
      steps.push({ kind: "tokenRise", id, dir: "out", tokenNum });
    }
  };

  // Turn 1: plain chat. The user message travels first; only after it has
  // arrived do the user and orchestrator stacks push the item (in sync,
  // mirroring the same event on both sides).
  steps.push(
    {
      kind: "msg",
      id: "msg-user-ask-1",
      arrowId: "arrow-user-to-orch",
      text: "Hello, who are you?",
      side: "down",
    },
    { kind: "stackPush", id: "push-user-msg1-user", stackId: "user", item: itemUserMsg1 },
    {
      kind: "stackPush",
      id: "push-user-msg1-orch",
      stackId: "orch",
      item: itemUserMsg1,
      isWithPrev: true,
    },
    {
      kind: "msg",
      id: "msg-ctx-to-llm-1",
      arrowId: "arrow-orch-to-llm",
      msgKind: "stack",
      stackSourceId: "orch",
      side: "down",
      phaseLens: { move: 26 },
    },
  );
  riseIn("rise-in-1", 2000);
  steps.push({
    kind: "msg",
    id: "msg-llm-reply-1",
    arrowId: "arrow-llm-to-orch",
    text: "I am an AI agent.",
    side: "up",
  });
  riseOut("rise-out-1", 1000);
  steps.push(
    { kind: "stackPush", id: "push-llm-reply1-orch", stackId: "orch", item: itemLlmReply1 },
    {
      kind: "msg",
      id: "msg-fwd-user-1",
      arrowId: "arrow-orch-to-user",
      text: "I am an AI agent.",
      side: "up",
    },
    { kind: "stackPush", id: "push-llm-reply1-user", stackId: "user", item: itemLlmReply1 },
  );

  // Turn 2: tool call via MCP.
  steps.push(
    {
      kind: "msg",
      id: "msg-user-ask-2",
      arrowId: "arrow-user-to-orch",
      text: "What is the weather in Tokyo?",
      side: "down",
    },
    { kind: "stackPush", id: "push-user-msg2-user", stackId: "user", item: itemUserMsg2 },
    {
      kind: "stackPush",
      id: "push-user-msg2-orch",
      stackId: "orch",
      item: itemUserMsg2,
      isWithPrev: true,
    },
    {
      kind: "msg",
      id: "msg-ctx-to-llm-2",
      arrowId: "arrow-orch-to-llm",
      msgKind: "stack",
      stackSourceId: "orch",
      side: "down",
      phaseLens: { move: 26 },
    },
  );
  riseIn("rise-in-2", 4000);
  steps.push({
    kind: "msg",
    id: "msg-llm-tool-call",
    arrowId: "arrow-llm-to-orch",
    text: toolCallJson,
    msgKind: "json",
    side: "up",
    phaseLens: { move: 30 },
  });
  riseOut("rise-out-2", 1000);
  steps.push(
    { kind: "stackPush", id: "push-tool-call1-orch", stackId: "orch", item: itemToolCall1 },
    {
      kind: "msg",
      id: "msg-fwd-mcp",
      arrowId: "arrow-orch-mcp",
      text: toolCallJson,
      msgKind: "json",
      side: "right",
      phaseLens: { move: 30 },
    },
    {
      kind: "msg",
      id: "msg-mcp-result",
      arrowId: "arrow-orch-mcp",
      text: toolResultJson,
      msgKind: "json",
      side: "right",
      isReverse: true,
    },
    { kind: "stackPush", id: "push-tool-resp1-orch", stackId: "orch", item: itemToolResp1 },
    {
      kind: "msg",
      id: "msg-ctx-to-llm-3",
      arrowId: "arrow-orch-to-llm",
      msgKind: "stack",
      stackSourceId: "orch",
      side: "down",
      phaseLens: { move: 26 },
    },
  );
  riseIn("rise-in-3", 6000);
  steps.push({
    kind: "msg",
    id: "msg-llm-reply-2",
    arrowId: "arrow-llm-to-orch",
    text: "It is sunny in Tokyo, 31 C.",
    side: "up",
  });
  riseOut("rise-out-3", 1000);
  steps.push(
    { kind: "stackPush", id: "push-llm-reply2-orch", stackId: "orch", item: itemLlmReply2 },
    {
      kind: "msg",
      id: "msg-fwd-user-2",
      arrowId: "arrow-orch-to-user",
      text: "It is sunny in Tokyo, 31 C.",
      side: "up",
    },
    { kind: "stackPush", id: "push-llm-reply2-user", stackId: "user", item: itemLlmReply2 },
  );

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
  {
    stackId: "user",
    nodeId: "user",
    title: "User View",
    className: "stack-user",
    isTokenShown: false,
  },
];

// gapY keeps the whole counter block below the agent box's top border.
const counterView: TokenCounterViewConfig = { nodeId: "llm", gapY: 30 };

export const agentToolFlowContextStore = new FlowStore(flowStepsOf(false));
export const agentToolFlowContextTokenStore = new FlowStore(flowStepsOf(true));

const AgentToolFlowContextBase: React.FC<{
  store: FlowStore;
  isTokenShown: boolean;
}> = ({ store, isTokenShown }) => {
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
        counterView={isTokenShown ? counterView : null}
        isTokenShown={isTokenShown}
      />
    </AbsoluteFill>
  );
};

export const AgentToolFlowContext: React.FC = () => (
  <AgentToolFlowContextBase
    store={agentToolFlowContextStore}
    isTokenShown={false}
  />
);

export const AgentToolFlowContextToken: React.FC = () => (
  <AgentToolFlowContextBase
    store={agentToolFlowContextTokenStore}
    isTokenShown
  />
);
