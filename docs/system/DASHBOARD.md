# CardVerse Dashboard

**Document ID:** CV-SYS-016
**Version:** 5.1.0
**Status:** Operational
**Classification:** System
**Owner:** Mostafa
**Created:** 2026-07-07
**Last Updated:** 2026-08-17

---

## Table of Contents

1. Purpose
2. How To Use This Document
3. Quick Status
4. Current Development Status
5. Implementation Status
6. Decision Log
7. Phase & Sprint Status
8. Remediation Plan (Sprint 10)
9. References
10. Version History

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

| Item                      | Value                                                    |
| ------------------------- | -------------------------------------------------------- |
| **Current Phase**         | Sprint 11.5 — Database Completion                        |
| **Current Sprint**        | Sprint 11.5 - Database Completion                        |
| **Current Task**          | 11.5.0 - Review and align schema.prisma with DATABASE.md |
| **Current Status**        | Pending                                                  |
| **Latest Commit**         | 405fd3d                                                  |
| **Latest Commit Message** | docs(system): complete sprint 10                         |
| **Next Task**             | 11.5.1 - Add missing entities                            |
| **Repository Status**     | Development                                              |
| **Current Version**       | 0.9.0                                                    |

---

## 4. Current Development Status

### Current Phase

Core Game Engine Development — implementing the actual Hokm game engine (Lobby, Room, Session, Turn Manager, Card Engine, Rule Executor, Bot Manager, Disconnect Manager) as defined in ARCHITECTURE.md. This phase was not previously tracked as a distinct phase; it has been added because the Platform Layer modules below do not include actual gameplay.

### Repository Health

- Git Repository: Healthy
- Documentation: Synchronization in progress (status below is now realistic; see 2026-08-14 updates)
- Development Environment: Backend ready; **PostgreSQL 18.6 installed and running** (service `postgresql-x64-18`, port 5432), database `cardverse` created; `.env` present — migrations pending

### Session Summary

**Sprints 0–4 — Completed (Platform Layer only):**
Repository standards, TypeScript foundation, shared tooling, backend foundation, Auth, User Management, Friends, Presence, Chat, Notifications, Matchmaking Foundation (queue only — not the actual match engine), Wallet, Shop, Inventory, and the full Frontend foundation with authentication integration. See Section 5 for the exact file-level breakdown.

**Sprint 6 — Core Game Engine Development (Completed):**
All Engine Layer modules implemented:

- Lobby Manager, Room Manager, Session Manager
- Turn Manager (timers per RULEBOOK.md)
- Card Engine + Rule Executor (Hokm/Saras/Naras/Tak Naras)
- Disconnect Manager (auto-kick, bot takeover, reconnection)
- Bot Manager (basic rule-following bot)
- Real-time communication with Socket.IO

**Sprint 7 — Integration & Testing (Complete):**

- Task 7.0: Integration of Engine Layer with Platform Layer — ✅ Complete
- Task 7.1: End-to-end testing — ✅ Complete
- Task 7.2: Production release preparation — ✅ Complete

**Sprint 10 – Realism & Remediation (In Progress):**
Auth has been successfully rewired to real JWT + Prisma and verified via /auth/guest and /auth/me (200 OK). Local PostgreSQL 18.6 is running, database `cardverse` is created, and migration `add_match_state` has been applied. Sprint now moves to build repair (10.5).

### Current Fixes in Progress

| Priority | Item                   | Description                                                      | Status   |
| -------- | ---------------------- | ---------------------------------------------------------------- | -------- |
| 1        | Prisma ESM/CommonJS    | Backend converted to ESM for Prisma 7 compatibility              | Complete |
| 2        | E2E Jest isolation     | Dedicated jest.e2e.config.cjs runs E2E via test:e2e              | Complete |
| 3        | Real Auth (JWT+Prisma) | auth.service.ts uses generateToken + Prisma; blocked on local DB | Blocked  |

### Open Items (Critical)

The following items must be resolved before the Production (V1) release.
**Note (2026-08-14):** statuses below were previously marked "Complete" but the codebase review showed they were overstated. They are now being re-verified in Sprint 10.

| Priority | Item                         | Description                                                                                 | Status      |
| -------- | ---------------------------- | ------------------------------------------------------------------------------------------- | ----------- |
| 1        | Auth Mock                    | Replace mock tokens with real JWT authentication                                            | ✅ Complete |
| 2        | **Socket.IO Authentication** | Real auth for Socket.IO; backdoor `directUserId` fallback must be removed                   | In Progress |
| 3        | Database Connection          | PostgreSQL 18.6 installed & running; db `cardverse` created; `.env` set; migrations applied | ✅ Complete |
| 4        | Game State Persistence       | `state` column added via migration `20260816150047_add_match_state`                         | ✅ Complete |
| 5        | **Deprecated Packages**      | Remove @types/helmet and @types/joi                                                         | ✅Complete  |

These items are recorded in CV-DEC-0018 (Auth Mock), and their corrected scheduling is defined in Sprint 10.

---

## 5. Implementation Status

### Overall Status (Accurate — separated by architectural layer)

| Layer                               | Modules                                                                                             | Status                                |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **Platform Layer**                  | Auth, User, Friends, Presence, Chat, Notifications, Matchmaking Foundation, Wallet, Shop, Inventory | In Progress (in-memory, DB not wired) |
| **Frontend (Platform-facing)**      | Auth integration, routing, protected routes (Login/Register only; no game client)                   | In Progress                           |
| **Engine Layer**                    | Lobby, Room, Session, Turn Manager, Disconnect Manager                                              | In Progress                           |
| **Matchmaking Integration**         | Integration Service, API Routes, Controller, Validator                                              | Complete                              |
| **E2E Testing**                     | 8 tests passing, but run against in-memory fallback (no real PostgreSQL)                            | In Progress                           |
| **Game Layer (Hokm)**               | Card Engine, Rule Executor, Bot Manager (basic logic) under game/; scoring/AI strategy pending      | In Progress                           |
| **Production Ready**                |                                                                                                     | Not Ready                             |
| **Shared / Tests / Tools packages** | Configuration only (shared/src/index.ts is empty — build risk)                                      | In Progress                           |

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

### Completed Engine Layer Modules

| Module                 | Files                                    | Status   |
| ---------------------- | ---------------------------------------- | -------- |
| **Engine Types**       | engine.types.ts                          | Complete |
| **Engine Service**     | engine.service.ts                        | Complete |
| **Turn Manager**       | turn/turn.manager.ts, turn/turn.types.ts | Complete |
| **Disconnect Manager** | disconnect/disconnect.manager.ts         | Complete |
| **Lobby Manager**      | lobby/lobby.manager.ts                   | Complete |
| **Room Manager**       | room/room.manager.ts                     | Complete |
| **Session Manager**    | session/session.manager.ts               | Complete |
| **Socket.IO**          | socket/index.ts                          | Complete |

### Completed Game Layer Modules (Hokm)

| Module            | Files                      | Status   |
| ----------------- | -------------------------- | -------- |
| **Card Engine**   | game/card/card.engine.ts   | Complete |
| **Rule Executor** | game/card/rule.executor.ts | Complete |
| **Bot Manager**   | game/bot/bot.manager.ts    | Complete |

### Not Yet Started

- Game Layer / Hokm — full scoring integration into engine.playCard and AI strategy
- Frontend game client integration (no playable board exists)
- Statistics / Achievements / Rankings / Seasons modules (declared V1 in PRODUCT_BIBLE but not implemented)
- PostgreSQL wiring for all platform modules (currently in-memory)

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

### CV-DEC-0015 — Hokm Rules Finalized (Saras/Naras/Tak Naras as Hokm Sub-Modes)

**Date:** 2026-07-12 · **Status:** Accepted
**Decision:** Saras, Naras, and Tak Naras are sub-modes selectable by the Hakem within Hokm itself — not separate future games. Full ranking tables, dealing math, and the Trick/Set/Match scoring hierarchy are finalized in RULEBOOK.md v0.2.0.
**Rationale:** These were previously miscategorized under "Future Games" in RULEBOOK.md, which would have misled future development.
**Consequences:** RULEBOOK.md rewritten; CARDVERSE_INDEX.md and other cross-references updated accordingly.

---

### CV-DEC-0016 — Future Game Roadmap Priority

**Date:** 2026-07-12 · **Status:** Accepted
**Decision:** Only card games are in scope. Priority order after Hokm: Bidel → Shelem → Haft Khabis → Bank (21) → Pasur (11) → Poker.
**Rationale:** Owner-defined priority based on player demand and development sequencing.
**Consequences:** Poker requires a separate "Poker Engine" (betting rounds, hand ranking, pot management) distinct from the shared trick-taking Card Engine used by the other games — this must be reflected in ARCHITECTURE.md before Poker development begins.

---

### CV-DEC-0017 — Real-time Communication Protocol

**Date:** 2026-08-04 · **Status:** Accepted
**Decision:** Socket.IO selected as the real-time communication protocol for in-match gameplay.
**Rationale:** Provides auto-reconnection, built-in room management, fallback support, and excellent integration with the existing Node.js/TypeScript stack. WebSocket alone would require manual reconnection logic; SSE is one-way only and insufficient for bidirectional gameplay.
**Consequences:** Socket.IO will be added as a dependency. All Engine Layer modules (Turn Manager, Disconnect Manager, etc.) will emit events through Socket.IO rooms. REST API (API.md) remains for all non-gameplay operations.

---

### CV-DEC-0018 — Auth Mock for Development

**Date:** 2026-08-07 · **Status:** Accepted
**Decision:** Use mock tokens (mock_access_guest_...) to facilitate development until real authentication is implemented.
**Rationale:** Accelerate development without requiring a full authentication infrastructure in early stages.
**Consequences:** Must be replaced with real JWT authentication before the Production release, at which point this decision will be revoked.

---

### CV-DEC-0019 — Backend ESM Conversion for Prisma 7

**Date:** 2026-08-12 · **Status:** Accepted
**Decision:** Convert backend from CommonJS to ESM by adding `"type": "module"`.
**Rationale:** Prisma 7 generates ESM-only code. Backend was CJS causing runtime crashes on load (`import.meta` in the generated client) and Jest module-resolution failures.
**Consequences:** Added `"type": "module"` to `backend/package.json`; added explicit `.js` extensions to all relative imports (NodeNext requirement); renamed `jest.config.js` → `jest.config.cjs`; removed the stale `moduleNameMapper`; added `jest.mock('../../db/prisma')` to Prisma-dependent unit tests; added `backend/tsconfig.test.json` (CommonJS compilation for Jest) and a `.js`-stripping `moduleNameMapper`; E2E (`__tests__/e2e`) isolated under `test:e2e`.

---

### CV-DEC-0020 — Sprint 10 Realism & Remediation (overriding overstated "Complete" flags)

**Date:** 2026-08-14 · **Status:** Accepted
**Decision:** A full codebase review revealed that several items previously marked `Complete` were overstated. Effective immediately, the project resets to an honest baseline and Sprint 10 corrects the real gaps before anything is re-marked complete.
**Rationale:** Production readiness must be based on verified reality (working build, real database, actually playable game), not on file counts or optimistic claims.
**Corrected gaps (from codebase review):**

- Auth: `auth.service.ts` was emitting mock tokens while `auth.middleware.ts` only accepts real JWT → all protected requests returned 401. Wired to `generateToken` + Prisma; **blocked pending a running PostgreSQL**.
- Database: no PostgreSQL installed/running on this machine; no Docker; no `.env` file. E2E tests ran against in-memory fallback, not a real DB.
- Migration: `state` column exists in `schema.prisma` but is missing from `migration.sql` → saveMatchState would fail on a fresh DB.
- Playback correctness: `engine.service.playCard` increments `tricksWon` optimistically and has a TODO to use `ruleExecutor.getTrickWinner` (the real trick winner is not computed in the live match flow).
- Frontend: only Login/Register exist — no playable game client. Build is broken (`src/index.ts` uses JSX but is named `.ts`). Port mismatch (frontend targets 5000, backend serves 3000).
- Shared: `shared/src/index.ts` and `shared/tsconfig.json` are empty files (a build time bomb).
- Socket auth backdoor: `directUserId` accepted without a token must be removed.
- Statistics/Achievements/Rankings/Seasons are declared V1 in PRODUCT_BIBLE but not implemented.
  **Consequences:** All affected `Complete` flags downgraded to `In Progress`/`Blocked`/`Not Ready` in this document. The full step-by-step remediation plan is captured in Section 8.

---

### CV-DEC-0021 — Local PostgreSQL as the Development Database

**Date:** 2026-08-14 · **Status:** Accepted
**Decision:** PostgreSQL 18.6 is the local development database. Database `cardverse` created on the dev machine; `psql` added to PATH (permanent); `.env` created from `.env.example` with real `DATABASE_URL` and a strong `JWT_SECRET`.
**Rationale:** Unblocks auth, migrations, and E2E testing that previously ran only against the in-memory fallback. A real local DB is required before any `Complete` flag for database-dependent items is restored.
**Environment facts (2026-08-14, dev machine):**

- Service: `postgresql-x64-18` running on port 5432 (auth: scram-sha-256; password required)
- CLI: `psql (PostgreSQL) 18.6` on PATH
- Database: `cardverse` created
- File: `.env` at repo root (contains the dev `DATABASE_URL`; password is user-set, not committed)
  **Consequences:** Prisma migrations can now be applied (`migrate deploy`), E2E can run against a real DB, and Sprint 10 items 10.3–10.7 can proceed. Anyone setting up a new machine should follow the Fresh Environment / AI Onboarding checklist (Section 7).

---

## 7. Phase & Sprint Status

### Phase Status

| Phase                         | Status      | Progress |
| ----------------------------- | ----------- | -------- |
| Project Foundation            | Completed   | 100%     |
| Documentation Standardization | Completed   | 100%     |
| Documentation Freeze          | Completed   | 100%     |
| Repository Foundation         | Completed   | 100%     |
| Platform Backend Development  | In Progress | ~70%     |
| Platform Frontend Development | In Progress | ~10%     |
| **Core Game Engine (Hokm)**   | In Progress | ~60%     |
| Integration                   | In Progress | ~40%     |
| Testing                       | In Progress | ~25%     |
| Production Release            | Pending     | 0%       |

### Sprints 0–4 — Completed (Platform Layer)

See CHANGELOG.md for the full task-by-task history of these sprints.

### Sprint 6 — Core Game Engine (Completed)

| Task | Description                                              | Status   |
| ---- | -------------------------------------------------------- | -------- |
| 6.0  | Lobby / Room / Session Manager                           | Complete |
| 6.1  | Turn Manager (timers per RULEBOOK.md §12)                | Complete |
| 6.2  | Card Engine + Rule Executor (Hokm/Saras/Naras/Tak Naras) | Complete |
| 6.3  | Disconnect Manager + Bot Manager (basic)                 | Complete |
| 6.4  | Real-time protocol decision + implementation             | Complete |

### Sprint 7 - Integration & Testing (Re-verified 2026-08-14)

| Task | Description                                     | Status                             |
| ---- | ----------------------------------------------- | ---------------------------------- |
| 7.0  | Integration of Engine Layer with Platform Layer | Complete                           |
| 7.1  | End-to-end testing                              | Complete (in-memory fallback only) |
| 7.2  | Production release preparation                  | Re-opened - claims were overstated |

### Sprint 8 - Production Hardening (Re-verified 2026-08-14)

| Task | Description                      | Status                                              |
| ---- | -------------------------------- | --------------------------------------------------- |
| 8.0  | Replace Auth Mock with JWT       | In Progress (real JWT wired, DB blocked)            |
| 8.1  | Add real database (PostgreSQL)   | Blocked - no local PostgreSQL                       |
| 8.2  | Implement game state persistence | In Progress - migration missing state column        |
| 8.3  | Socket.IO authentication         | In Progress - directUserId backdoor must be removed |

### Sprint 9 - Game Layer (Hokm) (In Progress)

| Task | Description                                  | Status   |
| ---- | -------------------------------------------- | -------- |
| 9.1  | Fix Prisma ESM/CommonJS Compatibility        | Complete |
| 9.2  | Isolate E2E tests with dedicated Jest config | Complete |

### Sprint 10 - Realism & Remediation (In Progress)

| Task | Description                                                                    | Status      |
| ---- | ------------------------------------------------------------------------------ | ----------- |
| 10.0 | Realism review and honest re-baseline                                          | ✅ Complete |
| 10.1 | Set up local PostgreSQL 18.6 (service running, db `cardverse` created)         | ✅ Complete |
| 10.2 | Create `.env` from `.env.example` with real DATABASE_URL + strong JWT_SECRET   | ✅ Complete |
| 10.3 | Apply Prisma migrations to `cardverse` db (incl. new `state` column migration) | ✅ Complete |
| 10.4 | Wire Auth to real JWT + Prisma; verify /auth/guest + /auth/me end-to-end       | ✅ Complete |
| 10.5 | Repair build: shared/index.ts, frontend index.tsx, port 3000                   | ✅ Complete |
| 10.6 | Replace optimistic tricksWon with real getTrickWinner                          | ✅ Complete |
| 10.7 | Remove Socket.IO auth backdoor                                                 | ✅ Complete |

### Sprint 11.5 - Database Completion (In Progress)

| Task   | Description                                                                                             | Status  |
| ------ | ------------------------------------------------------------------------------------------------------- | ------- |
| 11.5.0 | Review and align schema.prisma with DATABASE.md                                                         | Pending |
| 11.5.1 | Add missing entities: Profile, Friend, Wallet, Inventory, Achievement, Statistics, Season, Notification | Pending |
| 11.5.2 | Create and apply migrations for new entities                                                            | Pending |
| 11.5.3 | Wire User module to Prisma (replace in-memory)                                                          | Pending |
| 11.5.4 | Wire Wallet module to Prisma                                                                            | Pending |
| 11.5.5 | Wire Shop/Inventory modules to Prisma                                                                   | Pending |
| 11.5.6 | Wire Friends module to Prisma                                                                           | Pending |
| 11.5.7 | Verify all platform modules persist data correctly                                                      | Pending |

### Fresh Environment / AI Onboarding (READ THIS FIRST in a new system)

If this project is opened on a **different machine** (or with a new AI session), follow this exact order to know where to start:

1. **Read THIS file (DASHBOARD.md) first, top to bottom.** Its Quick Status and Version History tell you exactly where the project stands.
2. **Read README.md** for repo layout and the setup commands (`pnpm install`, `pnpm run build`, `pnpm run dev`).
3. **Read docs/system/CARDVERSE_INDEX.md** to locate any document you need.
4. **Read docs/system/PROJECT_RULES.md §2** for the document hierarchy — it decides which doc wins on conflict.
5. **Then run the environment bootstrap checklist (below).** Do not skip to implementing a feature before the checklist is green.

#### Environment Bootstrap Checklist (run every time on a fresh system)

| #   | Step                        | Verify command                                       |
| --- | --------------------------- | ---------------------------------------------------- |
| E1  | Node.js >= 20 available     | `node --version`                                     |
| E2  | pnpm installed (>= 9)       | `pnpm --version`                                     |
| E3  | PostgreSQL running on 5432  | `psql --version` and `pg_isready`                    |
| E4  | Database `cardverse` exists | `psql -U postgres -c "\l"` (password set on install) |
| E5  | `.env` exists at repo root  | check file presence; copy `.env.example` if missing  |
| E6  | Prisma client generated     | `cd backend && pnpm exec prisma generate`            |
| E7  | Migrations applied          | `cd backend && pnpm exec prisma migrate deploy`      |
| E8  | Backend type-checks         | `cd backend && pnpm build` (or `tsc --noEmit`)       |
| E9  | All tests pass              | `cd backend && pnpm test` then `pnpm test:e2e`       |

Only after E1–E9 pass should any AI begin a new implementation task. If a checklist item fails, fix the environment first — do not "work around" the failure in code.

#### Golden rule for each checklist pass

- Never mark a `Complete` flag in this document until its step **actually passes on a real database/render**.
- Commit each completed phase on a **feature branch**, never directly on `main` (PROJECT_RULES §10).

---

## 8. Remediation Plan (Sprint 10)

The following is the definitive, step-by-step recovery plan produced by the 2026-08-14 realism review. Each phase has a checkable definition of done. Work **on a feature branch**, commit each finished phase separately, and only re-mark a `Complete` flag after its step actually passes.

> Note: duplicate plan kept in this Dashboard per PROJECT_RULES ("everything operational belongs here"). Work is executed incrementally by the owner with AI assistance on blockers.

### Phase A — Backend critical fixes

- **A1. English-only code comments.** Translate remaining Persian comments in `backend/src/engine/engine.service.ts` and `eslint.config.js` (Decision DASHBOARD 2.9.0 requires English).
- **A2. Repair Auth (blocked on DB).** `auth.service.ts` now uses `generateToken(..)` + Prisma instead of mock tokens. Remaining: real Google ID token verification (replace `hashToken`), remove in-memory `Map`, and restore `/auth/me` to return the authenticated user.
  - **Definition of done:** `POST /api/v1/auth/guest` returns a real JWT; calling `GET /api/v1/auth/me` with that token returns 200 (not 401).
- **A3. Wire platform modules to PostgreSQL.** Migrate `user`, `wallet`, `shop`, `inventory`, `friends`, `chat`, `notifications`, `presence`, `matchmaking` services from in-memory `Map` to Prisma, one module at a time. Priority: User → Wallet → Shop/Inventory → Friends → rest.
  - **Definition of done:** Data survives a server restart.
- **A4. Align schema & migration.** Create a new Prisma migration adding the `matches.state` column (currently only in `schema.prisma`, missing from `migration.sql`).
  - **Definition of done:** `npx prisma migrate status` reports up-to-date.

### Phase B — Build & configuration

- **B1. Restore `shared` package.** Recreate the contents of `shared/src/index.ts` (`export * from './utils/index.js';` etc.) and a valid `shared/tsconfig.json`. `cd shared && pnpm build` must produce a populated `dist/index.js`.
- **B2. Fix frontend build.** Rename `frontend/src/index.ts` → `index.tsx` and update the `<script src>` in `frontend/index.html`. `cd frontend && pnpm build` must pass.
- **B3. Unify ports.** Target port **3000** (backend): update `frontend/src/services/auth.service.ts`, `frontend/vite.config.ts`, and `frontend/.env.example` (5000 → 3000).
  - **Definition of done:** A request from the frontend to `/api/v1/health` returns 200.

### Phase C — Game correctness & security

- **C1. Real trick winner.** In `engine.service.playCard`, replace the optimistic `tricksWon += 1` with `ruleExecutor.getTrickWinner` once 4 cards are in the trick, then call `scoringService.recordTrick`.
- **C2. Hokm declaration flow.** `handleDeclareHokm` must validate that only the Hakem declares during the DECLARATION phase, then move the Turn Manager to PLAYING.
- **C3. Remove Socket auth backdoor.** Delete the `directUserId` (tokenless) acceptance in `backend/src/socket/index.ts`; require a real JWT.

### Phase D — Frontend game client

Build the playable board: 4 seats, hands, table cards, Hakem declaration UI, and a Socket.IO client wired to `turn_started` / `card_played` / `match_updated` / `declare_hokm`. Then Lobby/Room, then Profile/Friends/Shop.

### Phase E — Testing & hardening

- Re-run E2E against a **real PostgreSQL** (`cd backend && pnpm test:e2e`), not the in-memory fallback.
- Reconcile test scripts: root `package.json` declares `test:unit`/`test:integration` that no workspace implements — either add them to `backend` or remove from root.
- Add CI (GitHub Actions): build + lint + test on every PR.
- Per PROJECT_RULES §10, stop committing directly to `main`; use `develop` and `feature/*`.

### Phase F — V1 scope decision

Decide and document whether **Statistics / Achievements / Rankings / Seasons** stay in V1 (and get built) or move to "Planned" in PRODUCT_BIBLE.md and ARCHITECTURE.md. Honest scope reduction is acceptable and preferable to phantom deadlines.

### Priority order (by impact)

1. A2 (Auth) → 2. A3 + A4 (Database) → 3. C1 + C2 (game correctness) → 4. B1 + B2 + B3 (build/ports) → 5. C3 (security) → 6. A1 + Phase D (cleanup + frontend).

---

## 9. References

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
- POSTGRESQL_PLAN.md

---

## 10. Version History

| Version       | Date                    | Description                                                                                                                                                                                                                                                                                                                                                                          |
| ------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0.0         | 2026-07-07              | Initial Dashboard created, merging PROJECT_STATUS, IMPLEMENTATION_STATUS, DECISION_LOG, and SYSTEM_START_HERE                                                                                                                                                                                                                                                                        |
| 1.1.0 – 1.8.0 | 2026-07-07 – 2026-07-08 | Sprint 1–4 task completions (see prior history in version control)                                                                                                                                                                                                                                                                                                                   |
| 2.0.0         | 2026-07-12              | Full consolidation: absorbed remaining Decision Log entries (CV-DEC-0001–0008); corrected Implementation Status to separate Platform Layer (complete) from Engine/Game Layer (not started); retired incorrect "Integration" sprint in favor of new Sprint 6 (Core Game Engine); this document is now permanently the single operational file — no new status files are to be created |
| 2.1.0         | 2026-08-03              | Engine Layer foundation: created Card Engine, Rule Executor, Turn Manager, and shared types                                                                                                                                                                                                                                                                                          |
| 2.2.0         | 2026-08-04              | Engine Layer: added Disconnect Manager and Bot Manager                                                                                                                                                                                                                                                                                                                               |
| 2.3.0         | 2026-08-04              | Engine Layer: added Lobby Manager, Room Manager, and Session Manager - all Engine modules complete                                                                                                                                                                                                                                                                                   |
| 2.4.0         | 2026-08-04              | Real-time communication implemented with Socket.IO; Engine Layer complete                                                                                                                                                                                                                                                                                                            |
| 2.5.0         | 2026-08-06              | Sprint 7.0: Integration of Engine Layer with Platform Layer complete; Matchmaking Integration API working                                                                                                                                                                                                                                                                            |
| 2.6.0         | 2026-08-07              | Sprint 7.1: End-to-end testing complete; all 8 tests passing                                                                                                                                                                                                                                                                                                                         |
| 2.7.0         | 2026-08-07              | Sprint 7.2: Production release preparation                                                                                                                                                                                                                                                                                                                                           |
| 2.8.0         | 2026-08-08              | Empty directories cleaned up; *.tsbuildinfo added to .gitignore                                                                                                                                                                                                                                                                                                                      |
| 2.9.0         | 2026-08-08              | Open Items (Critical) added; Sprint 8 planned; Persian text converted to English; Quick Status updated                                                                                                                                                                                                                                                                               |
| 3.0.0         | 2026-08-10              | Game Layer (Hokm) is the next task; Hokm rule/card/bot logic moved to the Game Layer under backend/src/game/; Sprint 8 complete; Open Items (Critical) resolved; documentation consistency updates                                                                                                                                                                                   |
| 3.1.0         | 2026-08-11              | Scoring System implemented and tested (15 tests passed); Jest configuration added; Game Layer development in progress                                                                                                                                                                                                                                                                |
| 3.2.0         | 2026-08-12              | Fixed Prisma ESM/CommonJS compatibility; backend converted to ESM                                                                                                                                                                                                                                                                                                                    |
| 3.2.1         | 2026-08-12              | Isolated E2E tests: dedicated jest.e2e.config.cjs; test:e2e now discovers and runs the E2E suite                                                                                                                                                                                                                                                                                     |
| 4.0.0         | 2026-08-14              | Realism review: downgraded overstated "Complete" flags to In Progress/Blocked/Not Ready; added CV-DEC-0020 and Section 8 (Remediation Plan); Auth wired to real JWT + Prisma (blocked on local PostgreSQL); documented total project progress at ~35-40%                                                                                                                             |
| 4.1.0         | 2026-08-14              | PostgreSQL 18.6 installed and running (service up, `cardverse` db created, psql on PATH); `.env` created; added CV-DEC-0021, Sprint 10 tasks 10.1-10.2 complete, and the "Fresh Environment / AI Onboarding" checklist; fixed stale DECISION_LOG.md reference in AI_DEVELOPER_GUIDE                                                                                                  |
| 4.2.0         | 2026-08-16              | Auth real JWT+Prisma verified; migration add_match_state applied; local PostgreSQL operational; Sprint 10 tasks 10.3 & 10.4 Complete                                                                                                                                                                                                                                                 |
| 4.3.0         | 2026-08-16              | Task 10.5 completed: shared/index.ts rebuilt, frontend index.ts renamed to index.tsx, ports unified to 3000                                                                                                                                                                                                                                                                          |
| 4.4.0         | 2026-08-17              | Task 10.6 completed: replaced optimistic tricksWon with ruleExecutor.getTrickWinner                                                                                                                                                                                                                                                                                                  |
| 5.0.0         | 2026-08-17              | Sprint 10 completed: local PostgreSQL, real JWT auth, build repair, real trick winner logic, Socket.IO auth backdoor removed                                                                                                                                                                                                                                                         |
| 5.1.0         | 2026-08-17              | Sprint 11.5 defined: Database Completion - align schema.prisma with DATABASE.md and wire platform modules to Prisma                                                                                                                                                                                                                                                                  |

---

**Document Status:** Operational

This is the single authoritative source for operational project status and decision history. It must be updated after every completed task or commit — no other file should track project status.
