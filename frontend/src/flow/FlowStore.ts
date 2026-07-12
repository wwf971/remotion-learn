import { makeAutoObservable } from "mobx";

export type MsgKind = "plain" | "json" | "stack" | "history";
export type MsgBalloonSide = "up" | "down" | "left" | "right";
export type StackItemKind = "plain" | "json" | "system";
export type HistoryDir = "column" | "row";

export type StackItemConfig = {
  id: string;
  label: string;
  kind: StackItemKind;
  tokenNum: number;
  // Full text shown in a magnified detail view of the stack, and in
  // "history" messages laid out as a column.
  detailText?: string;
  // Background class for abstract colored blocks (see chatColors.css).
  colorClassName?: string;
};

// Phase lengths in frames.
export type MsgPhaseLens = {
  appear: number;
  move: number;
  disappear: number;
};

export type FlowStepMsg = {
  kind: "msg";
  id: string;
  arrowId: string;
  text?: string;
  msgKind?: MsgKind;
  // For msgKind "stack" / "history": the moving balloon carries a copy of
  // this stack, snapshotted at the moment the message departs.
  stackSourceId?: string;
  // For msgKind "history": explicit items instead of a stack snapshot
  // (e.g. a single abstract block for one chat message).
  historyItems?: StackItemConfig[];
  // Layout of history blocks inside the balloon.
  historyDir?: HistoryDir;
  side?: MsgBalloonSide;
  // Travel from the arrow's "to" end back to its "from" end.
  isReverse?: boolean;
  phaseLens?: Partial<MsgPhaseLens>;
  isWithPrev?: boolean;
};

export type FlowStepStackPush = {
  kind: "stackPush";
  id: string;
  stackId: string;
  item: StackItemConfig;
  isWithPrev?: boolean;
};

export type FlowStepTokenRise = {
  kind: "tokenRise";
  id: string;
  dir: "in" | "out";
  tokenNum: number;
  isWithPrev?: boolean;
};

// Marks a file in a skill panel as read (the read marker fades in during
// the step's life span).
export type FlowStepFileRead = {
  kind: "fileRead";
  id: string;
  fileId: string;
  isWithPrev?: boolean;
};

export type FlowStepConfig =
  | FlowStepMsg
  | FlowStepStackPush
  | FlowStepTokenRise
  | FlowStepFileRead;

export type MsgScheduled = {
  id: string;
  arrowId: string;
  text: string;
  msgKind: MsgKind;
  stackItems: StackItemConfig[] | null;
  historyDir: HistoryDir;
  side: MsgBalloonSide;
  isReverse: boolean;
  phaseLens: MsgPhaseLens;
  frameStart: number;
  frameEnd: number;
};

export type StackPushScheduled = {
  id: string;
  stackId: string;
  item: StackItemConfig;
  frameStart: number;
  frameEnd: number;
};

export type TokenRiseScheduled = {
  id: string;
  dir: "in" | "out";
  tokenNum: number;
  frameStart: number;
  frameEnd: number;
};

export type FileReadScheduled = {
  id: string;
  fileId: string;
  frameStart: number;
  frameEnd: number;
};

export type FlowSchedule = {
  msgs: MsgScheduled[];
  stackPushes: StackPushScheduled[];
  tokenRises: TokenRiseScheduled[];
  fileReads: FileReadScheduled[];
  frameTotal: number;
};

export const USD_PER_100K_IN = 10;
export const USD_PER_100K_OUT = 25;

export const tokenTextOf = (tokenNum: number): string => {
  if (tokenNum >= 1000) {
    const k = tokenNum / 1000;
    return Number.isInteger(k) ? `${k}k` : `${k.toFixed(1)}k`;
  }
  return `${tokenNum}`;
};

// Scheduling layer: decides which message / stack push / token rise is on
// stage at a given frame. The gsap layer (src/flow/*Motion.ts) decides where
// exactly each object is inside its own life span.
export class FlowStore {
  steps: FlowStepConfig[];
  phaseLensDefault: MsgPhaseLens = { appear: 8, move: 22, disappear: 8 };
  stackGrowLen = 10;
  stackAppearLen = 8;
  riseLen = 20;
  fileReadLen = 8;
  frameGap = 2;
  frameTail = 16;

  constructor(steps: FlowStepConfig[]) {
    this.steps = steps;
    makeAutoObservable(this);
  }

  private stepFrameLenOf(step: FlowStepConfig): number {
    if (step.kind === "msg") {
      const lens = { ...this.phaseLensDefault, ...step.phaseLens };
      return lens.appear + lens.move + lens.disappear;
    }
    if (step.kind === "stackPush") {
      return this.stackGrowLen + this.stackAppearLen;
    }
    if (step.kind === "fileRead") {
      return this.fileReadLen;
    }
    return this.riseLen;
  }

  get schedule(): FlowSchedule {
    const msgs: MsgScheduled[] = [];
    const stackPushes: StackPushScheduled[] = [];
    const tokenRises: TokenRiseScheduled[] = [];
    const fileReads: FileReadScheduled[] = [];
    const stackItemsById = new Map<string, StackItemConfig[]>();
    let frameCursor = 0;
    let frameStartPrev = 0;
    let isFirst = true;
    for (const step of this.steps) {
      const frameStart = step.isWithPrev
        ? frameStartPrev
        : isFirst
          ? 0
          : frameCursor + this.frameGap;
      const frameEnd = frameStart + this.stepFrameLenOf(step);
      frameCursor = Math.max(frameCursor, frameEnd);
      frameStartPrev = frameStart;
      isFirst = false;

      if (step.kind === "msg") {
        let stackItems: StackItemConfig[] | null = step.historyItems ?? null;
        if (!stackItems && step.stackSourceId) {
          stackItems = [...(stackItemsById.get(step.stackSourceId) ?? [])];
        }
        msgs.push({
          id: step.id,
          arrowId: step.arrowId,
          text: step.text ?? "",
          msgKind: step.msgKind ?? "plain",
          stackItems,
          historyDir: step.historyDir ?? "column",
          side: step.side ?? "up",
          isReverse: step.isReverse ?? false,
          phaseLens: { ...this.phaseLensDefault, ...step.phaseLens },
          frameStart,
          frameEnd,
        });
      } else if (step.kind === "stackPush") {
        const items = stackItemsById.get(step.stackId) ?? [];
        items.push(step.item);
        stackItemsById.set(step.stackId, items);
        stackPushes.push({
          id: step.id,
          stackId: step.stackId,
          item: step.item,
          frameStart,
          frameEnd,
        });
      } else if (step.kind === "tokenRise") {
        tokenRises.push({
          id: step.id,
          dir: step.dir,
          tokenNum: step.tokenNum,
          frameStart,
          frameEnd,
        });
      } else {
        fileReads.push({
          id: step.id,
          fileId: step.fileId,
          frameStart,
          frameEnd,
        });
      }
    }
    return {
      msgs,
      stackPushes,
      tokenRises,
      fileReads,
      frameTotal: frameCursor + this.frameTail,
    };
  }

  get frameTotal(): number {
    return this.schedule.frameTotal;
  }

  msgsActiveAt(frame: number): MsgScheduled[] {
    return this.schedule.msgs.filter(
      (msg) => frame >= msg.frameStart && frame < msg.frameEnd,
    );
  }

  // All pushes of one stack that have started by this frame, oldest first.
  stackPushesAt(frame: number, stackId: string): StackPushScheduled[] {
    return this.schedule.stackPushes.filter(
      (push) => push.stackId === stackId && frame >= push.frameStart,
    );
  }

  // All file reads that have started by this frame. The read marker's
  // fade-in progress is (frame - frameStart) / fileReadLen, clamped.
  fileReadsAt(frame: number): FileReadScheduled[] {
    return this.schedule.fileReads.filter(
      (read) => frame >= read.frameStart,
    );
  }

  risesActiveAt(frame: number): TokenRiseScheduled[] {
    return this.schedule.tokenRises.filter(
      (rise) => frame >= rise.frameStart && frame < rise.frameEnd,
    );
  }

  // Counter totals: a rise contributes the moment it hits the counter.
  tokenTotalsAt(frame: number): {
    tokensIn: number;
    tokensOut: number;
    usd: number;
  } {
    let tokensIn = 0;
    let tokensOut = 0;
    for (const rise of this.schedule.tokenRises) {
      if (frame < rise.frameEnd) {
        continue;
      }
      if (rise.dir === "in") {
        tokensIn += rise.tokenNum;
      } else {
        tokensOut += rise.tokenNum;
      }
    }
    const usd =
      (tokensIn / 100000) * USD_PER_100K_IN +
      (tokensOut / 100000) * USD_PER_100K_OUT;
    return { tokensIn, tokensOut, usd };
  }
}
