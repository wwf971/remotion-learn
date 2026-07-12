import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { DASH_CYCLE_PX } from "../components/DiagramArrow";
import { DiagramBase } from "../components/DiagramBase";
import { agentDiagramConfig } from "./agentDiagramConfig";
import "../components/diagram.css";

// Static looping overview: no fade in, and the dash travel over the whole
// video is a whole number of dash cycles, so frame 0 continues frame N-1
// with no visible jump.
export const AgentUserOverview: React.FC = () => {
  const { width, height, durationInFrames } = useVideoConfig();

  const dashCycles = 10;
  const dashSpeedPxPerFrame = (DASH_CYCLE_PX * dashCycles) / durationInFrames;

  return (
    <AbsoluteFill className="diagram-canvas">
      <DiagramBase
        config={agentDiagramConfig}
        width={width}
        height={height}
        dashSpeedPxPerFrame={dashSpeedPxPerFrame}
      />
    </AbsoluteFill>
  );
};
