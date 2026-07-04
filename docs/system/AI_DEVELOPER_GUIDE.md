# CardVerse AI Developer Guide

**Document ID:** CV-SYS-007
**Version:** 0.2.0
**Status:** Frozen
**Classification:** System
**Owner:** Mostafa & ChatGPT
**Created:** 2026-06-30
**Last Updated:** 2026-07-04

---

## Table of Contents

1. Purpose
2. AI Responsibilities
3. Project Reading Order
4. Session Startup Workflow
5. Session Recovery Workflow
6. Project Understanding Workflow
7. Development Workflow
8. Documentation Workflow
9. Decision Workflow
10. Review Workflow
11. Completion Workflow
12. Communication Rules
13. Forbidden Behaviors
14. AI Session Checklist
15. References
16. Version History

---

## 1. Purpose

This document defines the standard operating procedure for any AI assistant working on the CardVerse project.

It is platform-independent.

These instructions apply equally to ChatGPT, Claude, Gemini, Copilot, DeepSeek, Qwen and future AI systems.

The purpose of this guide is to ensure consistent development regardless of which AI system participates.

---

## 2. AI Responsibilities

Every AI assistant is expected to:

- Understand the project before proposing solutions.
- Respect documented architecture.
- Preserve project consistency.
- Avoid introducing technical debt.
- Keep documentation synchronized with implementation.
- Explain important engineering decisions.
- Prefer maintainability over short-term convenience.

AI assists engineering.

AI never replaces engineering judgment.

---

## 3. Project Reading Order

Before performing any implementation work, the AI should understand the project using the following order:

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
16. DECISION_LOG.md

SYSTEM_START_HERE.md may be used as the quick entry point for new sessions.

---

## 4. Session Startup Workflow

At the beginning of every development session the AI should perform the following steps.

### Step 1

Understand the user's requested task.

### Step 2

Determine which project documents are relevant.

### Step 3

Review those documents before making recommendations.

### Step 4

Identify affected modules.

### Step 5

Verify that no documented rule will be violated.

### Step 6

Only then begin proposing implementation.

---

## 5. Session Recovery Workflow

When starting a new chat session after a previous session was interrupted or completed, the AI should perform the following steps.

### Step 1

Read SYSTEM_START_HERE.md to understand the project entry point.

### Step 2

Read PROJECT_STATUS.md to understand the current state.

### Step 3

Read IMPLEMENTATION_STATUS.md to understand what has been completed.

### Step 4

Read REPOSITORY_SNAPSHOT.md to understand what files exist.

### Step 5

Read DECISION_LOG.md to understand recent engineering decisions.

### Step 6

Verify the current task and status from PROJECT_STATUS.md.

### Step 7

Continue development exactly from the Current Task.

### Step 8

If Current Task is completed, proceed to Next Task.

### Step 9

Confirm understanding of the project state before making any changes.

### Step 10

Proceed with the Development Workflow.

---

## 6. Project Understanding Workflow

Before modifying any feature, the AI should identify:

- Business requirements
- Architectural constraints
- Database impact
- API impact
- Security implications
- Future scalability

Solutions should satisfy all of these perspectives.

---

## 7. Development Workflow

Every implementation should follow this sequence.

1. Understand

2. Analyze

3. Design

4. Validate

5. Implement

6. Review

7. Update Documentation

8. Complete

Skipping steps is discouraged.

---

## 8. Documentation Workflow

Documentation is considered part of implementation.

Whenever behavior changes, determine whether the following documents require updates:

- PRODUCT_BIBLE.md
- ARCHITECTURE.md
- DATABASE.md
- API.md
- RULEBOOK.md
- DECISION_LOG.md
- PROJECT_STATUS.md
- IMPLEMENTATION_STATUS.md
- REPOSITORY_SNAPSHOT.md

Documentation should always reflect the current design.

---

## 9. Decision Workflow

Before making any significant engineering decision, the AI should determine:

- Is the decision already documented?
- Does it affect architecture?
- Does it affect business rules?
- Does it affect the database?
- Does it affect the public API?
- Does it introduce technical debt?
- Does it require updating documentation?
- Does it affect PROJECT_STATUS.md?

If the answer to any of these questions is "Yes", the corresponding documents should be reviewed before proceeding.

Important decisions should be recorded in DECISION_LOG.md.

---

## 10. Review Workflow

Before presenting an implementation, the AI should perform a self-review.

Verify the following:

- Business requirements are satisfied.
- Architecture remains consistent.
- Naming conventions are respected.
- No duplicated business logic exists.
- Module boundaries remain intact.
- Security principles are preserved.
- Performance implications have been considered.
- Documentation remains consistent.

The AI should identify potential risks whenever uncertainty exists.

---

## 11. Completion Workflow

A development task is complete only when all of the following conditions are satisfied:

- Requested functionality has been implemented.
- Documentation has been updated where necessary.
- No architectural rules have been violated.
- Database documentation reflects schema changes.
- API documentation reflects contract changes.
- Important decisions have been recorded.
- Existing project conventions have been preserved.
- PROJECT_STATUS.md has been updated if project status changed.
- IMPLEMENTATION_STATUS.md has been updated if implementation changed.

Implementation alone does not define completion.

---

## 12. Communication Rules

When interacting with project contributors, the AI should:

- Explain important design decisions.
- Clearly distinguish facts from assumptions.
- State uncertainties explicitly.
- Prefer evidence over speculation.
- Recommend maintainable solutions.
- Avoid unnecessary complexity.
- Respect previously documented decisions unless revision is explicitly requested.

Responses should prioritize clarity, consistency and engineering quality.

---

## 13. Forbidden Behaviors

The AI must never:

- Invent undocumented business rules.
- Ignore documented architecture.
- Duplicate business logic.
- Recommend bypassing security principles.
- Modify public contracts without versioning.
- Introduce unnecessary dependencies.
- Change documentation silently.
- Assume undocumented behavior is correct.
- Sacrifice maintainability for short-term convenience.

Whenever documentation conflicts are discovered, the AI should identify them rather than choosing one arbitrarily.

---

## 14. AI Session Checklist

Before ending every development session, verify the following checklist.

### Project Understanding

- Relevant documents reviewed.
- Active task understood.
- Architecture respected.

### Implementation

- Business requirements satisfied.
- Module responsibilities preserved.
- No duplicated logic introduced.

### Documentation

- Documentation updated where required.
- Decision Log updated if necessary.
- Implementation Status updated if necessary.

### Quality

- Naming consistent.
- Security respected.
- Maintainability preserved.
- Performance implications considered.

Only after completing this checklist should the task be considered finished.

---

## 15. References

- README.md
- PROJECT_DNA.md
- PROJECT_RULES.md
- PROJECT_STATUS.md
- CARDVERSE_INDEX.md
- SYSTEM_START_HERE.md
- REPOSITORY_SNAPSHOT.md
- SETUP_GUIDE.md
- IMPLEMENTATION_STATUS.md
- GLOSSARY.md
- PRODUCT_BIBLE.md
- ARCHITECTURE.md
- DATABASE.md
- API.md
- RULEBOOK.md
- DECISION_LOG.md

---

## 16. Version History

| Version | Date       | Description                                            |
|---------|------------|--------------------------------------------------------|
| 0.1.0   | 2026-06-30 | Initial AI Developer Guide established                 |
| 0.1.0   | 2026-07-01 | Documentation Freeze completed                         |
| 0.2.0   | 2026-07-04 | Added Session Recovery Workflow and updated references |

---

**Document Status:** Frozen

This document defines the standard operating procedure for AI assistants contributing to the CardVerse project.

Every AI system should follow this workflow to ensure consistent, maintainable and high-quality development.

Changes to this document require updating the Version History.

This document defines the standard operating procedure for AI collaboration within CardVerse.

All AI-assisted development sessions should follow this guide unless explicitly instructed otherwise by the project owner.