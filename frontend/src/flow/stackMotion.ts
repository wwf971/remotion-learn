import { gsap } from "gsap";
import { timelineSample } from "./motionSample";

export type StackPushMotionState = {
  // How much of the new item's slot height is open. While it grows, the
  // container's top edge and the existing items move up; the bottom edge
  // stays in place because the stack is anchored by its bottom.
  growFrac: number;
  opacity: number;
};

export const stackPushMotionSample = (
  growLen: number,
  appearLen: number,
  fps: number,
  frameLocal: number,
): StackPushMotionState =>
  timelineSample(
    `stackPush:${growLen}/${appearLen}@${fps}`,
    () => {
      const state: StackPushMotionState = { growFrac: 0, opacity: 0 };
      const timeline = gsap.timeline({ paused: true });
      timeline.to(
        state,
        { growFrac: 1, duration: growLen / fps, ease: "power1.out" },
        0,
      );
      timeline.to(
        state,
        { opacity: 1, duration: appearLen / fps, ease: "none" },
        growLen / fps,
      );
      return { state, timeline };
    },
    frameLocal / fps,
  );
