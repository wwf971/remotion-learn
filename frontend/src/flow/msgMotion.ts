import { gsap } from "gsap";
import type { MsgPhaseLens } from "./FlowStore";
import { timelineSample } from "./motionSample";

export type MsgMotionState = {
  progress: number;
  opacity: number;
};

// appear (fade in) / move (ease-in-out along the arrow) / disappear (fade out).
// frameLocal is relative to the message's frameStart.
export const msgMotionSample = (
  lens: MsgPhaseLens,
  fps: number,
  frameLocal: number,
): MsgMotionState =>
  timelineSample(
    `msg:${lens.appear}/${lens.move}/${lens.disappear}@${fps}`,
    () => {
      const state: MsgMotionState = { progress: 0, opacity: 0 };
      const timeline = gsap.timeline({ paused: true });
      timeline.to(
        state,
        { opacity: 1, duration: lens.appear / fps, ease: "none" },
        0,
      );
      timeline.to(
        state,
        { progress: 1, duration: lens.move / fps, ease: "power1.inOut" },
        lens.appear / fps,
      );
      timeline.to(
        state,
        { opacity: 0, duration: lens.disappear / fps, ease: "none" },
        (lens.appear + lens.move) / fps,
      );
      return { state, timeline };
    },
    frameLocal / fps,
  );
