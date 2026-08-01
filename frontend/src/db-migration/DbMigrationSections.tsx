import React from "react";
import { DbMigrationSequence } from "./DbMigrationSequence";
import { dbMigrationEase } from "./DbMigrationLayout";
import { dbMigrationMappingMotion } from "./DbMigrationMappingMotion";
import { interpolate } from "remotion";
import {
  DbMigrationColors as C,
  DbMigrationConnection as Connection,
  DbMigrationGrid as Grid,
  DbMigrationNode as Node,
  DbMigrationPanel as Panel,
  DbMigrationSchemaTable as Schema,
  DbMigrationText as Text,
  DbMigrationField,
} from "./DbMigrationPrimitives";

const sourceFields: DbMigrationField[] = [
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
const targetFields: DbMigrationField[] = [
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
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const DbMigrationMapping: React.FC<{ shot: string; tick: number }> = ({
  shot,
  tick,
}) => {
  const active = shot === "transform";
  const motion = dbMigrationMappingMotion(tick);
  const planFocus =
    shot === "mapping"
      ? motion.rows[1] + motion.rows[2]
      : 2 - dbMigrationEase(tick, 0, 25);
  return (
    <Panel
      x={1100}
      y={900}
      width={1600}
      height={650}
      title="テーブルと列のマッピング"
      eyebrow="01.1 / 参照以外の列を先に対応づける"
    >
      <Schema
        x={40}
        y={150}
        width={550}
        title="顧客"
        logical="dbo.Customer"
        fields={sourceFields.slice(0, 3)}
        rowProgress={shot === "mapping" ? motion.rows : undefined}
        color={C.source}
        side="right"
        active={Math.floor(planFocus)}
        highlightPosition={planFocus}
      />
      <Schema
        x={1010}
        y={150}
        width={550}
        title="取引先企業"
        logical="account"
        fields={targetFields.slice(0, 3)}
        rowProgress={shot === "mapping" ? motion.rows : undefined}
        color={C.target}
        side="left"
        active={Math.floor(planFocus)}
        highlightPosition={planFocus}
      />
      {["キー対応表", "前後の空白除去", "選択肢の変換"].map((label, i) => (
        <Connection
          key={label}
          from={[590, 298 + i * 72]}
          to={[1010, 298 + i * 72]}
          label={label}
          color={i === 1 ? C.warning : C.plan}
          progress={shot === "mapping" ? motion.operators[i] : 1}
        />
      ))}
      <Text x={800} y={522} size={22} color={C.muted} anchor="middle">
        参照は後で解決
      </Text>
      <Text x={45} y={610} size={27} color={active ? C.warning : C.muted}>
        {active
          ? "変換例： 「  青空商事  」 → 「青空商事」"
          : "接続端子は列を表す。データ行の識別には、別途キー対応表を使う。"}
      </Text>
    </Panel>
  );
};

export const DbMigrationChoices: React.FC<{
  tick: number;
  active: boolean;
}> = ({ tick, active }) => (
  <Panel
    x={0}
    y={1100}
    width={1000}
    height={600}
    title="選択肢の対応表"
    eyebrow="01.2 / 同じラベル ≠ 同じ保存値"
    color={C.warning}
  >
    <Grid
      x={35}
      y={150}
      width={930}
      headers={["意味", "SQL の値", "Dataverse の値"]}
      widths={[290, 230, 410]}
      rows={[
        ["有効", "1", "100000000"],
        ["休止", "2", "100000001"],
        ["未定義", "9", "要解決 → 計画を停止"],
      ]}
      highlight={active && tick > 100 ? 2 : 0}
      color={C.warning}
      rowHeight={78}
    />
    <Text x={40} y={480} size={29} color={C.warning}>
      名前ではなく、意味と値の組を確認
    </Text>
    <Text x={40} y={530} size={23} color={C.muted}>
      未定義値は例示。実行前に対応または対象範囲を確定。
    </Text>
  </Panel>
);

export const DbMigrationDependencies: React.FC<{
  shot: string;
  tick: number;
}> = ({ shot, tick }) => (
  <>
    <Panel
      x={2800}
      y={1100}
      width={1100}
      height={600}
      title="テーブルの取込順序"
      eyebrow="01.3 / 親 → 子"
      color={C.target}
    >
      <Node
        x={55}
        y={195}
        width={350}
        title="① 取引先企業"
        subtitle="参照される側・親"
      />
      <Node
        x={690}
        y={195}
        width={350}
        title="② 取引先担当者"
        subtitle="参照する側・子"
        color={C.source}
        active={shot !== "tables" || tick > 95}
      />
      <Connection
        from={[405, 250]}
        to={[690, 250]}
        label="取込順序 →"
        progress={
          shot === "tables" ? interpolate(tick, [40, 100], [0, 1], clamp) : 1
        }
      />
      <Connection
        from={[690, 345]}
        to={[405, 345]}
        label="← 参照先"
        color={C.warning}
        dashed
      />
      <Text x={55} y={440} size={31}>
        子の外部キー → 親の移行先 GUID
      </Text>
      <Text x={55} y={495} size={25} color={C.muted}>
        親の作成成功とキー対応を確認してから、子へ。
      </Text>
      <Text x={55} y={545} size={25} color={C.muted}>
        循環するテーブル参照も、二段階処理か要解決。
      </Text>
    </Panel>
    <Panel
      x={2800}
      y={1850}
      width={1100}
      height={600}
      title={
        shot === "cycles" ? "循環参照の扱い" : "自己参照を依存順位に分ける"
      }
      eyebrow="01.4 / 同じテーブルの行どうし"
      color={C.target}
    >
      {shot === "cycles" ? (
        <>
          <Node
            x={70}
            y={175}
            title="行 A"
            subtitle="B を参照"
            color={C.warning}
          />
          <Node
            x={750}
            y={175}
            title="行 B"
            subtitle="A を参照"
            color={C.warning}
          />
          <Connection
            from={[340, 210]}
            to={[750, 210]}
            label="参照"
            color={C.warning}
          />
          <Connection
            from={[750, 265]}
            to={[340, 265]}
            label="参照"
            color={C.warning}
          />
          <Text x={60} y={370} size={31}>
            ① 参照を外して行を作成
          </Text>
          <Text x={60} y={425} size={31}>
            ② GUID がそろったら参照を更新
          </Text>
          <Text x={60} y={510} size={26} color={C.warning}>
            後付けできない必須参照は、実行前に解決。
          </Text>
        </>
      ) : (
        <>
          {[
            ["本社", "順位 0 / 1 件"],
            ["東日本・西日本", "順位 1 / 2 件"],
            ["東京支店", "順位 2 / 1 件"],
          ].map(([title, subtitle], i) => (
            <Node
              key={title}
              x={40 + i * 360}
              y={195}
              width={300}
              title={title}
              subtitle={subtitle}
              active={shot !== "ranks" || tick > i * 65}
            />
          ))}
          {[0, 1].map((i) => (
            <Connection
              key={i}
              from={[340 + i * 360, 250]}
              to={[400 + i * 360, 250]}
              progress={
                shot === "ranks"
                  ? interpolate(tick, [50 + i * 65, 95 + i * 65], [0, 1], clamp)
                  : 1
              }
            />
          ))}
          <Text x={50} y={405} size={31}>
            顧客 4 件を、3 つの順位バッチへ
          </Text>
          <Text x={50} y={465} size={26} color={C.muted}>
            同じ順位の行は、さらにサイズで分割できる。
          </Text>
          <Text x={50} y={525} size={26} color={C.warning}>
            親が失敗したら、依存する子の送信を止める。
          </Text>
        </>
      )}
    </Panel>
  </>
);

export const DbMigrationPlan: React.FC<{ shot: string }> = ({ shot }) => (
  <Panel
    x={1100}
    y={1750}
    width={1600}
    height={700}
    title={
      shot === "identity" ? "行の識別と GUID 対応" : "取込順序とバッチ分割"
    }
    eyebrow="成果物 01 / 計画 v1・固定した対象 12 件"
  >
    {shot === "identity" ? (
      <>
        <Text x={45} y={166} size={29}>
          移行元の識別子 → 移行用 GUID → 移行先 GUID
        </Text>
        <Grid
          x={40}
          y={205}
          width={1520}
          headers={[
            "元テーブル + 主キー",
            "移行用 GUID",
            "移行先 GUID",
            "用途",
          ]}
          widths={[420, 330, 330, 440]}
          rows={[
            ["顧客 / 101", "…a101", "…d101", "本社"],
            ["顧客 / 102", "…a102", "…d102", "親 101 → …d101"],
            ["担当者 / …c001", "…c001", "…e001", "所属 101 → …d101"],
          ]}
          highlight={1}
          rowHeight={75}
        />
        <Text x={45} y={545} size={30} color={C.target}>
          再試行でも同じ GUID。二重作成を防ぐ。
        </Text>
        <Text x={45} y={605} size={25} color={C.muted}>
          GUID は表示用に省略。複合主キーは全構成列を保存する。
        </Text>
      </>
    ) : (
      <>
        <Text x={40} y={164} size={27} color={C.plan}>
          列対応・選択肢・変換・キー対応・参照解決・取込順序
        </Text>
        <Grid
          x={40}
          y={195}
          width={1520}
          headers={["順序 / テーブル", "分割方式", "境界 / 対象", "予定件数"]}
          widths={[350, 320, 610, 240]}
          rows={[
            ["① 取引先企業", "依存順位 0", "本社 / 101", "1"],
            ["① 取引先企業", "依存順位 1", "東日本・西日本 / 102, 103", "2"],
            ["① 取引先企業", "依存順位 2", "東京支店 / 104", "1"],
            [
              "② 取引先担当者",
              "GUID 範囲 1",
              "[最小値, 境界 G) / …c001–004",
              "4",
            ],
            [
              "② 取引先担当者",
              "GUID 範囲 2",
              "[境界 G, 上限] / …c005–008",
              "4",
            ],
          ]}
          highlight={shot === "batches" ? 3 : -1}
          rowHeight={62}
        />
        <Text x={45} y={600} size={24} color={C.warning}>
          境界 G は完全な GUID で保存。件数は固定した対象集合から実測。
        </Text>
        <Text x={45} y={648} size={24} color={C.muted}>
          範囲は重複・欠落なし。GUID の比較順も明示し、全工程で統一。
        </Text>
      </>
    )}
  </Panel>
);

export const DbMigrationExecution: React.FC<{ shot: string; tick: number }> = ({
  shot,
  tick,
}) => {
  if (shot === "retry" || shot === "dlq")
    return <DbMigrationSequence failure={shot === "dlq"} tick={tick} />;
  const final = shot === "execution-report";
  return (
    <Panel
      x={1100}
      y={2650}
      width={1600}
      height={650}
      title={final ? "DLQ と実行結果" : "バッチの実行手順"}
      eyebrow="成果物 02 / 計画 v1・実行 001"
      color={C.target}
    >
      {
        <>
          <Node
            x={40}
            y={150}
            width={450}
            title={final ? "11 件 成功" : "取引先 4 件"}
            subtitle={final ? "取引先 4 + 担当者 7" : "依存順位 0 → 1 → 2"}
          />
          <Node
            x={575}
            y={150}
            width={450}
            title={final ? "1 件 DLQ" : "担当者 8 件"}
            subtitle={final ? "担当者 …c008" : "親の成功後に開始"}
            color={final ? C.error : C.source}
          />
          <Node
            x={1110}
            y={150}
            width={450}
            title="12 件 対象"
            subtitle="計画と同じ対象集合"
            color={C.plan}
          />
          {final ? (
            <>
              <Text x={45} y={320} size={28} color={C.error}>
                DLQ / デッドレターキュー
              </Text>
              <Grid
                x={40}
                y={345}
                width={1520}
                headers={["元キー / 対象", "試行回数", "理由", "復旧情報"]}
                widths={[400, 210, 440, 470]}
                rows={[
                  [
                    "担当者 / …c008",
                    "4 回",
                    "一時障害・上限到達",
                    "バッチ 5 / 再実行待ち",
                  ],
                ]}
                highlight={0}
                color={C.error}
                rowHeight={80}
              />
              <Text x={45} y={560} size={25} color={C.muted}>
                元キー・対象
                GUID・エラー・試行時刻・計画版・変換済みデータを保存。
              </Text>
            </>
          ) : (
            <>
              <Connection
                from={[490, 205]}
                to={[575, 205]}
                progress={interpolate(tick, [30, 95], [0, 1], clamp)}
              />
              <Grid
                x={40}
                y={330}
                width={1520}
                headers={["読込", "変換", "送信", "永続化"]}
                rows={[
                  [
                    "バッチを取得",
                    "列・選択肢を変換",
                    "GUID を指定",
                    "成功 / 失敗を記録",
                  ],
                  [
                    "親の完了を確認",
                    "参照 GUID を解決",
                    "既存行は更新",
                    "再開位置を保存",
                  ],
                ]}
                rowHeight={76}
              />
              <Text x={45} y={590} size={26} color={C.muted}>
                送信後に応答を失った場合も、照合してから安全に再開する。
              </Text>
            </>
          )}
        </>
      }
    </Panel>
  );
};

export const DbMigrationVerification: React.FC<{
  shot: string;
  tick: number;
}> = ({ shot, tick }) => {
  const compare = shot === "compare";
  const report = shot === "report";
  return (
    <Panel
      x={1100}
      y={3500}
      width={1600}
      height={650}
      title={
        compare
          ? "変換後の値と参照の照合"
          : report
            ? "検証結果と未解決の例外"
            : "対象集合の照合"
      }
      eyebrow="成果物 03 / 計画 v1 + 実行 001 + 再読込結果"
      color={C.target}
    >
      {compare ? (
        <>
          <Text x={45} y={170} size={30}>
            顧客 102 → キー対応表 → account / …d102
          </Text>
          <Grid
            x={40}
            y={210}
            width={1520}
            headers={[
              "検査対象",
              "元データ → 期待値",
              "移行先の実データ",
              "判定",
            ]}
            widths={[270, 570, 440, 240]}
            rows={[
              ["会社名", "「 東日本 」 → 「東日本」", "東日本", "一致"],
              ["契約区分", "1 → 100000000", "100000000", "一致"],
              ["親取引先", "101 → …d101", "…d101", "一致"],
            ]}
            highlight={Math.min(2, Math.floor(tick / 65))}
            rowHeight={82}
          />
          <Text x={45} y={575} size={27} color={C.target}>
            同じ検査を、DLQ を除く全 11 件に適用する。
          </Text>
        </>
      ) : (
        <>
          <Node
            x={40}
            y={150}
            width={450}
            title="12 件 予定"
            subtitle="固定した元データ集合"
            color={C.plan}
          />
          <Node
            x={575}
            y={150}
            width={450}
            title="11 件 照合"
            subtitle={
              report ? "値・選択肢・参照が一致" : "対応 GUID で一件ずつ検索"
            }
          />
          <Node
            x={1110}
            y={150}
            width={450}
            title="1 件 例外"
            subtitle="DLQ は成功に含めない"
            color={C.error}
          />
          <Grid
            x={40}
            y={315}
            width={1520}
            headers={["検査", "対象", "結果"]}
            widths={[500, 550, 470]}
            rows={[
              [
                "欠落・重複の検査",
                "対象キーの集合を比較",
                report ? "欠落 0 / 重複 0" : "件数 + キー集合",
              ],
              [
                "変換後の値と参照",
                "DLQ を除く全 11 件",
                report ? "不一致 0" : "期待値と実データを比較",
              ],
              ["未解決の例外", "担当者 …c008 / DLQ", "修正 → 再実行 → 再検証"],
            ]}
            highlight={2}
            color={C.warning}
            rowHeight={65}
          />
          <Text x={45} y={610} size={29} color={report ? C.warning : C.muted}>
            {report
              ? "判定：例外あり / 全件完了ではない"
              : "DLQ 以外に欠落・不一致があれば、検証失敗として報告する。"}
          </Text>
        </>
      )}
    </Panel>
  );
};
