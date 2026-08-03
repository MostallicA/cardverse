# CardVerse Dashboard

**Document ID:** CV-SYS-016
**Version:** 2.1.0
**Status:** Operational
**Classification:** System
**Owner:** Mostafa
**Created:** 2026-07-07
**Last Updated:** 2026-08-03

---

## Table of Contents

1. Purpose
2. How To Use This Document
3. Quick Status
4. Current Development Status
5. Implementation Status
6. Decision Log
7. Phase & Sprint Status
8. References
9. Version History

---

## 1. Purpose

This is the **single operational document** for the CardVerse project — the one file that must be updated after every completed task or commit.

It replaces and fully absorbs the former: `PROJECT_STATUS.md`, `IMPLEMENTATION_STATUS.md`, `DECISION_LOG.md`, and `SYSTEM_START_HERE.md`. Those four files are deleted; nothing in them should be recreated elsewhere.

**This document is the single source of truth for:** current project status, real implementation progress, and the full history of engineering decisions.

---

## 2. How To Use This Document

**For any AI assistant or contributor starting a new session:** read this document first, before any other. It alone tells you where the project currently stands. Read the other Frozen documents (PRODUCT_BIBLE, ARCHITECTURE, DATABASE, API, RULEBOOK, PROJECT_DNA, PROJECT_RULES) only for the topics relevant to the task at hand — they rarely change and do not need to be re-explained every session.

**After completing any task or commit, update this document:**

- Update Section 3 (Quick Status) and Section 4 (Current Development Status) to reflect the new state.
- Update Section 5 (Implementation Status) if files/modules were added or completed.
- Add a new entry to Section 6 (Decision Log) only if the task involved a decision with long-term impact (architecture, product direction, database, API, security). Do not log routine implementation details here.
- Update Section 7 (Phase & Sprint Status) if a task or sprint changed state.
- Bump the Version and Last Updated date at the top of this document.

Do not create new status/tracking files. Everything operational belongs in this one document.

---

## 3. Quick Status

| Item                      | Value                                                        |
| ------------------------- | ------------------------------------------------------------ |
| **Current Phase**         | Core Game Engine Development (Hokm)                          |
| **Current Sprint**        | Sprint 6                                                     |
| **Current Task**          | Turn Manager implementation                                  |
| **Current Status**        | In Progress                                                  |
| **Latest Commit**         | b90aff3 _(update after next commit)_                         |
| **Latest Commit Message** | chore(frontend): add react-router-dom and axios dependencies |
| **Next Task**             | Implement Disconnect Manager + Bot Manager                   |
| **Repository Status**     | Development                                                  |
| **Current Version**       | 0.9.0                                                        |

---

## 4. Current Development Status

### Current Phase

Core Game Engine Development — implementing the actual Hokm game engine (Lobby, Room, Session, Turn Manager, Card Engine, Rule Executor, Bot Manager, Disconnect Manager) as defined in ARCHITECTURE.md. This phase was not previously tracked as a distinct phase; it has been added because the Platform Layer modules below do not include actual gameplay.

### Repository Health

- Git Repository: Healthy
- Documentation: Synchronized (as of 2026-07-12 rewrite)
- Development Environment: Ready

### Session Summary

**Sprints 0–4 — Completed (Platform Layer only):**
Repository standards, TypeScript foundation, shared tooling, backend foundation, Auth, User Management, Friends, Presence, Chat, Notifications, Matchmaking Foundation (queue only — not the actual match engine), Wallet, Shop, Inventory, and the full Frontend foundation with authentication integration. See Section 5 for the exact file-level breakdown.

**Sprint 5 (previously "Integration") — superseded:**
This sprint was originally planned as "Integration" on the assumption that all gameplay modules already existed. That assumption was incorrect — the Engine Layer and Game Layer (the actual Hokm game) had not been built yet. Sprint 5 is retired in favor of Sprint 6 below.

**Sprint 6 — Core Game Engine Development (current):**
Not started. This sprint must deliver, per ARCHITECTURE.md Section 3.2 and RULEBOOK.md:

- Lobby Manager, Room Manager, Session Manager
- Turn Manager (including the ~8s turn timer and ~20s Hokm-declaration timer from RULEBOOK.md Section 12)
- Card Engine + Rule Executor implementing Hokm, Sars, Nars, and Tak Nars exactly as specified in RULEBOOK.md v0.2.0
- Disconnect Manager (auto-kick after 3 consecutive missed turns, bot takeover, reconnection support)
- Bot Manager (basic rule-following bot; advanced "professional play" heuristics are explicitly deferred — see RULEBOOK.md Section 13)

---

## 5. Implementation Status

### Overall Status (Accurate — separated by architectural layer)

| Layer                               | Modules                                                                                             | Status                                                 |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **Platform Layer**                  | Auth, User, Friends, Presence, Chat, Notifications, Matchmaking Foundation, Wallet, Shop, Inventory | Complete (backend)                                     |
| **Frontend (Platform-facing)**      | Auth integration, routing, protected routes                                                         | Complete                                               |
| **Engine Layer**                    | Lobby, Room, Session, Turn Manager, Card Engine, Rule Executor, Bot Manager, Disconnect Manager     | In Progress (Card Engine, Rule Executor, Turn Manager) |
| **Game Layer (Hokm)**               | Rule implementation, scoring, AI logic, match configuration                                         | **Not started**                                        |
| **Shared / Tests / Tools packages** | Configuration only                                                                                  | Complete                                               |

> **Why this table replaced the old "88/88 — 100%" summary:** the previous version only counted Platform Layer files and implied full project completion. The Engine and Game layers — the actual card game — had not been started. This table exists so that "percent complete" always reflects the whole project, not one layer of it.

### Completed Backend Modules (Platform Layer)

| Module                       | Files                                                   | Status   |
| ---------------------------- | ------------------------------------------------------- | -------- |
| **Auth**                     | 5 files (types, service, validator, controller, routes) | Complete |
| **User**                     | 5 files                                                 | Complete |
| **Friends**                  | 5 files                                                 | Complete |
| **Presence**                 | 5 files                                                 | Complete |
| **Chat**                     | 5 files                                                 | Complete |
| **Notifications**            | 5 files                                                 | Complete |
| **Matchmaking (queue only)** | 5 files                                                 | Complete |
| **Wallet**                   | 5 files                                                 | Complete |
| **Shop**                     | 5 files                                                 | Complete |
| **Inventory**                | 5 files                                                 | Complete |

### Completed Backend Infrastructure

| File                                   | Purpose             |
| -------------------------------------- | ------------------- |
| backend/src/utils/response.ts          | API response helper |
| backend/src/middleware/asyncHandler.ts | Async error wrapper |
| backend/src/middleware/validate.ts     | Request validation  |
| backend/src/routes/v1/index.ts         | API v1 routes       |
| backend/src/index.ts                   | Entry point         |
| backend/src/config/index.ts            | Configuration       |

### Not Yet Started

- Engine Layer (all modules)
- Game Layer / Hokm implementation
- Real-time communication protocol (WebSocket or equivalent) — not yet chosen; see ARCHITECTURE.md open item
- Bot AI behavior specification beyond basic rule-following

---

## 6. Decision Log

Only decisions with long-term impact (architecture, product direction, database, API, security, scalability, workflow, standards) are recorded here. Routine implementation details are not logged.

---

### CV-DEC-0001 — Documentation-First Development

**Date:** 2026-06-30 · **Status:** Accepted
**Decision:** All major business, architectural, and engineering decisions must be documented before implementation begins.
**Rationale:** Establishes a single source of truth and reduces ambiguity for future development, human or AI.

---

### CV-DEC-0002 — Platform-First Architecture

**Date:** 2026-06-30 · **Status:** Accepted
**Decision:** CardVerse is developed as a reusable gaming platform, not a single Hokm application.
**Rationale:** Shared infrastructure minimizes duplicated logic and simplifies future expansion to other games.

---

### CV-DEC-0003 — Modular Monolith as Initial Architecture

**Date:** 2026-06-30 · **Status:** Accepted
**Decision:** Version 1 uses a Modular Monolith designed for future microservice extraction.
**Rationale:** Reduces operational complexity while preserving clear module boundaries.

---

### CV-DEC-0004 — Server-Authoritative Gameplay

**Date:** 2026-06-30 · **Status:** Accepted
**Decision:** The server is the only trusted authority for gameplay and match outcomes; clients only handle input and presentation.
**Rationale:** Fairness, consistency, and cheat resistance.

---

### CV-DEC-0005 — Documentation Freeze Policy

**Date:** 2026-06-30 · **Status:** Accepted
**Decision:** Core documentation is reviewed, audited, and frozen before software development begins; later changes require documented revisions, not continuous rewrites.
**Rationale:** Stable documentation gives a reliable implementation foundation.

---

### CV-DEC-0006 — Single Source of Truth Documentation

**Date:** 2026-06-30 · **Status:** Accepted
**Decision:** Every topic has exactly one authoritative document; others may reference it but never redefine it.
**Rationale:** Eliminates conflicting documentation as the doc set grows.

---

### CV-DEC-0007 — Documentation Before Implementation

**Date:** 2026-06-30 · **Status:** Accepted
**Decision:** Implementation begins only after the relevant documentation reaches the required review state.
**Rationale:** Reduces architectural drift across multiple contributors and AI sessions over time.

---

### CV-DEC-0008 — Repository Bootstrap Strategy

**Date:** 2026-07-02 · **Status:** Accepted
**Decision:** Git repository, workspace configuration, and root package are created manually before implementation begins.
**Rationale:** Full control over repository architecture from the start.

---

### CV-DEC-0009 — Documentation Consolidation (Dashboard as Single Operational File)

**Date:** 2026-07-12 · **Status:** Accepted
**Decision:** `PROJECT_STATUS.md`, `IMPLEMENTATION_STATUS.md`, `DECISION_LOG.md`, and `SYSTEM_START_HERE.md` are permanently deleted and fully absorbed into this document (`DASHBOARD.md`), which becomes the single file updated after every task or commit.
**Rationale:** Multiple overlapping status files caused broken cross-references and made updates error-prone. A single operational file is simpler to maintain and gives any AI assistant one place to read for full current context.
**Consequences:** All future status/decision entries go here, not in new files.

---

### CV-DEC-0010 — Step-by-Step Development Protocol

**Date:** 2026-07-06 · **Status:** Accepted
**Decision:** Development follows a strict step-by-step protocol: the AI suggests commands, the user executes them, output is verified, and each step is confirmed before proceeding.
**Consequences:** Slower but more controlled and auditable development.

---

### CV-DEC-0011 — Module Organization Pattern

**Date:** 2026-07-06 · **Status:** Accepted
**Decision:** Each platform module follows: `modules/<name>/<name>.types.ts`, `.service.ts`, `.validator.ts`, `.controller.ts`, `.routes.ts`.
**Consequences:** Consistent structure across modules; supports future microservice extraction.

---

### CV-DEC-0012 — Step-by-Step AI Session Behavior Rules

**Date:** 2026-07-06 · **Status:** Accepted
**Decision:** AI_DEVELOPER_GUIDE.md enforces: one command per interaction, one file per step, explicit verification before proceeding, no assumptions about previous steps.

---

### CV-DEC-0013 — PowerShell With Absolute Paths for File Modifications

**Date:** 2026-07-06 · **Status:** Accepted
**Decision:** All file modifications use PowerShell with absolute paths, following read → backup → modify → verify.

---

### CV-DEC-0014 — Always Include CD Command Before File Operations

**Date:** 2026-07-06 · **Status:** Accepted
**Decision:** Every command block must start with `cd /d C:\Dev\CardVerse` before any file operation.

---

### CV-DEC-0015 — Hokm Rules Finalized (Sars/Nars/Tak Nars as Hokm Sub-Modes)

**Date:** 2026-07-12 · **Status:** Accepted
**Decision:** Sars, Nars, and Tak Nars are sub-modes selectable by the Hakem within Hokm itself — not separate future games. Full ranking tables, dealing math, and the Trick/Set/Match scoring hierarchy are finalized in RULEBOOK.md v0.2.0.
**Rationale:** These were previously miscategorized under "Future Games" in RULEBOOK.md, which would have misled future development.
**Consequences:** RULEBOOK.md rewritten; CARDVERSE_INDEX.md and other cross-references updated accordingly.

---

### CV-DEC-0016 — Future Game Roadmap Priority

**Date:** 2026-07-12 · **Status:** Accepted
**Decision:** Only card games are in scope. Priority order after Hokm: Bidel → Shelem → Haft Khabis → Bank (21) → Pasur (11) → Poker.
**Rationale:** Owner-defined priority based on player demand and development sequencing.
**Consequences:** Poker requires a separate "Poker Engine" (betting rounds, hand ranking, pot management) distinct from the shared trick-taking Card Engine used by the other games — this must be reflected in ARCHITECTURE.md before Poker development begins.

---

## 7. Phase & Sprint Status

### Phase Status

| Phase                         | Status      | Progress |
| ----------------------------- | ----------- | -------- |
| Project Foundation            | Completed   | 100%     |
| Documentation Standardization | Completed   | 100%     |
| Documentation Freeze          | Completed   | 100%     |
| Repository Foundation         | Completed   | 100%     |
| Platform Backend Development  | Completed   | 100%     |
| Platform Frontend Development | Completed   | 100%     |
| **Core Game Engine (Hokm)**   | **Pending** | **0%**   |
| Integration                   | Pending     | 0%       |
| Testing                       | Pending     | 0%       |
| Production Release            | Pending     | 0%       |

### Sprints 0–4 — Completed (Platform Layer)

See CHANGELOG.md for the full task-by-task history of these sprints.

### Sprint 6 — Core Game Engine (Current)

| Task | Description                                           | Status      |
| ---- | ----------------------------------------------------- | ----------- |
| 6.0  | Lobby / Room / Session Manager                        | Pending     |
| 6.1  | Turn Manager (timers per RULEBOOK.md §12)             | In Progress |
| 6.2  | Card Engine + Rule Executor (Hokm/Sars/Nars/Tak Nars) | In Progress |
| 6.3  | Disconnect Manager + Bot Manager (basic)              | Pending     |
| 6.4  | Real-time protocol decision + implementation          | Pending     |

### Sprint 7 — Integration & Testing (Planned)

| Task | Description                                     | Status  |
| ---- | ----------------------------------------------- | ------- |
| 7.0  | Integration of Engine Layer with Platform Layer | Pending |
| 7.1  | End-to-end testing                              | Pending |
| 7.2  | Production release preparation                  | Pending |

---

## 8. References

- README.md
- PROJECT_DNA.md
- PROJECT_RULES.md
- PRODUCT_BIBLE.md
- ARCHITECTURE.md
- DATABASE.md
- API.md
- RULEBOOK.md
- CARDVERSE_INDEX.md
- AI_DEVELOPER_GUIDE.md
- CHANGELOG.md

---

## 9. Version History

| Version       | Date                    | Description                                                                                                                                                                                                                                                                                                                                                                          |
| ------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0.0         | 2026-07-07              | Initial Dashboard created, merging PROJECT_STATUS, IMPLEMENTATION_STATUS, DECISION_LOG, and SYSTEM_START_HERE                                                                                                                                                                                                                                                                        |
| 1.1.0 – 1.8.0 | 2026-07-07 – 2026-07-08 | Sprint 1–4 task completions (see prior history in version control)                                                                                                                                                                                                                                                                                                                   |
| 2.0.0         | 2026-07-12              | Full consolidation: absorbed remaining Decision Log entries (CV-DEC-0001–0008); corrected Implementation Status to separate Platform Layer (complete) from Engine/Game Layer (not started); retired incorrect "Integration" sprint in favor of new Sprint 6 (Core Game Engine); this document is now permanently the single operational file — no new status files are to be created |
| 2.1.0         | 2026-08-03              | Engine Layer foundation: created Card Engine, Rule Executor, Turn Manager, and shared types                                                                                                                                                                                                                                                                                          |

---

**Document Status:** Operational

This is the single authoritative source for operational project status and decision history. It must be updated after every completed task or commit — no other file should track project status.
