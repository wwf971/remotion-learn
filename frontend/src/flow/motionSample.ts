// Motion layer: paused gsap timelines describe one object's life span.
// Remotion samples them frame by frame via seek, so the output stays a
// pure function of the frame index. Timelines are cached by key and the
// sampled values are copied out, so shared entries stay safe.

export type MotionEntry<S extends object> = {
  state: S;
  timeline: gsap.core.Timeline;
};

const entryCache = new Map<string, MotionEntry<object>>();

export const timelineSample = <S extends object>(
  key: string,
  build: () => MotionEntry<S>,
  timeSec: number,
): S => {
  let entry = entryCache.get(key) as MotionEntry<S> | undefined;
  if (!entry) {
    entry = build();
    entryCache.set(key, entry);
  }
  entry.timeline.seek(timeSec);
  return { ...entry.state };
};
