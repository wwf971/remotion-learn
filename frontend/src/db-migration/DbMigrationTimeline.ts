export const DB_MIGRATION_FPS = 30;
export type DbMigrationPhase = "plan" | "execute" | "verify";
export type DbMigrationView =
  | "overview"
  | "source"
  | "target"
  | "mapping"
  | "choices"
  | "tables"
  | "ranks"
  | "plan"
  | "execution"
  | "verification";
export type DbMigrationShot = {
  id: string;
  phase: DbMigrationPhase;
  seconds: number;
  view: DbMigrationView;
  title: string;
  caption: string;
  detail: string;
  section?: boolean;
};

export const dbMigrationShots: DbMigrationShot[] = [
  {
    id: "intro",
    phase: "plan",
    seconds: 7,
    view: "overview",
    section: true,
    title: "01  移行計画をつくる",
    caption: "構造を読み取り、移行の設計図をつくる。",
    detail: "オンプレミス SQL Server → 既存の Dataverse テーブル",
  },
  {
    id: "collect",
    phase: "plan",
    seconds: 9,
    view: "overview",
    title: "両側の構造を収集",
    caption: "列・型・キー・参照関係と、対象データの件数を取得。",
    detail: "対象範囲と取得時点を固定し、同じデータ集合で計画・実行・検証する",
  },
  {
    id: "source",
    phase: "plan",
    seconds: 9,
    view: "source",
    title: "SQL Server のキーと参照",
    caption: "主キーは整数でもよい。外部キーが他の行を参照する。",
    detail: "自己参照の外部キーは、同じテーブルの別の行を指す",
  },
  {
    id: "target",
    phase: "plan",
    seconds: 9,
    view: "target",
    title: "Dataverse の構造",
    caption: "表示名・論理名・型を読み、既存テーブルへ対応づける。",
    detail: "行の主キーは GUID。ルックアップ列で他の行を参照する",
  },
  {
    id: "mapping",
    phase: "plan",
    seconds: 26,
    view: "mapping",
    title: "1.1  テーブルと列の対応",
    caption: "テーブル名が違っても、意味に基づいて列を結ぶ。",
    detail: "この図の各行は「列の定義」。参照列の解決は後の工程へ",
  },
  {
    id: "transform",
    phase: "plan",
    seconds: 10,
    view: "mapping",
    title: "変換を接続線に組み込む",
    caption: "空白除去・型変換・選択肢の変換を、計画に保存。",
    detail: "必須・長さ・精度・NULL の扱いも事前に検査する",
  },
  {
    id: "choices",
    phase: "plan",
    seconds: 12,
    view: "choices",
    title: "1.2  選択肢の値を対応づける",
    caption: "同じ「有効」でも、保存する数値は同じとは限らない。",
    detail: "ラベルだけで自動確定せず、意味を確認。未知の値は要解決",
  },
  {
    id: "tables",
    phase: "plan",
    seconds: 12,
    view: "tables",
    title: "1.3  テーブル間の参照",
    caption: "参照される親を先に、参照する子を後に取り込む。",
    detail: "SQL Server の外部キー → Dataverse のルックアップとして再構成",
  },
  {
    id: "ranks",
    phase: "plan",
    seconds: 12,
    view: "ranks",
    title: "1.4  テーブル内の参照",
    caption: "同じテーブルでも、親から子へ依存順位で分割する。",
    detail: "順位 0 の成功を確認してから順位 1、次に順位 2 へ進む",
  },
  {
    id: "cycles",
    phase: "plan",
    seconds: 10,
    view: "ranks",
    title: "循環は、順番だけでは解けない",
    caption: "参照を後付けできる場合は、行の作成後に参照を更新。",
    detail: "必須参照などで二段階処理ができない循環は、計画の確定前に解決",
  },
  {
    id: "identity",
    phase: "plan",
    seconds: 11,
    view: "plan",
    title: "行の識別を固定する",
    caption: "移行元の主キーと、移行先の GUID を永続的に対応づける。",
    detail: "既存行は代替キーで照合。新規行には GUID を割り当てて保存する",
  },
  {
    id: "batches",
    phase: "plan",
    seconds: 13,
    view: "plan",
    title: "範囲分割と依存順位を計画へ",
    caption: "通常は GUID 範囲、自己参照は依存順位でバッチを定義。",
    detail:
      "GUID のない元データには移行用 GUID を付与。境界・並び順・予定件数を固定",
  },
  {
    id: "seal",
    phase: "plan",
    seconds: 8,
    view: "plan",
    title: "実行できる移行計画",
    caption: "対応・変換・順序・バッチを、同じ版の計画にまとめる。",
    detail: "不明な選択肢、参照切れ、循環、重複キーを解決してから確定",
  },
  {
    id: "execute",
    phase: "execute",
    seconds: 7,
    view: "overview",
    section: true,
    title: "02  計画を実行する",
    caption: "計画を読み、結果を一件ずつ記録する。",
    detail: "再実行しても重複しない識別子と、永続的な実行履歴",
  },
  {
    id: "dispatch",
    phase: "execute",
    seconds: 10,
    view: "execution",
    title: "依存関係を守って送信",
    caption: "親の成功を確認し、変換した行を Dataverse へ送る。",
    detail: "例：取引先 4 件 → 担当者 8 件。計画全体では 12 件",
  },
  {
    id: "retry",
    phase: "execute",
    seconds: 13,
    view: "execution",
    title: "一時的な失敗は待って再試行",
    caption: "429 は指定時間を待つ。通信失敗は待機時間を延ばす。",
    detail: "応答を失っても、同じ GUID で照合してから再送する",
  },
  {
    id: "dlq",
    phase: "execute",
    seconds: 16,
    view: "execution",
    title: "上限を超えた行は隔離",
    caption: "初回 + 再試行 3 回で打ち切り、失敗行を DLQ に保存。",
    detail: "修正が必要なエラーは即時隔離。親に依存する行も未解決として記録",
  },
  {
    id: "execution-report",
    phase: "execute",
    seconds: 9,
    view: "execution",
    title: "実行レポートを残す",
    caption: "成功 11 件、DLQ 1 件。失敗の理由も、復旧に必要な情報も残す。",
    detail: "実行成功の記録だけでは、内容が正しいことの証明にはならない",
  },
  {
    id: "verify",
    phase: "verify",
    seconds: 7,
    view: "overview",
    section: true,
    title: "03  結果を検証する",
    caption: "計画と実行履歴を使い、移行先を読み直す。",
    detail: "「書けた」から「正しく移った」へ",
  },
  {
    id: "reconcile",
    phase: "verify",
    seconds: 11,
    view: "verification",
    title: "対象集合を照合",
    caption: "予定 12 件 = 検証対象 11 件 + DLQ 1 件。",
    detail: "件数だけでは不十分。移行キーごとに欠落と重複を検出する",
  },
  {
    id: "compare",
    phase: "verify",
    seconds: 13,
    view: "verification",
    title: "値・選択肢・参照まで検証",
    caption: "元データを計画どおり変換し、移行先の実データと比較。",
    detail: "GUID 対応表で検索し、親への参照も正しい GUID か確認する",
  },
  {
    id: "report",
    phase: "verify",
    seconds: 11,
    view: "verification",
    title: "移行レポートで例外を明示",
    caption: "11 件の整合を確認。残る 1 件は、修正・再実行・再検証へ。",
    detail: "DLQ が残っているため、全件完了とは判定しない",
  },
  {
    id: "outro",
    phase: "verify",
    seconds: 7,
    view: "overview",
    title: "計画 → 実行 → 検証",
    caption: "構造と識別を守り、失敗も追跡できる移行へ。",
    detail: "移行計画・実行レポート・移行レポートが、一つの証跡になる",
  },
];
export const dbMigrationEpisodes = [
  { id: "DbMigrationPlanning", phase: "plan" as const },
  { id: "DbMigrationExecution", phase: "execute" as const },
  { id: "DbMigrationVerification", phase: "verify" as const },
];
export const dbMigrationDuration = (phase?: DbMigrationPhase) =>
  dbMigrationShots
    .filter((s) => !phase || s.phase === phase)
    .reduce((n, s) => n + s.seconds * DB_MIGRATION_FPS, 0);
