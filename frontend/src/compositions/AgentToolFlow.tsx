import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { DASH_CYCLE_PX } from "../components/DiagramArrow";
import { DiagramBase } from "../components/DiagramBase";
import { FlowLayer } from "../components/FlowLayer";
import { FlowStore, type FlowStepConfig } from "../flow/FlowStore";
import { agentDiagramConfig } from "./agentDiagramConfig";
import "../components/diagram.css";

export const toolCallJson = [
  "{",
  '  "tool": "get_weather",',
  '  "args": { "city": "Tokyo" }',
  "}",
].join("\n");

export const toolResultJson = '{ "result": "sunny, 31 C" }';

// Turn 1: plain chat. Turn 2: llm asks for a tool call, orchestrator routes
// it to MCP and forwards the result back.
const flowSteps: FlowStepConfig[] = [
  {
    kind: "msg",
    id: "msg-user-ask-1",
    arrowId: "arrow-user-to-orch",
    text: "Hello, who are you?",
    side: "down",
  },
  {
    kind: "msg",
    id: "msg-fwd-llm-1",
    arrowId: "arrow-orch-to-llm",
    text: "Hello, who are you?",
    side: "down",
  },
  {
    kind: "msg",
    id: "msg-llm-reply-1",
    arrowId: "arrow-llm-to-orch",
    text: "I am an AI agent.",
    side: "up",
  },
  {
    kind: "msg",
    id: "msg-fwd-user-1",
    arrowId: "arrow-orch-to-user",
    text: "I am an AI agent.",
    side: "up",
  },
  {
    kind: "msg",
    id: "msg-user-ask-2",
    arrowId: "arrow-user-to-orch",
    text: "What is the weather in Tokyo?",
    side: "down",
  },
  {
    kind: "msg",
    id: "msg-fwd-llm-2",
    arrowId: "arrow-orch-to-llm",
    text: "What is the weather in Tokyo?",
    side: "down",
  },
  {
    kind: "msg",
    id: "msg-llm-tool-call",
    arrowId: "arrow-llm-to-orch",
    text: toolCallJson,
    msgKind: "json",
    side: "up",
    phaseLens: { move: 30 },
  },
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
  {
    kind: "msg",
    id: "msg-fwd-llm-result",
    arrowId: "arrow-orch-to-llm",
    text: toolResultJson,
    msgKind: "json",
    side: "down",
  },
  {
    kind: "msg",
    id: "msg-llm-reply-2",
    arrowId: "arrow-llm-to-orch",
    text: "It is sunny in Tokyo, 31 C.",
    side: "up",
  },
  {
    kind: "msg",
    id: "msg-fwd-user-2",
    arrowId: "arrow-orch-to-user",
    text: "It is sunny in Tokyo, 31 C.",
    side: "up",
  },
];

export const agentToolFlowStore = new FlowStore(flowSteps);

export const AgentToolFlow: React.FC = () => {
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
      <FlowLayer store={agentToolFlowStore} diagramConfig={agentDiagramConfig} />
    </AbsoluteFill>
  );
};
