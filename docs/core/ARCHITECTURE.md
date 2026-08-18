# CardVerse Architecture

**Document ID:** CV-3001
**Version:** 0.5.0
**Status:** Frozen
**Classification:** Technical
**Owner:** Mostafa
**Created:** 2026-06-26
**Last Updated:** 2026-08-18

---

## Table of Contents

1. Architecture Overview
2. System Layers
3. System Modules
4. Module Communication
5. Architectural Principles
6. Scalability Strategy
7. Real-Time Communication
8. Performance Requirements
9. Open Architectural Items
10. Future Evolution
11. References
12. Version History

---

## 1. Architecture Overview

### Purpose

This document defines the technical architecture of the CardVerse platform.

It describes the architectural style, system boundaries, module responsibilities and communication principles that govern the implementation of every component within the platform.

Every implementation, database schema and API must remain consistent with this architecture.

---

### Architecture Goals

The architecture must provide: High Performance, Scalability, Maintainability, Testability, Security, Extensibility, Reliability, Long-term Evolution.

---

### Architecture Style

#### Domain-Driven Design (DDD)

Business domains remain isolated and communicate only through well-defined contracts.

#### Hexagonal Architecture

Business logic remains independent from infrastructure, frameworks and external services.

#### Modular Monolith

Version 1.0 is implemented as a Modular Monolith. Each module remains logically independent while sharing a single deployment.

#### Microservice Ready

Major modules can be extracted into independent services in future versions without significant redesign.

---

### Architecture Philosophy

The platform is designed around reusable platform services. Games consume platform capabilities rather than implementing their own infrastructure (Authentication, Profiles, Friends, Chat, Matchmaking, Statistics, Achievements, Shop, Notifications, Wallet).

Every new game should reuse these services instead of creating duplicate implementations.

---

## 2. System Layers

CardVerse is organized into four primary layers.

### 2.1 Platform Layer

Reusable business services shared across every game: Authentication, User Management, Player Profiles, Friends, Presence, Chat, Notifications, Wallet, Shop, Inventory, Statistics, Achievements, Rankings, Seasons, Reports, Moderation, Analytics, Settings.

The Platform Layer contains no game-specific logic. **Status:** Core platform modules (Auth, User, Friends, Presence, Chat, Notifications, Matchmaking Foundation, Wallet, Shop, Inventory) are Complete for Version 1 and wired to PostgreSQL via Prisma. Statistics / Achievements / Rankings / Seasons are **deferred from V1 to "Planned"** (see DASHBOARD.md CV-DEC-0022).

### 2.2 Engine Layer

The Engine Layer provides generic gameplay infrastructure shared by trick-taking games (Hokm, and future Bidel/Shelem/Haft Khabis). **Status: Complete (see DASHBOARD.md Sprint 6).**

**Responsibilities:**

- Matchmaking (actual match creation, not just the queue)
- Lobby Management
- Room Management
- Session Management
- Turn Management
- Timer Management
- Event Dispatcher
- Disconnect Recovery
- Anti-Cheat
- Game Logging

Replay System is planned for a future release. The Engine Layer is **game-agnostic** — it never contains rules specific to Hokm or any other individual game. Game-specific logic lives in the Game Layer under `backend/src/game/` and is consumed by the Engine (see Section 2.3).

As of the 2026-08-10 architecture decision, the following were moved from the Engine Layer to the Game Layer:

- `card/rule.executor.ts` → `backend/src/game/card/rule.executor.ts` (Hokm rule/scoring logic)
- `card/card.engine.ts` → `backend/src/game/card/card.engine.ts` (deck + Hokm 5+4+4 dealing)
- `bot/bot.manager.ts` → `backend/src/game/bot/bot.manager.ts` (Hokm card-selection logic)

The Engine Layer continues to own the generic infrastructure: Lobby, Room, Session, Turn, Timer, Disconnect, Event Dispatcher, and game-agnostic flow control.

**Important scope note:** Poker does not use this Engine. See Section 3.2.1.

### 2.3 Game Layer

Every card game is implemented as an isolated module under `backend/src/game/`. Each game owns: Rules, Scoring, Card Logic, AI Logic, Match Configuration, Validation.

Games never communicate directly with one another. Adding a new game must not require modifying existing game modules. **Status: In progress — Hokm's rule logic, card dealing, and bot card-selection now live under `backend/src/game/` (see Section 2.2); full scoring integration and AI strategy belong to the Game Layer phase.**

### 2.4 Shared Layer

Reusable technical components: Utilities, Constants, Configuration, Logging, Error Handling, Localization, Shared Types, Caching, Feature Flags. Must remain independent from business and gameplay logic.

---

## 3. System Modules

### 3.1 Platform Modules

(Unchanged from prior version — Authentication, User Management, Profiles, Friends, Presence, Chat, Notifications, Wallet, Shop, Inventory, Statistics, Achievements, Rankings, Seasons, Reports, Moderation, Analytics, Settings. See DATABASE.md Section 4 for entity-level detail.)

### 3.2 Engine Modules

The Engine coordinates gameplay execution independently of individual games, for the trick-taking game family (Hokm and future Bidel/Shelem/Haft Khabis).

#### Matchmaker

Turns a queue entry (from the Platform Layer's Matchmaking Foundation) into an actual Room with 4 seated players.

#### Lobby Manager / Room Manager

Manages pre-match state: seating, ready checks, host settings. **Team seating rule (fixed for all trick-taking games in this Engine):** teammates are always seated directly opposite one another (seats 1&3 vs seats 2&4).

#### Session Manager

Owns the lifecycle of one Match from start to finish, including reconnection state.

#### Turn Manager

Enforces per-action timers and turn order (counter-clockwise, per RULEBOOK.md). For Hokm specifically:

- **Hokm declaration timer:** ~20 seconds. On timeout, a mode/suit is chosen at random on the Hakem's behalf.
- **Turn (play-a-card) timer:** ~8 seconds. On timeout, the system auto-plays a random _valid_ card (respecting follow-suit rules).

These values are game-specific configuration read by the Turn Manager, not hardcoded — future games may need different timer values.

#### Card Engine + Rule Executor

Loads the rule set of the active game (e.g. Hokm's 4 ranking modes from RULEBOOK.md Section 7) and determines: legal moves, trick winners, round/set completion, and match completion. Must be data-driven enough that adding a new trick-taking game does not require modifying this module — only adding a new rule-set definition consumed by it.

#### Disconnect Manager

Implements the inactivity/auto-kick rules from RULEBOOK.md Section 12 and Section 13:

- Tracks **consecutive** missed turns per player (resets on any turn played before the limit).
- After 3 consecutive missed turns, the player is removed from the seat on the 4th miss.
- The seat is taken over by a Bot Manager-controlled bot.
- The removed player may reconnect and reclaim the same seat later in the same Match, replacing the bot.
- For team disconnection: the teammate is notified and can choose to continue (bot replacement) or forfeit.

#### Bot Manager

Provides a fallback player for: (a) seats vacated via Disconnect Manager, and (b) any other bot-filled seat.

**Bot Scenarios:**

- 4 human players: 0 bots
- 3 human players: 1 bot
- 2 human players: 2 bots (one per team)
- 1 human player: 3 bots (early phase, invisible)
- 0 human players: 4 bots (testing only)

**Bot Limits:**

- Maximum 3 bots per match
- Bots never share a team with each other
- Bots are per-match instances (no global limit)

**Invisible Bots (Early Phase):**

- No "BOT" label
- No grayscale avatar
- Natural player names
- Realistic response delays
- Users must NOT know they are playing with bots

Version 1 scope is a basic rule-following bot (always plays a legal card). Advanced "professional play" heuristics (e.g. not overplaying a winning card when a partner already holds the trick) are explicitly deferred — see RULEBOOK.md Section 14 and the planned `BOT_AI_SPEC.md` (not yet created).

#### Anti-Cheat

Server-authoritative validation of every move against the Rule Executor's legal-move set; no client-supplied game state is ever trusted (see PROJECT_DNA.md — Server Authoritative).

#### Game Logger

Records match events for auditing and future Replay System support (planned, not Version 1).

### 3.2.1 Poker Engine (Separate From the Card Engine)

Poker (lowest priority in the roadmap — see PRODUCT_BIBLE.md) is **architecturally distinct** from the trick-taking Card Engine above. It requires its own engine with:

- Betting round management (pre-flop/flop/turn/river or equivalent)
- Hand ranking evaluation
- Pot and side-pot management
- All-in handling

This Poker Engine will be designed as its own document/section when Poker development begins. It must not be forced into the Card Engine's abstractions — attempting to do so would violate the Single Responsibility principle in PROJECT_DNA.md.

### 3.3 Game Modules

Each supported card game is implemented as an independent domain: Rule Engine, Scoring Logic, AI Logic, Card Definitions, Validation Rules, Match Configuration. Game modules must never depend on other game modules.

### 3.4 Shared Modules

Utilities, Configuration, Logging, Constants, Localization, Shared Models, Error Handling, Caching, Feature Flags. Must not contain business logic.

---

## 4. Module Communication

### Communication Principles

Modules communicate only through public interfaces. Direct access to another module's internal implementation is prohibited.

### Dependency Direction

Dependencies always point inward toward business logic. Infrastructure depends on Domain. Domain never depends on Infrastructure.

### Event-Driven Communication

Modules communicate through domain events where appropriate (e.g. Match Finished, Player Connected, Achievement Unlocked, Reward Granted, Player Auto-Kicked, Player Reconnected, Teammate Decision).

### Shared Contracts

Modules exchange only shared contracts and data models. Internal objects must never be exposed outside their owning module.

### Circular Dependencies

Strictly prohibited. Every module must remain independently testable.

### Game Isolation

Game modules communicate with Platform and Engine only, never directly with other games.

---

## 5. Architectural Principles

SOLID, DRY, KISS, YAGNI, Composition Over Inheritance, Convention Over Configuration, Separation of Concerns, Interface First, Server Authority. (Unchanged from prior version — see PROJECT_DNA.md for the philosophy behind these.)

---

## 6. Scalability Strategy

### Version 1.0

Modular Monolith, Single Database, Shared Runtime.

### Future Growth

Candidate modules for future extraction: Authentication, Matchmaking, Chat, Notifications, Analytics.

### Scalability Goals

Support increased concurrent players, additional card games, new gameplay features, cross-platform clients, independent module evolution.

---

## 7. Real-Time Communication

**Status: Decided — Socket.IO selected (see DASHBOARD.md CV-DEC-0017).**

Socket.IO was selected as the real-time communication protocol for in-match gameplay. It provides auto-reconnection, built-in room management, fallback support, and excellent integration with the existing Node.js/TypeScript stack.

**Consequences:** Socket.IO was added as a dependency. All Engine Layer modules (Turn Manager, Disconnect Manager, etc.) emit events through Socket.IO rooms. REST API (API.md) remains for all non-gameplay operations.

---

## 8. Performance Requirements

User-perceived performance is a Day 1 architectural requirement, not a later optimization pass (see PROJECT_DNA.md — Performance by Design).

- All card and table visual assets must be preloaded before a Match begins. No visible progressive/lazy loading of card faces during play.
- Sprite-sheet-style asset bundling is preferred over one network request per card image.
- Gameplay must feel instant and smooth once a Match starts — this applies to card animations, table rendering, and trick resolution alike.
- Purchasable/customizable assets (table backgrounds, avatars — see DATABASE.md Inventory entity) that are not required for the current Match may be lazy-loaded; only in-match-critical assets are subject to the preload requirement above.

---

## 9. Open Architectural Items

Recorded explicitly so they are addressed deliberately rather than assumed or forgotten:

1. ~~Real-time communication protocol~~ — **Resolved:** Socket.IO selected.
2. Bot AI decision-making algorithm — Version 1 needs only a legal-move-following bot (see Section 3.2, Bot Manager); a full strategic/professional-play specification is deferred to a future `BOT_AI_SPEC.md`.
3. Exact coin penalty for auto-kick — see RULEBOOK.md Section 14.
4. Poker Engine detailed design — deferred until Poker's turn in the roadmap (see PRODUCT_BIBLE.md); Section 3.2.1 only establishes that it must be architecturally separate.

---

## 10. Future Evolution

Microservices, Distributed Caching, Event Streaming, Replay Service, Tournament Service, Dedicated AI Service, Dedicated Analytics Pipeline. Must preserve the architectural principles defined in this document.

---

## 11. References

- CARDVERSE_INDEX.md
- DASHBOARD.md
- README.md
- PRODUCT_BIBLE.md
- DATABASE.md
- API.md
- RULEBOOK.md
- PROJECT_RULES.md
- PROJECT_DNA.md

---

## 12. Version History

| Version | Date       | Description                                                                                                                                                                                                                                                                                                   |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1.0   | 2026-06-30 | Enterprise architecture foundation                                                                                                                                                                                                                                                                            |
| 0.1.0   | 2026-07-01 | Documentation Freeze completed                                                                                                                                                                                                                                                                                |
| 0.2.0   | 2026-07-12 | added full Engine Layer module detail (Turn/Disconnect/Bot Manager per RULEBOOK.md v0.2.0); added Section 3.2.1 separating the Poker Engine from the shared Card Engine; added Section 7 (Real-Time Communication, open) and Section 8 (Performance Requirements); added Section 9 (Open Architectural Items) |
| 0.3.0   | 2026-08-09 | Updated Bot Manager with bot scenarios (0-3 bots), invisible bots for early phases, bot limits (max 3 per match, never share a team); added teammate decision event; resolved Real-Time Communication with Socket.IO selection                                                                                |
| 0.4.0   | 2026-08-10 | Game Layer now owns Hokm logic: Card Engine, Rule Executor, and Bot Manager moved from Engine to backend/src/game/; Engine Layer clarified as game-agnostic                                                                                                                                                   |
| 0.5.0   | 2026-08-18 | Platform Layer status clarified; Statistics/Achievements/Rankings/Seasons moved from V1 to "Planned" (DASHBOARD.md CV-DEC-0022)                                                                                                                                                   |

---

**Document Status:** Frozen

This document defines the official technical architecture of the CardVerse platform. All database schemas, APIs and implementations must remain consistent with this architecture.

Changes to this document require updating the Version History.
