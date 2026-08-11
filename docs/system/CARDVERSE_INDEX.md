# CardVerse Documentation Index

**Document ID:** CV-SYS-004
**Version:** 0.4.0
**Status:** Frozen
**Classification:** System
**Owner:** Mostafa
**Created:** 2026-06-30
**Last Updated:** 2026-08-09

---

## Table of Contents

1. Purpose
2. Reading Order
3. Documentation Map
4. Topic Index
5. Document Responsibilities
6. Navigation Rules
7. References
8. Version History

---

## 1. Purpose

This document is the official navigation index for the CardVerse project.

Its purpose is to help developers and AI assistants quickly locate the authoritative document for any topic.

This document does not define project requirements, architecture or gameplay rules. It only identifies the authoritative document responsible for each topic.

---

## 2. Reading Order

New contributors should read project documentation in the following order:

1. README.md
2. PROJECT_DNA.md
3. PROJECT_RULES.md
4. CARDVERSE_INDEX.md
5. DASHBOARD.md
6. PRODUCT_BIBLE.md
7. ARCHITECTURE.md
8. DATABASE.md
9. API.md
10. RULEBOOK.md
11. AI_DEVELOPER_GUIDE.md
12. CHANGELOG.md

Following this order ensures a complete understanding of the project before implementation begins.

---

## 3. Documentation Map

| Document              | Primary Responsibility            |
| --------------------- | --------------------------------- |
| README.md             | Repository introduction and setup |
| PROJECT_DNA.md        | Project identity and philosophy   |
| PROJECT_RULES.md      | Engineering rules                 |
| DASHBOARD.md          | Operational status dashboard      |
| CARDVERSE_INDEX.md    | Documentation navigation          |
| PRODUCT_BIBLE.md      | Product requirements              |
| ARCHITECTURE.md       | Software architecture             |
| DATABASE.md           | Database design                   |
| API.md                | API standards                     |
| RULEBOOK.md           | Game rules                        |
| AI_DEVELOPER_GUIDE.md | AI development workflow           |
| CHANGELOG.md          | Version history                   |
| POSTGRESQL_PLAN.md    | Database integration plan         |

---

## 4. Topic Index

| Topic                   | Primary Document      | Related Documents            |
| ----------------------- | --------------------- | ---------------------------- |
| Product Vision          | PRODUCT_BIBLE.md      | PROJECT_DNA.md               |
| Project Philosophy      | PROJECT_DNA.md        | PROJECT_RULES.md             |
| Engineering Rules       | PROJECT_RULES.md      | AI_DEVELOPER_GUIDE.md        |
| Architecture            | ARCHITECTURE.md       | DATABASE.md, API.md          |
| Platform Modules        | ARCHITECTURE.md       | PRODUCT_BIBLE.md             |
| Matchmaking             | PRODUCT_BIBLE.md      | ARCHITECTURE.md, API.md      |
| Authentication          | API.md                | ARCHITECTURE.md              |
| User Profile            | PRODUCT_BIBLE.md      | DATABASE.md                  |
| Friends System          | PRODUCT_BIBLE.md      | DATABASE.md, API.md          |
| Wallet                  | DATABASE.md           | PRODUCT_BIBLE.md             |
| Shop                    | PRODUCT_BIBLE.md      | DATABASE.md                  |
| Statistics              | PRODUCT_BIBLE.md      | DATABASE.md                  |
| Seasons                 | PRODUCT_BIBLE.md      | DATABASE.md                  |
| Ranking                 | PRODUCT_BIBLE.md      | DATABASE.md, API.md          |
| AI Bots                 | ARCHITECTURE.md       | RULEBOOK.md                  |
| Game Rules              | RULEBOOK.md           | PRODUCT_BIBLE.md             |
| API Standards           | API.md                | PROJECT_RULES.md             |
| Database Design         | DATABASE.md           | ARCHITECTURE.md              |
| Documentation Structure | DASHBOARD.md          | PROJECT_RULES.md             |
| Development Setup       | README.md             | DASHBOARD.md                 |
| Implementation Status   | DASHBOARD.md          | README.md                    |
| Development Workflow    | AI_DEVELOPER_GUIDE.md | PROJECT_RULES.md             |
| Engineering Decisions   | DASHBOARD.md          | ARCHITECTURE.md              |
| PostgreSQL Integration  | POSTGRESQL_PLAN.md    | DATABASE.md, ARCHITECTURE.md |

## 5. Document Responsibilities

### Document Categories

**Core Documents** (docs/core/)
These documents define the permanent product and architecture. They are Frozen and rarely change.

- PRODUCT_BIBLE.md
- ARCHITECTURE.md
- DATABASE.md
- API.md
- RULEBOOK.md

**System Documents** (docs/system/)
These documents define processes, workflows and operational status. They may be Operational and evolve over time.

- PROJECT_DNA.md (Frozen)
- PROJECT_RULES.md (Frozen)
- DASHBOARD.md (Operational)
- CARDVERSE_INDEX.md (Frozen)
- AI_DEVELOPER_GUIDE.md (Frozen)
- CHANGELOG.md (Operational)

---

## 6. Navigation Rules

Before searching across the repository:

1. Consult this index.
2. Open the primary document for the topic.
3. Read related documents only when additional context is required.
4. Respect the document hierarchy defined in PROJECT_RULES.md.
5. If multiple documents reference the same topic, the document listed as the Primary Document is always considered authoritative.

This approach reduces duplicated work and prevents inconsistent interpretations.

---

## 7. References

- DASHBOARD.md
- PROJECT_RULES.md
- PROJECT_DNA.md
- README.md

---

## 8. Version History

| Version | Date       | Description                                                                                                  |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| 0.1.0   | 2026-06-30 | Initial documentation index established                                                                      |
| 0.1.0   | 2026-07-01 | Documentation Freeze completed                                                                               |
| 0.2.0   | 2026-07-04 | Added new system documents to index                                                                          |
| 0.3.0   | 2026-07-07 | Updated with new documentation structure (DASHBOARD)                                                         |
| 0.4.0   | 2026-08-09 | Updated References to remove deleted files (PROJECT_STATUS.md, REPOSITORY_SNAPSHOT.md, SYSTEM_START_HERE.md) |

---

**Document Status:** Frozen

This document is the official navigation guide for CardVerse documentation.

Every contributor should use this index to locate the authoritative source for any project topic.

Changes to this document require updating the Version History.
