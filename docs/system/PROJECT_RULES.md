# CardVerse Project Rules

**Document ID:** CV-SYS-002
**Version:** 0.1.0
**Status:** Frozen
**Classification:** System
**Owner:** Mostafa & ChatGPT
**Created:** 2026-06-27
**Last Updated:** 2026-07-01

---

# Table of Contents

1. Purpose

2. Rule Hierarchy

3. General Rules

4. Documentation Rules

5. Architecture Rules

6. Development Rules

7. Database Rules

8. API Rules

9. Security Rules

10. AI Collaboration Rules

11. Definition of Done

12. Forbidden Actions

References

Version History

---

# 1. Purpose

This document defines the mandatory engineering rules governing the CardVerse project.

These rules apply equally to:

* Human developers
* AI assistants
* External contributors
* Future maintainers

Compliance with these rules is mandatory.

No implementation may intentionally violate them.

---

# 2. Rule Hierarchy

When multiple documents define related requirements, precedence is determined by the following order:

1. PROJECT_DNA.md
2. PROJECT_RULES.md
3. PRODUCT_BIBLE.md
4. ARCHITECTURE.md
5. DATABASE.md
6. API.md
7. RULEBOOK.md

Lower-priority documents must never contradict higher-priority documents.

Whenever uncertainty exists, the higher-priority document always prevails.

---

# 3. General Rules

## Documentation Before Implementation

Business requirements must always be documented before implementation begins.

---

## Single Source of Truth

Every concept must have exactly one authoritative document.

Duplicated documentation is prohibited.

---

## Platform First

Every new feature should strengthen the CardVerse platform before improving an individual game.

---

## Long-Term Maintainability

Every implementation should remain understandable years after it is written.

Code written today should still make sense to future contributors.

---

## No Technical Debt by Default

Temporary shortcuts are prohibited unless:

* explicitly documented,
* approved,
* and tracked for future removal.

---

## Simplicity Before Complexity

Prefer the simplest solution that satisfies the documented requirements.

Unnecessary abstraction is discouraged.

---

## Consistency Over Preference

Project consistency always takes priority over personal coding style.

---

# 4. Documentation Rules

## Documentation Is Mandatory

Every significant feature must be documented.

Undocumented functionality is considered incomplete.

---

## Documentation Must Remain Current

Documentation must be updated whenever behavior changes.

Documentation is part of the implementation.

---

## Documentation Drives Development

Documentation defines intended behavior.

Implementation follows documentation.

Documentation must never be generated from code after implementation.

---

## Cross References

Documents should reference each other where appropriate.

Duplicated explanations should be avoided.

---

## Version History

Every major document update must be recorded in its Version History section.

---

## Decision Recording

Important architectural or engineering decisions must be recorded in DECISION_LOG.md.

---

# 5. Architecture Rules

## Respect Layer Boundaries

Every module must remain inside its assigned architectural layer.

Cross-layer shortcuts are prohibited.

---

## Single Responsibility

Every module should perform one primary responsibility.

---

## Loose Coupling

Modules communicate through clearly defined contracts.

Direct dependencies should be minimized.

---

## Platform Before Game

Shared functionality belongs to Platform or Engine.

Game modules contain only game-specific behavior.

---

## No Circular Dependencies

Circular dependencies between modules are prohibited.

---

## Backward Compatibility

Existing public contracts should not be broken without explicit versioning.

---

## Reuse Before Creation

Before creating a new module, verify whether an existing module can be reused.

---

# 6. Development Rules

## Read Before Modify

Developers must understand the existing implementation before making changes.

---

## Small Incremental Changes

Prefer small, reviewable changes over large rewrites.

---

## No Duplicate Logic

Business logic should exist in only one place.

Copying logic is prohibited.

---

## Self-Documenting Code

Code should be written clearly enough that excessive comments are unnecessary.

Comments explain *why*, not *what*.

---

## Consistent Naming

Names should clearly communicate intent.

Avoid abbreviations unless universally understood.

---

## Refactoring

Refactoring should improve readability without changing documented behavior.

Behavioral changes require documentation updates.

---

## Testing Mindset

Every implementation should be designed to be testable, even before automated tests exist.

---

## Performance

Do not optimize prematurely.

Optimize only after identifying measurable bottlenecks.

---

# 7. Database Rules

## Database Is Not Business Logic

The database stores data.

Business rules belong to the application layer.

---

## Data Integrity First

Data consistency has higher priority than performance optimization.

---

## Normalization

Database design should follow normalization principles unless a documented exception exists.

---

## Soft Delete

Business entities should use soft deletion whenever recovery may be required.

---

## Naming Convention

Database objects must follow the naming conventions defined in DATABASE.md.

---

## Migrations

Database schema changes must always be performed through migrations.

Manual production modifications are prohibited.

---

## Documentation Synchronization

Every schema modification must be reflected in DATABASE.md before implementation.

---

# 8. API Rules

## API First

Public interfaces must be designed before implementation.

---

## Versioning

Breaking changes require a new API version.

Existing versions must remain supported until officially deprecated.

---

## Stateless Design

APIs should remain stateless whenever possible.

---

## Consistent Responses

Every endpoint must use the standard response format defined in API.md.

---

## Validation

All external input must be validated before processing.

Never trust client input.

---

## Authorization

Authentication does not imply authorization.

Permissions must always be verified independently.

---

## Documentation

Every public endpoint must be documented before implementation.

---

# 9. Security Rules

## Never Trust The Client

The client is never considered authoritative.

All critical decisions belong to the server.

---

## Principle of Least Privilege

Users receive only the permissions required for their role.

---

## Input Validation

Validate every external input.

Reject invalid data immediately.

---

## Sensitive Data

Sensitive information must never be exposed through logs or API responses.

---

## Secure Defaults

The safest default behavior should always be preferred.

---

## Security Before Convenience

Developer convenience must never reduce platform security.

---

# 10. AI Collaboration Rules

## AI Is An Assistant

AI assists development.

AI does not replace engineering judgment.

---

## Documentation Awareness

AI must understand the current documentation before proposing changes.

---

## Respect Existing Architecture

AI must not introduce solutions that violate documented architecture.

---

## No Assumptions

When documentation is incomplete, AI should identify the uncertainty rather than invent behavior.

---

## Documentation Synchronization

Whenever AI proposes architectural or behavioral changes, corresponding documentation updates must also be proposed.

---

## Explain Important Decisions

AI should explain significant design decisions rather than only generating code.

---

# 11. Definition of Done

A task is considered complete only when all of the following conditions are satisfied:

* Requirements are fully implemented.
* Documentation has been updated.
* Architecture remains consistent.
* Database changes are documented.
* API changes are documented.
* Naming conventions are respected.
* No unnecessary duplication exists.
* No new technical debt has been introduced.
* Relevant decisions have been recorded when necessary.

Implementation alone does not mean completion.

---

# 12. Forbidden Actions

The following actions are strictly prohibited:

* Bypassing documented architecture.
* Introducing duplicate business logic.
* Trusting client-side decisions.
* Modifying the database without migrations.
* Implementing undocumented business rules.
* Breaking public contracts without versioning.
* Introducing unnecessary dependencies.
* Ignoring documentation updates.
* Creating modules with multiple unrelated responsibilities.
* Sacrificing maintainability for short-term speed.

---

# References

* PROJECT_DNA.md
* PRODUCT_BIBLE.md
* ARCHITECTURE.md
* DATABASE.md
* API.md
* RULEBOOK.md
* DECISION_LOG.md

---

# Version History

| Version | Date       | Description                          |
| ------- | ---------- | ------------------------------------ |
| 0.1.0   | 2026-06-30 | Enterprise Project Rules established |
| 0.1.0   | 2026-07-01 | Documentation Freeze completed       |

---

**Document Status:** Review

This document defines the mandatory engineering rules governing the CardVerse project.

Every contributor, whether human or AI, is expected to follow these rules throughout the project's lifetime.

Changes to this document require updating the Version History.

