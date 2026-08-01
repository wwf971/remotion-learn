# Remotion visual communication rules

These rules apply to explanatory animations, independently of their subject.

## Layout and focus

- Use a light canvas and clearly visible, lightly tinted major enclosures.
- Keep diagrams compact and text readable. Do not shrink the scene just to reserve caption space.
- Prefer continuous camera translation and zoom. Nested viewports can enlarge an object inside an enclosure.
- Keep document sections mounted in a vertical column and scroll to them. Show the focused section's own heading; avoid accidentally exposing the next heading instead.
- Keep related document cards overlapping during changes of active card. Exchange their positions once, smoothly; do not add unrelated compression, drift, or settling motion.
- Keep the card stack separate from other major scene objects.

## Explanations and leaders

- **Important**: Explanatory text can conver content, but try not make it cover important content / content directly related to current focused content. Do not reserve one fixed area for showing all the explanatory text. Try to seek relatively empty space without very much important content(for example, corner / near-edge place of a container where there is few content) to place the explanatory text, and it's acceptable to make explanatory text a little bit further away from its target if it can be placed in a very empty place.

- Use transparent text backgrounds, a red-toned main explanation and a softer supporting tone. Both text blocks reveal left to right together.
- Animate selection first, then the leader, then the text. Measure actual rendered target bounds, including all camera and viewport transforms.
- Derive the arrow endpoint and text origin from one shared layout. The arrowhead must sit next to the first visible text line, never next to empty space in a wide container.
- A leader leaving a rectangle must first travel perpendicular to that edge, outward, for a visible distance before turning. Never run the initial segment along or through the selected border.
- Avoid tiny stubs and unnecessarily long detours. A whole-object explanation selects the whole object, rather than an arbitrary point on its edge.
- Allow one explanation to branch to several related targets, using a shared junction and a single text anchor.
- Use clean, direction-aligned arrowheads without an extra moving circle at the arrow tip. An origin dot is appropriate only for an intentional point annotation.

## Process animation

- Show the process while explaining it. Keep relevant request paths visible during close-ups.
- Connect queries to the specific internal structures being processed, not repeatedly to the entire enclosure.
- Keep introductory close-ups on their intended fixed focus; do not add row switching outside the process that explains mapping. Preserve live connections across camera-only shot changes.
- Continuity must hold across shot boundaries, not only within each shot. Drive a focus band and query endpoint from the same continuous position.
- Animate counters and changing descriptions with shared clipped sliding transitions; keep outgoing and incoming values mounted. Use terminology that distinguishes mapping existing fields from creating fields.
- Put query labels clear of the connection stroke and endpoint handles.
- Audit every neighboring shot when correcting caption placement; prefer the space above dependency diagrams and result summaries before covering their contents.
- Move the colored focus band smoothly between rows. Keep its motion synchronized with query retargeting; do not abruptly toggle row backgrounds.
- Grow an API path from sender to receiver. Remove it by advancing its trailing boundary from sender toward receiver, keeping the destination end until last. Do not replace this with opacity fading or reverse growth.
- Moving particles must follow the same path geometry and arc-length parameterization as the visible line.
- Use right-angle routing for ordinary API queries. When depicting a time-sequence exchange, use bare vertical participant lifelines and downward-sloping message arrows: top is earlier, bottom is later. Do not substitute swimlane activity boxes.
- A time-sequence diagram may use message color to encode time, with a clear legend. Reveal messages chronologically, including responses, waits, repeated failures and eventual recovery or exception handling.
- Make important multi-step examples slow and explicit: read the inputs, show the outgoing write, append the result, then generate its operator or rule. Repeat distinct examples visibly.

## Implementation and review

- Reuse components and shared geometry/state for targets, highlights, connection endpoints, particles and callouts.
- Drive motion deterministically from frame time. Do not use CSS transitions or wall-clock animation.
- Inspect rendered frames at normal size, including transition midpoints and nearby shots. Check headings, text/arrow attachment, perpendicular exits, focus visibility and object separation.
- Validate temporal invariants as well as still frames: continuous focus motion, stable final positions, chronological process steps and correct path erasure direction.
- Keep the storyboard and implementation synchronized. Follow the requested language separately for on-screen text and technical documentation.
