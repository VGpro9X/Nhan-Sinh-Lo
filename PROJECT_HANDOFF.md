# PROJECT HANDOFF — NHÂN SINH LỘ

## Canonical
Repository: VGpro9X/Nhan-Sinh-Lo
Branch: main
Game language: Vietnamese
Target: responsive web game, PC + mobile.
Deployment target: GitHub Pages.

## Product direction
Read MASTER_PLAN.md before development. Nhân Sinh Lộ is a systemic choice-driven Life Roguelite. Occupations are contexts, not classes. Systems and consequences must cross-pollinate.

## NON-NEGOTIABLE TEST GATE
After each meaningful version/checkpoint: finish only that checkpoint; build/test; commit/push main; deploy GitHub Pages; report version + test URL + checklist; STOP; continue only after explicit user approval.

## Current status
**V0.12 — Life Chronicle & Replayability implemented. AWAITING USER TEST.**

The user's explicit request to continue approved V0.11.

### Delivered in V0.12
- New `src/chronicle.ts` pure chronicle engine: descriptive lifetime titles/endings, meaningful highlights, roles, important NPCs/memories, causes and unresolved consequences, cross-system discoveries, and full archived history (capped to 400 logs per archived life with birth entry retained).
- New separate persistent multi-life archive under localStorage key `nhan-sinh-lo-chronicles-v1`. Stores up to the 24 newest lives, each with its own stable `lifeId`. The existing current-run key remains `nhan-sinh-lo-v01`; old saves get a `lifeId` during migration.
- A completed life is archived automatically on death. The redesigned Tân Sinh confirmation saves an unfinished active run as a readable "Viết dở" record before starting again, with protection against discarding progress if archive writing fails.
- Dedicated Biên Niên Sử tab: current life and past-life browser; lifetime summary and chronological milestones; the full archived logs in a collapsible section; important relationships and careers; archive-wide completed-life statistics and discovered rare journeys.
- Rare journeys are determined by actual player state rather than points: science plus cultivation, enhanced-body martial artist, crisis community guardian, mentorship legacy, a major company, high-realm long life, or a long ordinary life.
- UI layouts work on mobile and desktop; regular event playing remains on its own tab.
- CI workflow now runs `npm run typecheck`, `npm test`, and `npm run build` before every Pages deploy. The new Node test suite `tests/chronicle.test.mjs` has nine tests, covering archive deduplication, incomplete lives, archive limits, migration parsing, multi-life statistics, valid rare paths, ordinary-life outcomes, highlighting, and chronology.

### Test checklist for user
1. With a V0.11 save, refresh to V0.12 and check that the current run loads and the Biên Niên Sử tab opens.
2. Play several years, enter Biên Niên Sử, review milestones, roles, NPC memories and detailed log without losing the current event.
3. Choose Tân Sinh while alive; confirm the current life is saved as "Viết dở" and is accessible after starting a new run.
4. Finish a life by age or health; confirm it is automatically saved as "Đã khép lại" and view its descriptive ending.
5. Across multiple runs check totals and rare paths; inspect on a mobile display too.

### Non-negotiable gate
Do not begin V0.13 until the user explicitly approves V0.12. If they report a bug, fix and redeploy V0.12 first. All archive records are stored locally on the current browser/device only; clearing browser storage removes them. The 24-record cap is a storage safeguard and is not cloud synchronization.
