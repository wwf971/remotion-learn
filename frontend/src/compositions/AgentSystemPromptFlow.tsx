import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { DASH_CYCLE_PX } from "../components/DiagramArrow";
import { DiagramBase } from "../components/DiagramBase";
import {
  FlowLayer,
  type StackDetailViewConfig,
  type StackViewConfig,
} from "../components/FlowLayer";
import {
  FlowStore,
  type FlowStepConfig,
  type StackItemConfig,
} from "../flow/FlowStore";
import { agentDiagramConfig } from "./agentDiagramConfig";
import "../components/diagram.css";

const ragQueryJson = ["{", '  "tool": "rag",', '  "query": "datasets"', "}"].join(
  "\n",
);
const ragRespJson = '{ "result": ["sales.csv", "users.db"] }';

// The system prompt assigns the role and tells the agent which tools exist;
// the LLM later uses that knowledge to query RAG.
const itemSystemPrompt: StackItemConfig = {
  id: "item-system-prompt",
  label: "SystemPrompt",
  kind: "system",
  tokenNum: 1000,
  detailText: [
    "You are a data assistant.",
    "Tools: RAG, MCP, Skills.",
    "Answer briefly.",
  ].join("\n"),
};
const itemUserMsg1: StackItemConfig = {
  id: "item-user-msg-1",
  label: "UserMsg1",
  kind: "plain",
  tokenNum: 1000,
  detailText: "What datasets do we have?",
};
const itemRagCall1: StackItemConfig = {
  id: "item-rag-call-1",
  label: "RagCall1",
  kind: "json",
  tokenNum: 1000,
  detailText: '{ "tool": "rag",\n  "query": "datasets" }',
};
const itemRagResp1: StackItemConfig = {
  id: "item-rag-resp-1",
  label: "RagResp1",
  kind: "json",
  tokenNum: 1000,
  detailText: '{ "result": ["sales.csv",\n  "users.db"] }',
};
const itemLlmReply1: StackItemConfig = {
  id: "item-llm-reply-1",
  label: "LLMReply1",
  kind: "plain",
  tokenNum: 1000,
  detailText: "We have sales.csv\nand users.db.",
};

// The system prompt lands in the context before the user says anything.
const flowSteps: FlowStepConfig[] = [
  {
    kind: "stackPush",
    id: "push-system-prompt",
    stackId: "orch",
    item: itemSystemPrompt,
  },
  {
    kind: "msg",
    id: "msg-user-ask",
    arrowId: "arrow-user-to-orch",
    text: "What datasets do we have?",
    side: "down",
  },
  { kind: "stackPush", id: "push-user-msg1", stackId: "orch", item: itemUserMsg1 },
  {
    kind: "msg",
    id: "msg-ctx-to-llm-1",
    arrowId: "arrow-orch-to-llm",
    msgKind: "stack",
    stackSourceId: "orch",
    side: "down",
    phaseLens: { move: 26 },
  },
  {
    kind: "msg",
    id: "msg-llm-rag-call",
    arrowId: "arrow-llm-to-orch",
    text: ragQueryJson,
    msgKind: "json",
    side: "up",
    phaseLens: { move: 30 },
  },
  { kind: "stackPush", id: "push-rag-call1", stackId: "orch", item: itemRagCall1 },
  {
    kind: "msg",
    id: "msg-fwd-rag",
    arrowId: "arrow-orch-rag",
    text: ragQueryJson,
    msgKind: "json",
    side: "up",
    phaseLens: { move: 30 },
  },
  {
    kind: "msg",
    id: "msg-rag-result",
    arrowId: "arrow-orch-rag",
    text: ragRespJson,
    msgKind: "json",
    side: "up",
    isReverse: true,
  },
  { kind: "stackPush", id: "push-rag-resp1", stackId: "orch", item: itemRagResp1 },
  {
    kind: "msg",
    id: "msg-ctx-to-llm-2",
    arrowId: "arrow-orch-to-llm",
    msgKind: "stack",
    stackSourceId: "orch",
    side: "down",
    phaseLens: { move: 26 },
  },
  {
    kind: "msg",
    id: "msg-llm-reply",
    arrowId: "arrow-llm-to-orch",
    text: "We have sales.csv and users.db.",
    side: "up",
  },
  { kind: "stackPush", id: "push-llm-reply1", stackId: "orch", item: itemLlmReply1 },
  {
    kind: "msg",
    id: "msg-fwd-user",
    arrowId: "arrow-orch-to-user",
    text: "We have sales.csv and users.db.",
    side: "up",
  },
];

const stackViews: StackViewConfig[] = [
  {
    stackId: "orch",
    nodeId: "orch",
    title: "Context",
    className: "stack-orch",
    // Far enough right that the cone lines towards the detail panel clear
    // the orchestrator box.
    anchorFrac: 0.75,
  },
];

// Magnified detail view in the empty bottom-right area.
const stackDetailView: StackDetailViewConfig = {
  stackId: "orch",
  x: 880,
  y: 360,
  width: 330,
  height: 280,
  title: "Context Detail",
};

export const agentSystemPromptFlowStore = new FlowStore(flowSteps);

export const AgentSystemPromptFlow: React.FC = () => {
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
        store={agentSystemPromptFlowStore}
        diagramConfig={agentDiagramConfig}
        stackViews={stackViews}
        stackDetailView={stackDetailView}
      />
    </AbsoluteFill>
  );
};
