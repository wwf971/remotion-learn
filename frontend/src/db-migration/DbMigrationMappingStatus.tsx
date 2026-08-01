import React, { useId } from "react";
import {
  DbMigrationColors as C,
  DbMigrationText as Text,
} from "./DbMigrationPrimitives";
import { dbMigrationMappingMotion } from "./DbMigrationMappingMotion";
import { dbMigrationEase } from "./DbMigrationLayout";

// Both values remain mounted inside one clip. A shared continuous offset drives
// the counter and pair descriptions, so neither can be replaced in a single frame.
const SlidingText: React.FC<{
  x: number;
  y: number;
  width: number;
  values: string[];
  position: number;
}> = ({ x, y, width, values, position }) => {
  const id = useId().replace(/:/g, "");
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={id}>
          <rect x={0} y={-43} width={width} height={70} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {values.map((value, i) => (
          <g key={i} transform={`translate(${(i - position) * width} 0)`}>
            <Text x={0} y={0} size={40} weight={600}>
              {value}
            </Text>
          </g>
        ))}
      </g>
    </g>
  );
};
export const DbMigrationMappingStatus: React.FC<{ tick: number }> = ({
  tick,
}) => {
  const motion = dbMigrationMappingMotion(tick);
  const stage =
    dbMigrationEase(tick, 175, 190) * (1 - dbMigrationEase(tick, 295, 320)) +
    dbMigrationEase(tick, 430, 445);
  return (
    <>
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={40}
          y={155 + i * 125}
          width={680}
          height={95}
          rx={14}
          fill={C.bg}
        />
      ))}
      <Text x={60} y={216} size={40} weight={600}>
        列の対応を設定：
      </Text>
      <SlidingText
        x={430}
        y={216}
        width={48}
        values={["1", "2"]}
        position={motion.pairSlide}
      />
      <Text x={490} y={216} size={40} weight={600}>
        / 2
      </Text>
      <SlidingText
        x={60}
        y={341}
        width={640}
        values={["会社名 → 取引先名", "契約区分 → 契約区分"]}
        position={motion.pairSlide}
      />
      <SlidingText
        x={60}
        y={466}
        width={640}
        values={["① 既存の列を読み取る", "② 対応ルールを計画へ"]}
        position={stage}
      />
    </>
  );
};
