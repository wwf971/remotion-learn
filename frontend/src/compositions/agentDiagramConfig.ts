import type {
  DiagramArrowConfig,
  DiagramConfig,
  DiagramNodeConfig,
} from "../diagram/diagramConfig";

// Values shared between boxes that align vertically or share a size.
const rowMainY = 220;
const boxMainHeight = 100;
const rowToolY = 460;
const boxToolHeight = 100;
const boxToolWidth = 140;

export const agentNodesConfig: DiagramNodeConfig[] = [
  {
    id: "agent",
    label: "Agent",
    rect: { x: 60, y: 100, width: 740, height: 520 },
    className: "node-container",
    isLabelAtTop: true,
  },
  {
    id: "llm",
    label: "LLM",
    rect: { x: 130, y: rowMainY, width: 170, height: boxMainHeight },
    className: "node-llm",
  },
  {
    id: "orch",
    label: "Orchestrator",
    rect: { x: 440, y: rowMainY, width: 250, height: boxMainHeight },
    className: "node-orchestrator",
  },
  {
    id: "rag",
    label: "RAG",
    rect: { x: 110, y: rowToolY, width: boxToolWidth, height: boxToolHeight },
    className: "node-tool",
  },
  {
    id: "asset",
    label: "Asset",
    rect: { x: 280, y: rowToolY, width: boxToolWidth, height: boxToolHeight },
    className: "node-tool",
  },
  {
    id: "mcp",
    label: "MCP",
    rect: { x: 450, y: rowToolY, width: boxToolWidth, height: boxToolHeight },
    className: "node-tool",
  },
  {
    id: "skills",
    label: "Skills",
    rect: { x: 620, y: rowToolY, width: boxToolWidth, height: boxToolHeight },
    className: "node-tool",
  },
  {
    id: "user",
    label: "User",
    rect: { x: 1010, y: rowMainY, width: 190, height: boxMainHeight },
    className: "node-user",
  },
];

const toolArrowOf = (toolId: string, orchFrac: number): DiagramArrowConfig => ({
  id: `arrow-orch-${toolId}`,
  from: { nodeId: "orch", edge: "bottom", frac: orchFrac },
  to: { nodeId: toolId, edge: "top", frac: 1 / 2 },
  lineKind: "straight",
  hasStartHead: true,
  hasEndHead: true,
});

export const agentArrowsConfig: DiagramArrowConfig[] = [
  {
    id: "arrow-llm-to-orch",
    from: { nodeId: "llm", edge: "right", frac: 1 / 3 },
    to: { nodeId: "orch", edge: "left", frac: 1 / 3 },
    lineKind: "straight",
  },
  {
    id: "arrow-orch-to-llm",
    from: { nodeId: "orch", edge: "left", frac: 2 / 3 },
    to: { nodeId: "llm", edge: "right", frac: 2 / 3 },
    lineKind: "straight",
  },
  toolArrowOf("rag", 4 / 11),
  toolArrowOf("asset", 5 / 11),
  toolArrowOf("mcp", 6 / 11),
  toolArrowOf("skills", 7 / 11),
  {
    id: "arrow-orch-to-user",
    from: { nodeId: "orch", edge: "right", frac: 1 / 3 },
    to: { nodeId: "user", edge: "left", frac: 1 / 3 },
    lineKind: "straight",
    isDashed: true,
  },
  {
    id: "arrow-user-to-orch",
    from: { nodeId: "user", edge: "left", frac: 2 / 3 },
    to: { nodeId: "orch", edge: "right", frac: 2 / 3 },
    lineKind: "straight",
    isDashed: true,
  },
];

export const agentDiagramConfig: DiagramConfig = {
  nodes: agentNodesConfig,
  arrows: agentArrowsConfig,
};
