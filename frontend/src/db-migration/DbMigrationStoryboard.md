# Database migration design — storyboard

A Japanese, silent explainer series about designing a migration tool, not an implementation of a production migration engine. Code comments and this document are English. Product names, schema identifiers, GUID, SQL, and DLQ remain technical identifiers in otherwise Japanese visuals. No narration or external image assets are required.

## Deliverables and playback

All compositions are 1920 × 1080, 30 fps, with deterministic frame-driven animation:

- `DbMigrationPlanning`: 148 seconds. Schema collection, mappings, dependency analysis, identity and batching.
- `DbMigrationExecution`: 55 seconds. Dispatch, retry, DLQ and execution report.
- `DbMigrationVerification`: 49 seconds. Reconciliation, value checks and final report.
- `DbMigrationComplete`: 252 seconds. The three episodes joined with continuous progress.

`DbMigrationTimeline.ts` is the authoritative timing and Japanese caption source. Each episode can also play independently; it starts with its own section title and initializes the relevant example state without depending on a previous render.

From `frontend`:

```sh
npm run dev
npx remotion still src/index.ts DbMigrationComplete out/DbMigrationMapping.png --frame=1500
npx remotion render src/index.ts DbMigrationComplete out/DbMigrationComplete.mp4
npx remotion render src/index.ts DbMigrationPlanning out/DbMigrationPlanning.mp4
npx remotion render src/index.ts DbMigrationExecution out/DbMigrationExecution.mp4
npx remotion render src/index.ts DbMigrationVerification out/DbMigrationVerification.mp4
```

## Visual language and architecture (compact card revision)

The overview uses the full composition width. Its world-camera scale is 0.60, twice the previous 0.30; it does not reserve a side column for explanation. A compact, horizontal Japanese callout occupies the band immediately beneath the progress/title area. Detail shots of documents use a larger full-width card with a short callout below it; database close-ups can use a side callout. Main and supporting text share one left-to-right reveal mask, starting and finishing together.

Major enclosures have opaque pale fills and strong colored outlines: blue SQL Server, green Dataverse, lavender software/plan, and green reports. Opaque document backgrounds prevent text from rear cards showing through the front card. The light workspace and dotted background remain.

World layout is deliberately tight:

- SQL Server `(0, 0)`, 900 × 700; Dataverse `(1900, 0)`, 900 × 700.
- Software `(1020, 60)`, 760 × 600, between the databases.
- All three documents share a card deck below the software. The front card starts at `(850, 950)` and is 1600 × 740 in its own coordinates, displayed at a world scale of 0.65. Rear cards offset upward and leftward by 70 world units each. All three cards and their content remain mounted.

Document sections form one **vertical column**. The plan contains mapping, choices, table dependencies, self-reference ranks, cycles, identity and batches, in that order. Execution contains dispatch, retry lifelines, failed-attempt/DLQ lifelines, and a separate persistent execution-results table. Verification contains reconciliation, detailed comparison and final exceptions. Focus moves by scrolling vertically to the relevant section using a section-centered pose and a scale that fits its full height (including its own title). Generous vertical gutters prevent neighboring titles from appearing at settled poses. The choice section is left-aligned; callouts may overlay any non-focused content. The document title remains stationary. No grid of miniature sections or document-wide zoom-out is used. End-of-phase shots stay on the relevant final section.

When the active phase changes, the cards exchange slots monotonically at frames 45–100. The old/new drawing orders crossfade at frames 70–95. There is no compression, rebound, or further movement after frame 100. All cards stay overlapping below the databases/software, with world y ≥ 810.

There are two orthographic transforms: the world camera and each enclosure's clipped content viewport. Database viewport zoom enlarges a selected table. Document viewport motion scrolls the single column. Camera transitions begin from the preceding shot's final pose, and viewport poses are derived from the full authored timeline for deterministic seeking.

### Accurate selections and synchronized callouts

Visible SVG rectangles carry semantic attributes for schema rows, grid rows, nodes and ETL operators. `DbMigrationSelection.ts` locates the actual selected element in the active section and measures its rendered bounds after layout. It normalizes Remotion Studio's preview scale using the explicit SVG canvas bounds (not the potentially zero-width outer container). The renderer waits for that measurement before taking the frame. This replaces the earlier hand-maintained coordinate table and automatically includes world camera, viewport, card scale and stacking transforms.

Callouts follow selection → leader → text:

- Frames 72–96 draw a selection rectangle or establish a red point.
- Frames 96–128 grow an orthogonal leader.
- Frames 130–170 reveal **both** Japanese text blocks together through one clipping mask.
- Fade before the shot ends. Mapping delays its final annotation by 500 frames; live Japanese read/write status is shown on the tool during the two cycles.

Callouts use one shared layout function for their text origin and leader endpoint. Every arrow ends 12 pixels before the first glyph at the first line's center; there is no independent endpoint or oversized empty text container. Authored quiet regions take priority: overview explanations sit below Dataverse, database explanations above the table, and report explanations in the space above their content. Other placements use space beside, above or below the measured target. They may overlay non-focused content; a feathered mask fades that underlying content while explicitly preserving the selected rectangle. No side or bottom region is reserved for explanations. Text backgrounds remain transparent, main and supporting text use red tones, and both roll out together. Arrowheads are filled triangles; only point annotations have an origin dot. Software explanations select the whole tool rectangle. The collection explanation branches from both measured query-path midpoints into one text anchor. Every rectangular selection leader first travels 36 screen pixels perpendicular to its edge before turning.

Requests and moving markers use the same orthogonal polyline and length-based sampling. Queries stay fully established through source and target introductions, on the primary-key column throughout. There is no row switching or end-of-shot erasure across these camera-only cuts. Mapping starts at that same row, slides to the name column at frames 35–60, then to the choice column at frames 295–320. Query endpoints and focus backgrounds use the same continuous row position. Query labels sit above the complete route, clear of its stroke and row handles. The tool says 「列の対応を設定」; its counter, pair names and process stage slide horizontally inside reusable clips instead of replacing text. Table-order, dependency-rank, cycle, dispatch and execution-result annotations join the other report annotations in the quiet upper area. The plan-write endpoint follows the card's viewport projection.

Files:

- `DbMigrationPrimitives.tsx`: palette, tinted major panels, schema/node/grid rectangles with semantic selection attributes, orthogonal routes and marker sampling.
- `DbMigrationSections.tsx`: permanent authored section contents.
- `DbMigrationLayout.ts`: compact world geometry, vertical section column, card exchange, camera and scroll poses.
- `DbMigrationWorld.tsx`: database viewports, document deck and request connections.
- `DbMigrationSelection.ts`: rendered selection measurements with frame-render synchronization.
- `DbMigrationCallout.tsx`: selection/leader animation and shared text reveal.
- `DbMigrationVideo.tsx`: world camera, annotation placement, progress and section titles.
- `DbMigrationTimeline.ts`: timings and Japanese wording; all episode durations are unchanged.

## Shot list

Times are relative to the combined video. Camera directions below identify the focus target; report-to-report travel uses the world camera and section-to-section travel uses the enclosing viewport camera. The caption column describes the intended English meaning; the exact Japanese is in the timeline file.

| Time | Shot | Camera / visual action | Teaching point |
| --- | --- | --- | --- |
| 00:00–00:07 | intro | Blurred overview; centered phase 01 title | Plan before writing data. Source left, tool center, target right. |
| 00:07–00:16 | collect | Overview; temporary queries connect tool to schema internals | Collect columns, types, keys, relationships and counts from both sides; fix the source scope and point in time. |
| 00:16–00:25 | source | Zoom into SQL Server enclosure | Integer Customer PK; GUID Contact PK; foreign keys and self-reference. |
| 00:25–00:34 | target | Pan to Dataverse enclosure | Existing tables, display/logical names, GUID IDs, choices and lookups. |
| 00:34–01:00 | mapping | Two row-specific read/write cycles in overview, then continuous zoom into completed mapping | Customer maps to account despite different names. Diagram rows represent column definitions, not data records. |
| 01:00–01:10 | transform | Hold; highlight name row and trim operator | Store cleaning and conversion operations in the mapping. Validate requiredness, length, precision and null handling. |
| 01:10–01:22 | choices | Pan to choice table; highlight unresolved value | Source 1 → target 100000000, source 2 → 100000001. Equal labels do not imply equal numeric codes. Unknown value 9 is a preflight example, resolved before the illustrated run. |
| 01:22–01:34 | tables | Pan right; reveal parent, order edge, then child | Import the referenced account before its contact. Read a dependency edge and a lookup edge in opposite directions. |
| 01:34–01:46 | ranks | Pan down; reveal three ranks | HQ first; east and west second; Tokyo third. Four Customer records in batches of 1, 2 and 1. |
| 01:46–01:56 | cycles | Viewport pans from the rank section to the separate A ↔ B section | No topological order exists for a cycle. If permitted, create without the cyclic reference, then patch; otherwise block plan finalization. |
| 01:56–02:07 | identity | Pan to plan; open persistent identity map | `(source table, source PK tuple)` maps to migration GUID and target GUID. Resolve existing rows by a validated alternate key. |
| 02:07–02:20 | batches | Plan viewport pans from the identity section to the separate batch section | Customer uses ranks. Eight Contact rows use two disjoint GUID ranges, each containing four actual rows. Persist comparison order, boundaries and counts. |
| 02:20–02:28 | seal | Hold on the final batch section of the vertically scrolled plan | Freeze mappings, transforms, keys, relationships, order, scope and batches under plan v1. Resolve blockers before execution. |
| 02:28–02:35 | execute | Return to overview; blurred phase 02 title | Execute the versioned plan and retain evidence. |
| 02:35–02:45 | dispatch | Zoom into execution artifact | Four accounts first, then eight contacts. Read, transform, write and persist per-item results. |
| 02:45–02:58 | retry | Report viewport pans to a lifeline sequence; diagonal requests and responses unfold downward | Contact c003 fails transiently then succeeds on retry 3. Backoff 1, 2, 4 seconds with jitter; 429 follows Retry-After. This is a compressed schematic, not a real-time timer. |
| 02:58–03:14 | dlq | Four failures unfold on lifelines; temporary DLQ receives the failed item | Different contact c008 exhausts all four attempts. Durable DLQ record includes source identity, attempts, error, batch and recovery status. |
| 03:14–03:23 | execution-report | Scroll continuously to the permanent execution-results table | A write acknowledgement is evidence of execution, not proof of semantic correctness. |
| 03:23–03:30 | verify | Overview; blurred phase 03 title | Read back from the target and compare against the plan and execution evidence. |
| 03:30–03:41 | reconcile | Move down to migration report | Planned set of 12 = verification set of 11 + explicit exception set of 1; compare identities, not just counts. |
| 03:41–03:54 | compare | Report viewport pans to its permanent comparison section; highlight rows | Customer 102 resolves to d102. Compare cleaned text, transformed choice, and parent lookup d101. Apply to all 11 non-DLQ records. |
| 03:54–04:05 | report | Report shows pass checks and unresolved exception | Zero missing/duplicate/mismatched records in the non-DLQ set. One DLQ exception remains; status is incomplete, not complete success. |
| 04:05–04:12 | outro | Return to overview | Plan, execution history and verification form a traceable migration. |

## Technical decisions and corrections

### Mapping terminology and schema collection

A schema-table row is a **column definition**. Its mapping is distinct from the identity mapping between **data records**. SQL Server exposes schema/table/column names and SQL types; Dataverse exposes display names, logical names and attribute metadata. SQL's ordinary foreign-key relationship corresponds conceptually to a Dataverse lookup; they are not identical implementations. A choice is a Dataverse enum-like field, while the source may use an integer code with a reference table or check constraint. Choice meaning must be established from business rules; translated labels alone are not a safe identity.

The example account choice is the custom `new_contracttype`, not Dataverse state/status, whose allowed combinations would need additional validation. `parentcustomerid` can target multiple table types; this fixture maps only to account. A real plan must retain the entity type with each polymorphic lookup.

Collection includes source PK/FK metadata, target writeability, required fields, nullability, type/length/precision restrictions, choice options, keys, source counts and referenced identities. Permissions, alternate-key readiness and unresolved relations are preflight concerns. The video assumes schema changes are unnecessary and target tables already exist.

### Dependency direction and cycles

The user's proposed ordering is reversed for ordinary lookup population: the **referenced parent is imported first**. The child can then store a valid target reference. Dependency arrows in the order diagram point parent → child; the explicitly labeled lookup arrow points child → parent. The same principle applies within a self-referencing table.

A self-referencing acyclic graph is partitioned by topological rank; all dependencies of a row must have succeeded before that row is dispatched. Failed parents cannot silently produce dangling child lookups: dependent records are blocked and explicitly accounted for as unresolved outcomes. The 12-row fixture's only final failure is a leaf Contact, so there are no blocked descendants in its totals.

Detect strongly connected components for both inter-table and intra-table cycles. A two-pass insert/patch strategy requires temporarily omitting the relevant references to be valid. Mandatory references or platform constraints may make it impossible; those cases stop preflight rather than pretending that a topological sort solved them. If two-pass work is used, both phases and their dependencies must be in the plan and verification must run after patch completion.

### Identity and batch contract

SQL Server rows do **not** inherently have GUIDs, and a PK can be composite. Use a unique, stable `(source system, table, canonical PK tuple)`; tables without a reliable key need an explicitly materialized staging identity before planning. Do not identify rows by mutable display names.

The example integer-keyed Customer rows receive migration GUIDs in a durable staging identity ledger. Existing target rows are matched through an explicitly selected, unique alternate key, then their actual target GUID is stored. New target rows receive a stable assigned GUID before writing. Retries reuse that mapping. The migration GUID and target GUID are separate fields: equality is possible, not assumed. Full GUIDs are persisted; suffixes in the video are display abbreviations only.

For non-self-referencing Contact, save a fixed list or source snapshot plus disjoint contiguous GUID boundaries. Use `[low, high)` except the explicitly inclusive final upper boundary. Save the exact comparator as part of the plan: SQL Server `uniqueidentifier` ordering is **not** interchangeable with string/byte lexical ordering. A practical implementation can materialize normalized migration GUIDs with a declared comparator in staging. The displayed boundary G is schematic; the serialized plan must contain full values. Measure counts, do not assume equal-width ranges contain equal numbers of rows. Store the member manifest/digest as well as boundaries, so no duplicates or gaps escape verification.

Self-referencing tables use rank batches, optionally subdivided by size within a rank, with completion barriers between ranks. They do not use GUID partitioning as the scheduling criterion. For the example: Customer ranks have 1 + 2 + 1 = 4 records; Contact ranges have 4 + 4 = 8 records. Total planned = 12.

### Execution semantics

Retry policy is a tool design decision: **one initial attempt plus at most three retries**, four total attempts. Contact c003 succeeds on the fourth attempt. Contact c008 exhausts four attempts and goes to the DLQ. Retry only transient failures; permanent validation errors can go directly to remediation. Honor Dataverse `Retry-After` for throttling and use bounded backoff with jitter for appropriate transport/server faults.

Persist per-item state, attempt timestamps, plan version/hash, batch identity, source and target keys, transformed payload reference and error information. A timeout can follow a committed write: reconcile the target by the same stable key/GUID before retrying. Do not generate a fresh target identifier each time. Resume from durable per-item outcomes, and handle partial batch successes individually. No claim of distributed exactly-once execution is made.

### Verification and completion

The reference set is a consistent source snapshot/staging export (or a defined cutoff with captured changes reconciled). Counts alone are insufficient, and comparing against a live, changing source without a cutoff can produce misleading results. Compare planned identities against successful, DLQ and any blocked/pending outcomes; every planned record must be accounted for exactly once.

For all non-DLQ records, locate the target by the persisted target GUID or validated alternate key, verify cardinality, and compare the planned transformation of every in-scope column, choice value and lookup target. Normalize time zones, decimal precision and null semantics according to explicit plan rules. Scope duplicate detection to migration identities rather than treating unrelated pre-existing target rows as unexpected migration rows. Report both execution failures and verification discrepancies; a recorded execution success is not trusted without readback.

The final fixture result is **11 verified, 1 DLQ, 0 additional discrepancies**. It is partial success with an unresolved exception, never an all-records-complete result. Repair the failed item, replay idempotently, then rerun verification and issue a new report revision.

## Primary references

- [SQL Server primary and foreign key constraints](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints): key and reference semantics.
- [SQL Server uniqueidentifier](https://learn.microsoft.com/en-us/sql/t-sql/data-types/uniqueidentifier-transact-sql): GUID type and ordering caveat.
- [Dataverse tables using code](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/entities): GUID primary keys and metadata.
- [Dataverse alternate keys](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/define-alternate-keys-portal): integration with external systems lacking target GUIDs.
- [Dataverse service protection limits](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/api-limits): throttling and Retry-After.

## Review checklist

Inspect overview, schema close-up, mapping operators, self-reference/cycle, batch table, retry, DLQ and final verification frames. Check Japanese glyph availability, no clipped labels, operator/handle alignment and legibility at 1080p. Confirm chapter openings blur only the diagram beneath the title; progress has phase and local-shot position. Check first/last frames of standalone episodes. Run repository lint/type checks and render compositions or representative stills before considering the series validated.

## Validation

The revised videos use the following frame counts: complete 7560; planning 4440; execution 1650; verification 1470, at 1920 × 1080 and 30 fps. Review the full-width overview, selected database table, vertically scrolled mapping/batch/retry/verification sections, and a card exchange in progress. Confirm that the red outline matches its actual row/node/operator and that both text blocks reveal together. All explanatory text is Japanese; comments and documentation are English. The videos have no narration.

Validation checks passed: repository ESLint/TypeScript and diff whitespace; orthogonal route sampling; viewport continuity across all shot boundaries; card position continuity; persistent stack overlap and separation from database/software bounds; callout endpoint attachment; and read/write/append/operator ordering. Rendered stills were inspected for the overview, mapping, source key, batch row, choice row, retry node, verification row and in-place card exchange.

### Row-level mapping choreography

The mapping shot lasts 26 seconds. Relative frames 65–140 query CompanyName and name; 150–180 grow the plan-write connection and move the camera into the plan; 185–210 append the paired rows; 215–245 generate the trim operator. Frames 260–300 return to overview. Frames 320–395 query StatusCode and new_contracttype; 405–435 write and move into the plan; 440–465 append both definitions; 470–500 generate the choice-conversion operator. Read paths erase from sender to receiver between cycles. The tool displays the current pair and read/write stage in Japanese. Both database rows and appended plan rows receive colored backgrounds. Endpoints use the same viewport projection as the rows. The initial key mapping remains present; lookup columns are deferred to relationship analysis. The final annotation begins after these two cycles.

### Retry and DLQ lifelines

Both retry examples use three bare vertical lifelines: source database, migration tool, and target database. Requests and responses slope downward to their receivers; time runs from top to bottom. Blue → purple → amber → red encodes progressively later messages, with a legend. The tool reads the source once, then attempts the same target identity four times. Requests/responses reveal chronologically. Waiting intervals are compressed and labeled 1, 2 and 4 seconds; the first 429 response explicitly requires its server-provided delay. The c003 example succeeds on the fourth attempt. The c008 example fails all four attempts, creates a temporary DLQ between tool and target at frames 265–285, and draws the exception-write arrow at frames 285–315. DLQ remains visible through that example, then the document scrolls to a separate results table. The DLQ shot lasts 16 seconds so its final outcome can be read. These are time-sequence diagrams, not swimlane activity boxes.

### Reusable authoring manual

`frontend/remotion_skills.md` records the reusable layout, callout, perpendicular-exit, branching, focus-slide, tail-erasure, card-motion and time-sequence rules without project-specific content.

The annotation attenuation mask now uses the measured text block height, rather than a fixed 220-pixel area, so nearby headings remain visible. `DbMigrationMappingStatus.tsx` keeps both counter values and both pair descriptions mounted and moves them through clipped horizontal slots. Validation includes every frame of the introductory shots and mapping boundaries, plus caption placements for table order, ranks, cycles, dispatch and execution results.
