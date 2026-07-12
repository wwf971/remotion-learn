import { gsap } from "gsap";
import { timelineSample } from "./motionSample";

export type TokenRiseMotionState = {
  progress: number;
  opacity: number;
};

// The token text fades in quickly, then accelerates upward until it hits
// the counter (it vanishes at the hit frame, when the counter jumps).
export const tokenRiseMotionSample = (
  riseLen: number,
  fps: number,
  frameLocal: number,
): TokenRiseMotionState =>
  timelineSample(
    `tokenRise:${riseLen}@${fps}`,
    () => {
      const state: TokenRiseMotionState = { progress: 0, opacity: 0 };
      const timeline = gsap.timeline({ paused: true });
      timeline.to(state, { opacity: 1, duration: 4 / fps, ease: "none" }, 0);
      timeline.to(
        state,
        { progress: 1, duration: riseLen / fps, ease: "power1.in" },
        0,
      );
      return { state, timeline };
    },
    frameLocal / fps,
  );
