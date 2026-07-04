# CardVerse Documentation Index

**Document ID:** CV-SYS-004
**Version:** 0.2.0
**Status:** Frozen
**Classification:** System
**Owner:** Mostafa & ChatGPT
**Created:** 2026-06-30
**Last Updated:** 2026-07-04

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
5. PROJECT_STATUS.md
6. SYSTEM_START_HERE.md
7. REPOSITORY_SNAPSHOT.md
8. SETUP_GUIDE.md
9. IMPLEMENTATION_STATUS.md
10. PRODUCT_BIBLE.md
11. ARCHITECTURE.md
12. DATABASE.md
13. API.md
14. RULEBOOK.md
15. GLOSSARY.md
16. AI_DEVELOPER_GUIDE.md
17. DECISION_LOG.md

Following this order ensures a complete understanding of the project before implementation begins.

---

## 3. Documentation Map

| Document                 | Primary Responsibility                    |
|--------------------------|-------------------------------------------|
| README.md                | Repository introduction                   |
| PROJECT_DNA.md           | Project identity and philosophy           |
| PROJECT_RULES.md         | Engineering rules                         |
| PROJECT_STATUS.md        | Project status and documentation registry |
| CARDVERSE_INDEX.md       | Documentation navigation                  |
| SYSTEM_START_HERE.md     | System onboarding guide                   |
| REPOSITORY_SNAPSHOT.md   | Complete repository state                 |
| SETUP_GUIDE.md           | Development environment setup             |
| IMPLEMENTATION_STATUS.md | Implementation progress                   |
| PRODUCT_BIBLE.md         | Product requirements                      |
| ARCHITECTURE.md          | Software architecture                     |
| DATABASE.md              | Database design                           |
| API.md                   | API standards                             |
| RULEBOOK.md              | Game rules                                |
| GLOSSARY.md              | Terminology dictionary                    |
| AI_DEVELOPER_GUIDE.md    | AI development workflow                   |
| DECISION_LOG.md          | Engineering decision history              |

---

## 4. Topic Index

| Topic                   | Primary Document         | Related Documents       |
|-------------------------|--------------------------|-------------------------|
| Product Vision          | PRODUCT_BIBLE.md         | PROJECT_DNA.md          |
| Project Philosophy      | PROJECT_DNA.md           | PROJECT_RULES.md        |
| Engineering Rules       | PROJECT_RULES.md         | AI_DEVELOPER_GUIDE.md   |
| Architecture            | ARCHITECTURE.md          | DATABASE.md, API.md     |
| Platform Modules        | ARCHITECTURE.md          | PRODUCT_BIBLE.md        |
| Matchmaking             | PRODUCT_BIBLE.md         | ARCHITECTURE.md, API.md |
| Authentication          | API.md                   | ARCHITECTURE.md         |
| User Profile            | PRODUCT_BIBLE.md         | DATABASE.md             |
| Friends System          | PRODUCT_BIBLE.md         | DATABASE.md, API.md     |
| Wallet                  | DATABASE.md              | PRODUCT_BIBLE.md        |
| Shop                    | PRODUCT_BIBLE.md         | DATABASE.md             |
| Statistics              | PRODUCT_BIBLE.md         | DATABASE.md             |
| Seasons                 | PRODUCT_BIBLE.md         | DATABASE.md             |
| Ranking                 | PRODUCT_BIBLE.md         | DATABASE.md, API.md     |
| AI Bots                 | ARCHITECTURE.md          | RULEBOOK.md             |
| Game Rules              | RULEBOOK.md              | PRODUCT_BIBLE.md        |
| API Standards           | API.md                   | PROJECT_RULES.md        |
| Database Design         | DATABASE.md              | ARCHITECTURE.md         |
| Documentation Structure | PROJECT_STATUS.md        | PROJECT_RULES.md        |
| Repository Structure    | REPOSITORY_SNAPSHOT.md   | SETUP_GUIDE.md          |
| Development Setup       | SETUP_GUIDE.md           | REPOSITORY_SNAPSHOT.md  |
| Implementation Status   | IMPLEMENTATION_STATUS.md | PROJECT_STATUS.md       |
| Terminology             | GLOSSARY.md              | All documents           |
| Development Workflow    | AI_DEVELOPER_GUIDE.md    | PROJECT_RULES.md        |
| Engineering Decisions   | DECISION_LOG.md          | ARCHITECTURE.md         |

---

## 5. Document Responsibilities

Each document has exactly one primary responsibility.

Documentation should not duplicate information already owned by another document.

When additional context is required, documents should reference each other instead of repeating content.

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
- PROJECT_STATUS.md (Operational)
- CARDVERSE_INDEX.md (Frozen)
- SYSTEM_START_HERE.md (Frozen)
- REPOSITORY_SNAPSHOT.md (Operational)
- SETUP_GUIDE.md (Frozen)
- IMPLEMENTATION_STATUS.md (Operational)
- GLOSSARY.md (Frozen)
- AI_DEVELOPER_GUIDE.md (Frozen)
- DECISION_LOG.md (Operational)

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

- PROJECT_STATUS.md
- PROJECT_RULES.md
- PROJECT_DNA.md
- REPOSITORY_SNAPSHOT.md
- SYSTEM_START_HERE.md

---

## 8. Version History

| Version | Date       | Description                             |
|---------|------------|-----------------------------------------|
| 0.1.0   | 2026-06-30 | Initial documentation index established |
| 0.1.0   | 2026-07-01 | Documentation Freeze completed          |
| 0.2.0   | 2026-07-04 | Added new system documents to index     |

---

**Document Status:** Frozen

This document is the official navigation guide for CardVerse documentation.

Every contributor should use this index to locate the authoritative source for any project topic.

Changes to this document require updating the Version History.