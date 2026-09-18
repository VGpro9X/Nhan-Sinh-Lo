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
**V0.8 — Tu tiên / Huyền bí implemented. AWAITING USER TEST.**
Implemented: React/Vite/TypeScript responsive shell, random Tân Sinh, age progression, 5 stats, seeded event selection, choices with hidden effects, timeline, natural end-of-life, New Life, localStorage persistence and GitHub Pages workflow.

V0.1 was accepted by the user. V0.2 adds persistent consequence seeds, hidden flags, delayed callbacks, consequence chronicle markers, and save-compatible fallback for V0.1 saves. V0.2 was accepted by the user. V0.3 adds persistent NPCs, relationship strength, NPC memories, family/friend identities, relationship mutations from ordinary events, a dedicated Quan hệ tab, and migration fallback for older saves. V0.3 was accepted by the user. V0.4 adds persistent life roles, a deterministic adulthood career crossroads, initial Employee/Researcher/Freelancer roles, role-specific event pools mixed with generic life events, a dedicated Vai trò tab, and migration fallback for older saves. Occupations add context rather than locking the player into a class. V0.4 was accepted by the user. V0.5 adds the Entrepreneur role, persistent company state, company cash/market/reputation/staff/rival-pressure metrics, a dedicated Doanh nghiệp tab, trade-war events, staffing and expansion decisions, a persistent rival NPC, and a personal-conflict event that can damage the company and create a delayed consequence. Generic life events remain mixed into entrepreneur runs so business is not a closed campaign. V0.5 was accepted by the user. V0.6 adds a combat-decision module, discoverable martial path independent of occupation, trainable attack/defense/movement techniques, persistent martial power/experience/wounds, recurring grudges with a rival NPC, conflict resolution by attack/guard/evasion/de-escalation, and cross-system combat inside the entrepreneur storyline. V0.6 was accepted by the user. V0.7 adds persistent World State with yearly simulation ticks, economy/stability/technology/supernatural metrics, independently changing fictional organizations, world-news history, background NPC changes, world-conditioned life events, and economy effects on active businesses. A dedicated Thế giới tab exposes the simulation without crowding the main life screen. V0.7 was accepted by the user. V0.8 adds a discoverable cultivation/occult path that can emerge during ordinary life, persistent spirit-root/qi/foundation/realm state, cultivation methods, artifacts, occult investigation events, breakthrough risk, optional sect membership, a hidden-sect organization added to World State when discovered, cultivation-to-martial cross-effects, and realm-based longevity bonuses. A dedicated Tu tiên tab appears only after discovery. Do not start V0.9 until the user explicitly approves V0.8. If a bug is reported, fix and redeploy V0.8 first.
