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
**V0.11 — Content Expansion implemented. AWAITING USER TEST.**

V0.10 was approved by the user's explicit request to continue development.

V0.11 expands the systemic life content without adding a new isolated campaign. The adulthood career crossroads now includes four additional occupations: Teacher, Medical Worker, Engineer, and Artisan, alongside the existing Employee, Researcher, Freelancer, and Entrepreneur routes. Each new occupation has its own event content while generic life, relationship, world, martial, cultivation, science, business, and crisis events remain able to cross into the same run.

The ordinary-life pool now includes additional travel, burnout, family debt, mentorship, rumors, side-skill learning, memories, and public-speaking situations. A separate relationship pool introduces recurring family, childhood-friend, extended-family, and neighbor situations.

Persistent NPC variety was expanded with extended-family and long-term-neighbor archetypes in every new life. Mentors, former students, and former apprentices can also be created dynamically by choices and delayed consequences.

The delayed consequence system now includes several new multi-year chains: caring for a parent, responding to a friend in crisis, neighborhood trust, mentorship, family debt, helping a student stay in school, helping a patient, reporting an engineering safety issue, and training an apprentice. These callbacks can change stats, NPC bonds/memories, create new persistent NPCs, and interact with Science when relevant.

V0.11 also adds anti-repeat memory. Each run stores the six most recent event titles; the Event Engine filters those events out when enough alternatives exist, reducing obvious back-to-back content repetition while preserving deterministic seeded selection and save compatibility. Older saves migrate with an empty recent-event history.

Do not start V0.12 until the user explicitly approves V0.11. If a bug is reported, fix and redeploy V0.11 first.
