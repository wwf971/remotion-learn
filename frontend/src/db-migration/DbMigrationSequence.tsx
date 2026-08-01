import React from "react";
import { interpolateColors } from "remotion";
import {
  DbMigrationPanel as Panel,
  DbMigrationText as Text,
  DbMigrationColors as C,
} from "./DbMigrationPrimitives";
import { dbMigrationEase } from "./DbMigrationLayout";

// A time-sequence diagram: bare lifelines and diagonal messages, not swimlane boxes.
const Message: React.FC<{
  from: [number, number];
  to: [number, number];
  label: string;
  color: string;
  progress: number;
}> = ({ from, to, label, color, progress }) => {
  const angle = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI;
  return (
    <g opacity={progress > 0 ? 1 : 0}>
      <path
        d={`M ${from.join(" ")} L ${to.join(" ")}`}
        stroke={color}
        strokeWidth={3}
        fill="none"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - progress}
      />
      <Text
        x={(from[0] + to[0]) / 2}
        y={(from[1] + to[1]) / 2 - 7}
        size={22}
        anchor="middle"
        color={color}
      >
        {label}
      </Text>
      {progress === 1 && (
        <path
          d="M 0 0 L -13 -6 L -13 6 Z"
          fill={color}
          transform={`translate(${to.join(" ")}) rotate(${angle})`}
        />
      )}
    </g>
  );
};
export const DbMigrationSequence: React.FC<{
  failure: boolean;
  tick: number;
}> = ({ failure, tick }) => {
  const color = (i: number) =>
    interpolateColors(
      i,
      [0, 1, 2, 3],
      ["#1769aa", "#6651ad", "#a2640d", "#bf3654"],
    );
  const dlq = dbMigrationEase(tick, 265, 285);
  return (
    <Panel
      x={1100}
      y={2650}
      width={1600}
      height={650}
      title={failure ? "再試行の上限から DLQ へ" : "要求と応答を時系列で追う"}
      eyebrow={`成果物 02 / 担当者 …${failure ? "c008" : "c003"}・初回 + 再試行 3 回`}
      color={C.target}
    >
      {[
        { x: 180, title: "オンプレミス DB" },
        { x: 680, title: "移行ツール" },
        { x: 1420, title: "Dataverse" },
      ].map((l) => (
        <g key={l.x}>
          <Text x={l.x} y={155} size={28} weight={650} anchor="middle">
            {l.title}
          </Text>
          <line
            x1={l.x}
            x2={l.x}
            y1={175}
            y2={615}
            stroke={C.muted}
            strokeWidth={3}
          />
          <path
            d={`M ${l.x - 6} 605 L ${l.x} 617 L ${l.x + 6} 605`}
            fill="none"
            stroke={C.muted}
            strokeWidth={3}
          />
        </g>
      ))}
      <Text x={40} y={340} size={22} color={C.muted}>
        時間 ↓
      </Text>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line
            x1={45}
            x2={95}
            y1={370 + i * 35}
            y2={370 + i * 35}
            stroke={color(i)}
            strokeWidth={5}
          />
          <Text x={110} y={377 + i * 35} size={19} color={color(i)}>
            {i === 0 ? "早" : "↓"}
          </Text>
        </g>
      ))}
      <Message
        from={[680, 180]}
        to={[180, 195]}
        label="対象行を読む"
        color={color(0)}
        progress={dbMigrationEase(tick, 20, 38)}
      />
      <Message
        from={[180, 202]}
        to={[680, 220]}
        label="キーとデータ"
        color={color(0)}
        progress={dbMigrationEase(tick, 38, 56)}
      />
      {[0, 1, 2, 3].map((i) => {
        const y = 240 + i * 70,
          start = 60 + i * 48;
        return (
          <g key={i}>
            <Message
              from={[680, y]}
              to={[1420, y + 18]}
              label={
                i === 0 ? "初回書込 / 同じ GUID" : `再試行 ${i} / 同じ GUID`
              }
              color={color(i)}
              progress={dbMigrationEase(tick, start, start + 18)}
            />
            <Message
              from={[1420, y + 30]}
              to={[680, y + 48]}
              label={
                i === 3 && !failure
                  ? "成功 / 結果を保存"
                  : i === 0
                    ? "429 / 指定時間を待つ"
                    : "一時障害 / 失敗"
              }
              color={color(i)}
              progress={dbMigrationEase(tick, start + 20, start + 38)}
            />
            {i < 3 && (
              <Text x={650} y={y + 62} size={20} anchor="end" color={C.muted}>
                {[1, 2, 4][i]} 秒待機
              </Text>
            )}
          </g>
        );
      })}
      <rect
        data-db-sequence-focus="true"
        x={failure ? 960 : 680}
        y={failure ? 552 : 450}
        width={failure ? 300 : 740}
        height={failure ? 70 : 56}
        fill="transparent"
      />
      {failure ? (
        <g opacity={dlq}>
          <rect
            x={960}
            y={552}
            width={300}
            height={70}
            rx={12}
            fill="#fce6eb"
            stroke={C.error}
            strokeWidth={3}
          />
          <Text
            x={1110}
            y={582}
            size={26}
            weight={700}
            anchor="middle"
            color={C.error}
          >
            DLQ / …c008
          </Text>
          <Text x={1110} y={608} size={20} anchor="middle" color={C.error}>
            4 回失敗・再実行待ち
          </Text>
          <Message
            from={[680, 535]}
            to={[960, 580]}
            label="例外を永続化"
            color={color(3)}
            progress={dbMigrationEase(tick, 285, 315)}
          />
        </g>
      ) : (
        <g opacity={dbMigrationEase(tick, 255, 280)}>
          <Text x={1030} y={580} size={26} anchor="middle" color={C.target}>
            応答を確認し、成功を記録
          </Text>
        </g>
      )}
      <Text x={280} y={608} size={20} color={C.muted}>
        色：早い時刻 → 遅い時刻 / 待機は模式表示
      </Text>
    </Panel>
  );
};
