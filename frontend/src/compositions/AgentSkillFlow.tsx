import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { DASH_CYCLE_PX } from "../components/DiagramArrow";
import { DiagramBase } from "../components/DiagramBase";
import {
  FlowLayer,
  type SkillFileConfig,
  type SkillPanelViewConfig,
} from "../components/FlowLayer";
import { FlowStore, type FlowStepConfig } from "../flow/FlowStore";
import { agentDiagramConfig } from "./agentDiagramConfig";
import "../components/diagram.css";

const skillFiles: SkillFileConfig[] = [
  { id: "dir-root", label: "data-skill/", depth: 0, isDir: true },
  { id: "file-skill-md", label: "SKILL.md", depth: 1 },
  { id: "dir-scripts", label: "scripts/", depth: 1, isDir: true },
  { id: "file-a-py", label: "a.py", depth: 2 },
  { id: "dir-references", label: "references/", depth: 1, isDir: true },
  { id: "file-b-md", label: "b.md", depth: 2 },
  { id: "dir-assets", label: "assets/", depth: 1, isDir: true },
  { id: "file-c-docx", label: "c.docx", depth: 2 },
];

// Placed in the empty area right of the Skills box, under the User box.
const skillPanelView: SkillPanelViewConfig = {
  x: 850,
  y: 380,
  width: 320,
  title: "Skill for Data Process",
  files: skillFiles,
};

// One skill-file fetch: the orchestrator asks the Skills box for a path,
// the file comes back (and gets marked as read), then it is forwarded to
// the LLM. Messages carry just the path relative to the skill root.
const readCycleOf = (pathText: string, fileId: string): FlowStepConfig[] => [
  {
    kind: "msg",
    id: `msg-skills-req-${fileId}`,
    arrowId: "arrow-orch-skills",
    text: pathText,
    side: "right",
  },
  {
    kind: "msg",
    id: `msg-skills-ret-${fileId}`,
    arrowId: "arrow-orch-skills",
    text: pathText,
    side: "right",
    isReverse: true,
  },
  // Marked as read the moment the response is ejected from the Skills node,
  // so the marker fades in while the return message departs.
  { kind: "fileRead", id: `read-${fileId}`, fileId, isWithPrev: true },
  {
    kind: "msg",
    id: `msg-fwd-llm-${fileId}`,
    arrowId: "arrow-orch-to-llm",
    text: pathText,
    side: "down",
  },
];

// The agent starts from the skill's root file and follows it to two more
// files, each requested by the LLM after reading the previous one.
const flowSteps: FlowStepConfig[] = [
  {
    kind: "msg",
    id: "msg-user-ask",
    arrowId: "arrow-user-to-orch",
    text: "Help me process my data.",
    side: "down",
  },
  {
    kind: "msg",
    id: "msg-fwd-llm-ask",
    arrowId: "arrow-orch-to-llm",
    text: "Help me process my data.",
    side: "down",
  },
  {
    kind: "msg",
    id: "msg-llm-req-root",
    arrowId: "arrow-llm-to-orch",
    text: "SKILL.md",
    side: "up",
  },
  ...readCycleOf("SKILL.md", "file-skill-md"),
  {
    kind: "msg",
    id: "msg-llm-req-script",
    arrowId: "arrow-llm-to-orch",
    text: "scripts/a.py",
    side: "up",
  },
  ...readCycleOf("scripts/a.py", "file-a-py"),
  {
    kind: "msg",
    id: "msg-llm-req-ref",
    arrowId: "arrow-llm-to-orch",
    text: "references/b.md",
    side: "up",
  },
  ...readCycleOf("references/b.md", "file-b-md"),
  {
    kind: "msg",
    id: "msg-llm-reply",
    arrowId: "arrow-llm-to-orch",
    text: "Ready to process the data.",
    side: "up",
  },
  {
    kind: "msg",
    id: "msg-fwd-user-reply",
    arrowId: "arrow-orch-to-user",
    text: "Ready to process the data.",
    side: "up",
  },
];

export const agentSkillFlowStore = new FlowStore(flowSteps);

export const AgentSkillFlow: React.FC = () => {
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
        store={agentSkillFlowStore}
        diagramConfig={agentDiagramConfig}
        skillPanelView={skillPanelView}
      />
    </AbsoluteFill>
  );
};
