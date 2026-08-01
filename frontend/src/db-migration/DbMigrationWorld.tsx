import React, { useId } from "react";
import { DbMigrationMappingStatus } from "./DbMigrationMappingStatus";
import { dbMigrationShots } from "./DbMigrationTimeline";
import {
  dbMigrationMappingMotion,
  dbMigrationReadMotion,
} from "./DbMigrationMappingMotion";
import {
  DbMigrationColors as C,
  DbMigrationPanel as Panel,
  DbMigrationSchemaTable as Schema,
  DbMigrationConnection as Connection,
  DbMigrationText as Text,
  DbMigrationField,
} from "./DbMigrationPrimitives";
import {
  DbMigrationMapping,
  DbMigrationChoices,
  DbMigrationDependencies,
  DbMigrationPlan,
  DbMigrationExecution,
  DbMigrationVerification,
} from "./DbMigrationSections";
import {
  dbMigrationDocumentForShot,
  dbMigrationDeck,
  DB_MIGRATION_CARD_SCALE,
  dbMigrationBoxes,
  dbMigrationTiles,
  dbMigrationViewport,
  dbMigrationEase,
  DbMigrationContainer,
  DbMigrationPose,
} from "./DbMigrationLayout";

const source: DbMigrationField[] = [
  { name: "顧客番号", logical: "CustomerId", type: "int / PK" },
  { name: "会社名", logical: "CompanyName", type: "nvarchar" },
  { name: "契約区分", logical: "StatusCode", type: "int" },
  {
    name: "親会社",
    logical: "ParentCustomerId",
    type: "int / FK",
    lookup: true,
  },
];
const target: DbMigrationField[] = [
  { name: "取引先 ID", logical: "accountid", type: "GUID / 主キー" },
  { name: "取引先名", logical: "name", type: "テキスト" },
  { name: "契約区分", logical: "new_contracttype", type: "選択肢" },
  {
    name: "親取引先",
    logical: "parentaccountid",
    type: "ルックアップ",
    lookup: true,
  },
];

// Each enclosure owns a clipped, independently movable 2D content plane.
const Viewport: React.FC<{
  width: number;
  height: number;
  pose: DbMigrationPose;
  children: React.ReactNode;
}> = ({ width, height, pose, children }) => {
  const id = useId().replace(/:/g, "");
  return (
    <>
      <defs>
        <clipPath id={id}>
          <rect
            x={24}
            y={132}
            width={width - 48}
            height={height - 156}
            rx={12}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect
          x={24}
          y={132}
          width={width - 48}
          height={height - 156}
          fill="#edf2f7"
        />
        <g
          transform={`translate(${width / 2} ${(height + 108) / 2}) scale(${pose.zoom}) translate(${-pose.x} ${-pose.y})`}
        >
          {children}
        </g>
      </g>
    </>
  );
};

const Database: React.FC<{
  kind: "source" | "target";
  shot: string;
  tick: number;
}> = ({ kind, shot, tick }) => {
  const b = dbMigrationBoxes[kind];
  const isSource = kind === "source";
  const color = isSource ? C.source : C.target;
  return (
    <Panel
      {...b}
      major
      title={isSource ? "SQL Server" : "Dataverse"}
      eyebrow={isSource ? "移行元 / オンプレミス" : "移行先 / 既存のテーブル"}
      color={color}
    >
      <Viewport
        width={b.width}
        height={b.height}
        pose={dbMigrationViewport(kind, shot, tick)}
      >
        <Schema
          x={20}
          y={35}
          width={900}
          title={isSource ? "顧客" : "取引先企業"}
          logical={isSource ? "dbo.Customer" : "account"}
          active={
            ["collect", "source", "target", "mapping", "transform"].includes(
              shot,
            )
              ? dbMigrationReadMotion(shot, tick).row
              : -1
          }
          highlightPosition={dbMigrationReadMotion(shot, tick).highlight}
          side={isSource ? "right" : "left"}
          fields={isSource ? source : target}
          color={color}
        />
        <Schema
          x={20}
          y={455}
          width={900}
          title={isSource ? "担当者" : "取引先担当者"}
          logical={isSource ? "dbo.Contact" : "contact"}
          fields={
            isSource
              ? [
                  {
                    name: "担当者番号",
                    logical: "ContactId",
                    type: "GUID / PK",
                  },
                  {
                    name: "所属顧客",
                    logical: "CustomerId",
                    type: "int / FK",
                    lookup: true,
                  },
                ]
              : [
                  {
                    name: "担当者 ID",
                    logical: "contactid",
                    type: "GUID / 主キー",
                  },
                  {
                    name: "所属取引先",
                    logical: "parentcustomerid",
                    type: "ルックアップ",
                    lookup: true,
                  },
                ]
          }
          color={color}
        />
      </Viewport>
    </Panel>
  );
};

// All variants are separate permanent sections; changing focus never replaces a section.
const Section: React.FC<{
  id: string;
  active: boolean;
  tick: number;
  shot: string;
}> = ({ id, shot, active, tick }) => {
  const t = active ? tick : 999;
  switch (id) {
    case "mapping":
      return (
        <svg width={1600} height={650} viewBox="1100 900 1600 650">
          <DbMigrationMapping
            shot={
              ["intro", "collect", "source", "target", "mapping"].includes(shot)
                ? "mapping"
                : "transform"
            }
            tick={
              ["mapping", "transform"].includes(shot)
                ? tick
                : ["intro", "collect", "source", "target"].includes(shot)
                  ? 0
                  : 999
            }
          />
        </svg>
      );
    case "choices":
      return (
        <svg width={1000} height={600} viewBox="0 1100 1000 600">
          <DbMigrationChoices active={active} tick={t} />
        </svg>
      );
    case "tables":
      return (
        <svg width={1100} height={600} viewBox="2800 1100 1100 600">
          <DbMigrationDependencies shot="tables" tick={t} />
        </svg>
      );
    case "ranks":
      return (
        <svg width={1100} height={600} viewBox="2800 1850 1100 600">
          <DbMigrationDependencies shot="ranks" tick={t} />
        </svg>
      );
    case "cycles":
      return (
        <svg width={1100} height={600} viewBox="2800 1850 1100 600">
          <DbMigrationDependencies shot="cycles" tick={t} />
        </svg>
      );
    case "identity":
    case "batches":
      return (
        <svg width={1600} height={700} viewBox="1100 1750 1600 700">
          <DbMigrationPlan shot={id} />
        </svg>
      );
    case "dispatch":
    case "retry":
    case "dlq":
    case "execution-report":
      return (
        <svg width={1600} height={650} viewBox="1100 2650 1600 650">
          <DbMigrationExecution shot={id} tick={t} />
        </svg>
      );
    default:
      return (
        <svg width={1600} height={650} viewBox="1100 3500 1600 650">
          <DbMigrationVerification shot={id} tick={t} />
        </svg>
      );
  }
};
const Document: React.FC<{
  kind: "plan" | "execution" | "verification";
  shot: string;
  tick: number;
}> = ({ kind, shot, tick }) => {
  const b = dbMigrationBoxes[kind];
  const pose = dbMigrationDeck(shot, tick).poses[kind];
  const active = dbMigrationDocumentForShot(shot);
  const previous =
    shot === "execute" ? "plan" : shot === "verify" ? "execution" : active;
  const changing = shot === "execute" || shot === "verify";
  const visibility = changing
    ? kind === active
      ? dbMigrationEase(tick, 25, 75)
      : kind === previous
        ? 1 - dbMigrationEase(tick, 75, 115)
        : 0
    : kind === active
      ? 1
      : 0;
  return (
    <g
      data-db-document={kind}
      transform={`translate(${pose.x} ${pose.y}) scale(${DB_MIGRATION_CARD_SCALE})`}
    >
      <Panel
        {...b}
        x={0}
        y={0}
        major
        title={
          {
            plan: "移行計画",
            execution: "実行レポート",
            verification: "移行レポート",
          }[kind]
        }
        eyebrow={
          {
            plan: "成果物 01 / 計画 v1・対象 12 件",
            execution: "成果物 02 / 実行 001・履歴と例外",
            verification: "成果物 03 / 検証結果と残課題",
          }[kind]
        }
        color={kind === "plan" ? C.plan : C.target}
      >
        <g opacity={visibility}>
          <Viewport
            width={b.width}
            height={b.height}
            pose={dbMigrationViewport(kind, shot, tick)}
          >
            {dbMigrationTiles[kind].map((tile) => (
              <g
                data-db-section={tile.id}
                key={tile.id}
                transform={`translate(${tile.x} ${tile.y})`}
              >
                <Section
                  id={tile.id}
                  shot={shot}
                  active={shot === tile.id}
                  tick={tick}
                />
              </g>
            ))}
          </Viewport>
        </g>
      </Panel>
    </g>
  );
};

export const dbMigrationWorldAnchor = (
  container: DbMigrationContainer,
  point: [number, number],
  shot: string,
  tick: number,
): [number, number] => {
  const b = dbMigrationBoxes[container];
  const p = dbMigrationViewport(container, shot, tick);
  const isDoc = container !== "source" && container !== "target";
  const origin = isDoc ? dbMigrationDeck(shot, tick).poses[container] : b;
  const scale = isDoc ? DB_MIGRATION_CARD_SCALE : 1;
  return [
    origin.x + (b.width / 2 + (point[0] - p.x) * p.zoom) * scale,
    origin.y + ((b.height + 108) / 2 + (point[1] - p.y) * p.zoom) * scale,
  ];
};
export const DbMigrationWorld: React.FC<{ shot: string; tick: number }> = ({
  shot,
  tick,
}) => {
  const requests = [
    "collect",
    "source",
    "target",
    "mapping",
    "transform",
    "execute",
    "verify",
  ].includes(shot);
  const write = ["mapping", "transform"].includes(shot);
  const motion = dbMigrationMappingMotion(tick);
  const mapping = shot === "mapping";
  const read = dbMigrationReadMotion(shot, tick);
  const progress = read.read;
  const duration =
    (dbMigrationShots.find((s) => s.id === shot)?.seconds ?? 10) * 30;
  const erase = Math.max(
    read.erase,
    ["collect", "source", "target"].includes(shot)
      ? 0
      : dbMigrationEase(tick, duration - 26, duration - 1),
  );
  const rowY = 183 + read.highlight * 72;
  const deck = dbMigrationDeck(shot, tick);
  return (
    <>
      <g data-db-container="source">
        <Database kind="source" shot={shot} tick={tick} />
      </g>
      <g data-db-container="target">
        <Database kind="target" shot={shot} tick={tick} />
      </g>
      <Panel
        x={1020}
        y={60}
        width={760}
        major
        height={600}
        title="データベース移行ツール"
        eyebrow="構造・識別・証跡を管理"
      >
        {mapping ? (
          <DbMigrationMappingStatus tick={tick} />
        ) : (
          ["01  収集と計画", "02  実行と再試行", "03  検証とレポート"].map(
            (s, i) => (
              <g key={i}>
                <rect
                  x={40}
                  y={155 + i * 125}
                  width={680}
                  height={95}
                  rx={14}
                  fill={C.bg}
                />
                <Text x={60} y={216 + i * 125} size={40} weight={600}>
                  {s}
                </Text>
              </g>
            ),
          )
        )}
      </Panel>
      {deck.changing ? (
        <>
          <g opacity={1 - deck.blend}>
            {deck.before.map((kind) => (
              <Document key={kind} kind={kind} shot={shot} tick={tick} />
            ))}
          </g>
          <g opacity={deck.blend}>
            {deck.after.map((kind) => (
              <Document key={kind} kind={kind} shot={shot} tick={tick} />
            ))}
          </g>
        </>
      ) : (
        deck.order.map((kind) => (
          <Document key={kind} kind={kind} shot={shot} tick={tick} />
        ))
      )}
      {requests && (
        <g opacity={read.opacity}>
          <Connection
            from={[1020, 260]}
            to={dbMigrationWorldAnchor("source", [920, rowY], shot, tick)}
            color={C.source}
            queryId="source"
            erase={erase}
            progress={progress}
            travel={(tick % 100) / 100}
            label={
              mapping
                ? read.row === 0
                  ? "顧客番号を読む"
                  : read.row === 1
                    ? "会社名を読む"
                    : "契約区分を読む"
                : "列の構造を取得"
            }
          />
          <Connection
            from={[1780, 420]}
            to={dbMigrationWorldAnchor("target", [20, rowY], shot, tick)}
            color={C.target}
            queryId="target"
            erase={erase}
            progress={progress}
            travel={(tick % 100) / 100}
            label={
              shot === "execute"
                ? "データを送信"
                : mapping
                  ? read.row === 0
                    ? "取引先 ID を読む"
                    : read.row === 1
                      ? "取引先名を読む"
                      : "契約区分を読む"
                  : "列の構造を取得"
            }
          />
          {write && (
            <Connection
              from={[1400, 660]}
              to={dbMigrationWorldAnchor(
                "plan",
                [800, mapping ? 298 + motion.row * 72 : 370],
                shot,
                tick,
              )}
              color={C.plan}
              erase={erase}
              progress={mapping ? motion.write : dbMigrationEase(tick, 60, 100)}
              travel={(tick % 100) / 100}
              label="対応ルールを記録"
            />
          )}
        </g>
      )}
    </>
  );
};
