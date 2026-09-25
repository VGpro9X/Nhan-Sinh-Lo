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
**V0.10 — Biến cố quy mô lớn implemented. AWAITING USER TEST.**

Implemented baseline through V0.9 remains intact: responsive React/Vite/TypeScript shell, seeded life events, delayed consequences, persistent NPC relationships, roles, business/trade war, martial conflict, World State, cultivation/occult, and science/technology.

V0.10 adds a persistent large-scale crisis system that can interrupt an ordinary life from adulthood onward. A run can enter one of several systemic crises: the fictional Border War, a supply-chain collapse, automated-infrastructure failure, or a supernatural Spirit Tide. Crises have severity, preparedness, community resilience, multi-year phases, escalation up to local-apocalypse conditions, recovery, World News integration, and save migration for older runs.

Crisis choices cross existing systems instead of forming a separate campaign. The player can protect family, stockpile, organize community relief, evacuate, exploit scarcity, redirect an active company to emergency supply, use martial ability to protect aid routes, apply science/technology to reduce the crisis, or use cultivation to establish a safe zone. Active crises suppress economy/stability in yearly World State ticks and leave an aftermath after resolution.

For testability, the first major crisis is guaranteed to surface from age 24 onward if no major crisis has occurred yet; its type is selected from current World State and the run seed, with science risk and supernatural conditions able to steer the outcome. The World tab now shows crisis severity/preparedness/community state, the life screen shows an active-crisis warning, and the chronicle records major-crisis entries.

V0.9 is considered approved by the user's explicit request to continue development. Do not start V0.11 until the user explicitly approves V0.10. If a bug is reported, fix and redeploy V0.10 first.
