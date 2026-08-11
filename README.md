# CardVerse

**Document ID:** CV-0001
**Version:** 0.5.0
**Status:** Frozen
**Classification:** Core
**Owner:** Mostafa
**Created:** 2026-06-26
**Last Updated:** 2026-08-11

---

# Vision

Build a scalable, modular and extensible online card game platform capable of supporting multiple traditional card games with a high-quality multiplayer experience.

---

# Mission

Create an enterprise-grade platform that delivers secure, fast and enjoyable multiplayer card games while remaining maintainable and extensible for many years.

---

# Project Status

Current project status, milestones and development progress are maintained in **DASHBOARD.md**.

---

# Version 1 Scope

## Included

- Hokm
- Multiplayer
- Authentication
- Matchmaking
- AI Bots
- Administration Panel

## Not Included

- Additional Card Games
- Mobile Applications
- Tournament System

---

# Core Goals

- Enterprise Architecture
- Modular Design
- High Performance
- Scalability
- Cross Platform
- Secure Backend
- Professional AI Bots
- Long-term Maintainability

---

## Planned Games

Future card games, in priority order (Hokm is the only game in Version 1 — see PRODUCT_BIBLE.md):

## Phase 2

- Bidel
- Shelem

## Phase 3

- Haft Khabis
- Bank (21)

## Phase 4

- Pasur (11)
- Poker (requires its own dedicated engine — see ARCHITECTURE.md Section 3.2.1)

Note: Saras, Naras, and Tak Naras are not separate games — they are rule sub-modes within Hokm itself (see RULEBOOK.md).

---

# Repository Structure

CardVerse/ - .git/ - .github/ - .husky/ - assets/ - backend/ - dist/ - node_modules - src/ - config/ - controllers/ - middleware/ - models/ - modules/ - auth/ - user/ - friends/ - routes/ - v1/ - services/ - utils/ - validators/ - backups/ - docs/ - core/ - API.md - ARCHITECTURE.md - DATABASE.md - PRODUCT_BIBLE.md - RULEBOOK.md - system/ - AI_DEVELOPER_GUIDE.md - CARDVERSE_INDEX.md - DASHBOARD.md - PROJECT_DNA.md - PROJECT_RULES.md - frontend/ - node_modules/ - shared/ - dist/ - node_modules/ - src/ - constants/ - types/ - utils/ - temp/ - tests/ - tools/ - .gitignore - CHANGELOG.md - LICENSE - package.json - pnpm-workspace.yaml - README.md

---

# Development Setup

## Prerequisites

| Tool    | Minimum Version | Verification Command |
| ------- | --------------- | -------------------- |
| Git     | 2.x             | `git --version`      |
| Node.js | 20.x            | `node --version`     |
| pnpm    | 9.x             | `pnpm --version`     |

## Quick Setup

```cmd
cd C:\Dev\CardVerse
pnpm install
pnpm run build
pnpm run dev
```

## Development Commands

| Command         | Purpose                   |
| --------------- | ------------------------- |
| pnpm install    | Install all dependencies  |
| pnpm run dev    | Start development servers |
| pnpm run build  | Build all packages        |
| pnpm run test   | Run all tests             |
| pnpm run lint   | Lint all code             |
| pnpm run format | Format all code           |

---

# Documentation

## Core Documents (Frozen)

**PRODUCT_BIBLE.md**

**RULEBOOK.md**

**ARCHITECTURE.md**

**DATABASE.md**

**API.md**

## System Documents

**PROJECT_DNA.md (Frozen)**

**PROJECT_RULES.md (Frozen)**

**DASHBOARD.md (Operational)**

**CARDVERSE_INDEX.md (Frozen)**

**AI_DEVELOPER_GUIDE.md (Frozen)**

**CHANGELOG.md (Operational)**

**POSTGRESQL_PLAN.md (Draft)**

---

# Engineering Principles

**Simplicity**

**Modularity**

**Scalability**

**Maintainability**

**Performance First**

**Security First**

**Documentation First**

---

# License

Private Project

All rights reserved.

---

# References

**CARDVERSE_INDEX.md**

**DASHBOARD.md**

**PRODUCT_BIBLE.md**

**ARCHITECTURE.md**

**DATABASE.md**

**API.md**

**PROJECT_RULES.md**

**PROJECT_DNA.md**

---

# Version History

| Version | Date       | Description                                                                                                                                                     |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1.0   | 2026-06-30 | Initial project README established                                                                                                                              |
| 0.1.0   | 2026-07-01 | Documentation Freeze completed                                                                                                                                  |
| 0.2.0   | 2026-07-07 | Updated with new documentation structure and setup guide                                                                                                        |
| 0.3.0   | 2026-07-12 | corrected Planned Games to the confirmed priority order (Bidel, Shelem, Haft Khabis, Bank/21, Pasur/11, Poker); clarified Sars/Nars/Tak Nars are Hokm sub-modes |
| 0.4.0   | 2026-08-09 | Updated References to use DASHBOARD.md; improved documentation structure                                                                                        |
| 0.5.0   | 2026-08-11 | Updated documentation: Scoring System completed; CHANGELOG updated                                                                                              |

```

```
