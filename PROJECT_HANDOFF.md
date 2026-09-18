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
**V0.3 — NPC & Quan hệ implemented. AWAITING USER TEST.**
Implemented: React/Vite/TypeScript responsive shell, random Tân Sinh, age progression, 5 stats, seeded event selection, choices with hidden effects, timeline, natural end-of-life, New Life, localStorage persistence and GitHub Pages workflow.

V0.1 was accepted by the user. V0.2 adds persistent consequence seeds, hidden flags, delayed callbacks, consequence chronicle markers, and save-compatible fallback for V0.1 saves. V0.2 was accepted by the user. V0.3 adds persistent NPCs, relationship strength, NPC memories, family/friend identities, relationship mutations from ordinary events, a dedicated Quan hệ tab, and migration fallback for older saves. Do not start V0.4 until the user explicitly approves V0.3. If a bug is reported, fix and redeploy V0.3 first.
