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
**V0.4 — Nghề nghiệp không phải Class implemented. AWAITING USER TEST.**
Implemented: React/Vite/TypeScript responsive shell, random Tân Sinh, age progression, 5 stats, seeded event selection, choices with hidden effects, timeline, natural end-of-life, New Life, localStorage persistence and GitHub Pages workflow.

V0.1 was accepted by the user. V0.2 adds persistent consequence seeds, hidden flags, delayed callbacks, consequence chronicle markers, and save-compatible fallback for V0.1 saves. V0.2 was accepted by the user. V0.3 adds persistent NPCs, relationship strength, NPC memories, family/friend identities, relationship mutations from ordinary events, a dedicated Quan hệ tab, and migration fallback for older saves. V0.3 was accepted by the user. V0.4 adds persistent life roles, a deterministic adulthood career crossroads, initial Employee/Researcher/Freelancer roles, role-specific event pools mixed with generic life events, a dedicated Vai trò tab, and migration fallback for older saves. Occupations add context rather than locking the player into a class. Do not start V0.5 until the user explicitly approves V0.4. If a bug is reported, fix and redeploy V0.4 first.
