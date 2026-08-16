# CardVerse AI Developer Guide

**Document ID:** CV-SYS-007
**Version:** 0.7.0
**Status:** Frozen
**Classification:** System
**Owner:** Mostafa
**Created:** 2026-06-30
**Last Updated:** 2026-07-07

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
16. Step-by-Step Development Workflow
17. Version History

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
5. DASHBOARD.md
6. PRODUCT_BIBLE.md
7. ARCHITECTURE.md
8. DATABASE.md
9. API.md
10. RULEBOOK.md
11. AI_DEVELOPER_GUIDE.md
12. CHANGELOG.md

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

Read DASHBOARD.md to understand the project entry point and current status. Pay special attention to the **"Fresh Environment / AI Onboarding"** section and its Environment Bootstrap Checklist (E1–E9) — on a new machine, run that checklist before anything else.

### Step 2

Read README.md to understand the project overview.

### Step 3

Read CARDVERSE_INDEX.md to locate relevant documents.

### Step 4

Review the Decision Log section in DASHBOARD.md to understand recent engineering decisions.

### Step 5

Verify the current task and status from DASHBOARD.md.

### Step 6

Continue development exactly from the Current Task.

### Step 7

If Current Task is completed, proceed to Next Task.

### Step 8

Confirm understanding of the project state before making any changes.

### Step 9

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
- DASHBOARD.md

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
- Does it affect DASHBOARD.md (project status)?

If the answer to any of these questions is "Yes", the corresponding documents should be reviewed before proceeding.

Important decisions should be recorded in DASHBOARD.md (Section 6 — Decision Log).

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
- DASHBOARD.md has been updated if project status changed.
- DASHBOARD.md has been updated if the implementation changed.

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
- DASHBOARD.md
- CARDVERSE_INDEX.md
- PRODUCT_BIBLE.md
- ARCHITECTURE.md
- DATABASE.md
- API.md
- RULEBOOK.md
- CHANGELOG.md

---

## 16. Step-by-Step Development Workflow

### Session Start Protocol

1. **Review Documentation**: Before any development, review DASHBOARD.md to understand current state.
2. **Identify Current Task**: Determine the current task from DASHBOARD.md.
3. **Execute Commands**: All commands are executed in CMD with step-by-step confirmation.
4. **Verify Output**: After each command, verify output before proceeding.
5. **Update Documentation**: After task completion, update all relevant documentation.

### Command Execution Pattern

All commands follow this protocol:

1. **AI Suggests**: AI assistant suggests a CMD command with explanation of its purpose
2. **User Executes**: User runs the command in CMD terminal
3. **Output Verified**: Output is reviewed and verified for correctness
4. **Confirmation**: Both parties confirm the step is complete
5. **Next Step**: Proceed to next step only after confirmation

Example:

```cmd
:: Step 1: Create directory structure
mkdir backend\src\controllers

:: Step 2: Verify directory was created
dir backend\src /b

This pattern ensures:

**No commands are executed without user awareness**

**Each step is validated before proceeding**

**Errors are caught immediately**

**Development remains incremental and reviewable**

Session End Protocol

**1. Review Changes: Verify all changes are committed.**

**2. Update Status: Update DASHBOARD.md.**

**3. Record Decisions: Document decisions in DASHBOARD.md (Section 6 — Decision Log).**

**4. Final Commit: Create a commit with the completed task.**

Rules for Step-by-Step Development

**1. Read Before Modify: Always review existing code before making changes.**

**2. Small Incremental Changes: Prefer small, reviewable changes over large rewrites.**

**3. Verify After Each Step: After executing commands, verify output before continuing.**

**4. Document Decisions: Record important decisions in DASHBOARD.md (Section 6 — Decision Log).**

**5. Update Status: Always update project status after completing tasks.**

**6. No Assumptions: When documentation is incomplete, identify uncertainty rather than inventing behavior.**

---

16.6 AI Session Behavior Rules

Rule 1: Never Provide Multiple Files in One Response

The AI MUST NOT provide complete code for multiple files in a single response.

Violation Example:

Providing friends.types.ts, friends.service.ts, friends.validator.ts, friends.controller.ts, and friends.routes.ts all at once.

Correct Behavior:

Provide ONE file at a time, following the Step-by-Step workflow.

---

Rule 2: One Command Per Interaction

The AI MUST suggest exactly ONE CMD command per response.

After the user executes and verifies the output, the AI suggests the next command.

Violation Example:

Step 1: Create directory
Step 2: Create files
Step 3: Update routes

Correct Behavior:

:: Step 1: Create directory
mkdir backend\src\modules\friends

Wait for user confirmation, then proceed.

---

Rule 3: File Creation = One File Per Step
When creating multiple files, each file must be created as a separate step.

Workflow:

1. AI suggests: Create friends.types.ts

2. User executes and verifies

3. AI suggests: Create friends.service.ts

4. User executes and verifies

5. Continue for remaining files

---

Rule 4: Always Reference Session Status
The AI must explicitly state which step of the workflow is currently active.

Example:

?? Step 1 of 8: Creating friends module directory
?? Step 2 of 8: Creating friends.types.ts
?? Step 3 of 8: Creating friends.service.ts

---

Rule 5: Read Before Modify
Before suggesting any changes, the AI must:

1. Verify the current state from the user's output

2. Confirm the previous step was completed successfully

3. Only then suggest the next step

---

Rule 6: No Assumptions
The AI must never assume:

**That the user has already executed a command**

**That a file already exists**

**That a previous step was completed**

Every step must be explicitly verified before proceeding.

---

Rule 7: Session Continuity
When starting a new chat session:

1. Read all provided documentation

2. Identify current task from DASHBOARD.md

3. Resume from the LAST VERIFIED STEP

4. Do NOT skip to the end of the task

---

Rule 8: Documentation Update at End
Only after ALL steps of a task are completed and verified, the AI should propose updating:

**DASHBOARD.md**

---

Rule 9: Always Include CD Command with Explicit Path
Before ANY file operation, the AI MUST include a cd command that explicitly sets the correct working directory.

When to use which path:

| Scenario          | Command                                      | When to use                             |
| ----------------- | -------------------------------------------- | --------------------------------------- |
| Root project      | cd /d C:\Dev\CardVerse                       | Most operations (reading/writing files) |
| Modules directory | cd /d C:\Dev\CardVerse\backend\src\modules   | Checking module folders                 |
| Routes directory  | cd /d C:\Dev\CardVerse\backend\src\routes\v1 | Working with routes                     |
| Specific file     | cd /d C:\Dev\CardVerse + relative path       | Reading/writing specific files          |

---

Pattern:

:: Step X: Description of what we're doing
:: ???: ????? ????? ??? ?? ??? ???? ???????
:: ????: C:\Dev\CardVerse\... (???? ????)

cd /d C:\Dev\CardVerse\[subfolder if needed]
[actual command]

Example 1 - Working at project root:

:: Step 3: Reading index.ts from routes
:: ???: ????? ?????? ???? index.ts
:: ????: C:\Dev\CardVerse\backend\src\routes\v1

cd /d C:\Dev\CardVerse
type backend\src\routes\v1\index.ts

Example 2 - Working in modules folder:

:: Step 2: Checking existing modules
:: ???: ????? ????????? ?????
:: ????: C:\Dev\CardVerse\backend\src\modules

cd /d C:\Dev\CardVerse\backend\src\modules
dir /b

Example 3 - Reading a file with full path:

:: Step 4: Reading index.ts
:: ???: ?????? ?????? ???? index.ts
:: ????: C:\Dev\CardVerse\backend\src\routes\v1

cd /d C:\Dev\CardVerse
type backend\src\routes\v1\index.ts

Rationale:

**User may be in any directory (e.g., C:\Windows\system32)**

**cd /d ensures the correct drive and path**

**Explicit path prevents "file not found" errors**

**/d flag ensures drive change (C:\ to D:\ if needed)**

**Makes commands reproducible**

**AI clearly communicates the target directory**

Important Note:
The AI MUST ALWAYS include cd /d C:\Dev\CardVerse at the beginning of every command block, even if the previous command was in the same directory. This ensures the command works correctly if the user starts a new CMD session or changes directory.

---

Rule 10: Manual Documentation Update Protocol
IMPORTANT: This rule REPLACES the PowerShell-based file modification approach. PowerShell automation caused file corruption and encoding issues. This manual protocol is now the STANDARD for all documentation updates.

When updating documentation files, the AI MUST follow this protocol:

Step 1: Read Current Content
The AI suggests the type command to display the full file content:

cd /d C:\Dev\CardVerse
type docs\system\[filename].md

Step 2: User Provides Content
The user executes the command and sends the complete output to the AI.

Step 3: AI Analyzes and Identifies Changes
The AI reviews the content and provides:

**Exact location of each change (section name, line position)**

**Old content (exact text to be replaced)**

**New content (exact text to replace with)**

Step 4: User Applies Changes Manually
The user applies the changes using Notepad++ or VS Code (NOT PowerShell automation).

Step 5: AI Verifies
The AI requests the type command again to verify the changes were applied correctly:

cd /d C:\Dev\CardVerse
type docs\system\[filename].md

Example Workflow:

?? Step 1: Reading DASHBOARD.md

cd /d C:\Dev\CardVerse
type docs\system\DASHBOARD.md

?? User sends the output

?? Step 2: AI analyzes and identifies changes

**Change 1 - Section: 5. Implementation Status**
- Old: `| Backend       | 19        | 0       | 19     |`
- New: `| Backend       | 24        | 0       | 24     |`

**Change 2 - Section: 9. Version History**
- Old: `| 1.3.0   | 2026-07-06 | Task 2.2 completed |`
- New: `| 1.4.0   | 2026-07-06 | Task 2.3 completed |`

?? Step 3: User applies changes with Notepad++

?? Step 4: AI verifies

cd /d C:\Dev\CardVerse
type docs\system\DASHBOARD.md

?? User sends the output for verification

Rationale:

**Eliminates risk of corrupted files from automated PowerShell commands**

**User has full control over the changes**

**Changes are reviewable and auditable**

**Prevents unintended modifications**

**Works correctly with UTF-8 and Persian characters**

**PowerShell automation is FORBIDDEN for documentation updates**

This rule REPLACES the PowerShell-based approach. The AI MUST NOT suggest PowerShell commands for modifying documentation files.

---

17. Version History

| Version | Date       | Description                                                                    |
| ------- | ---------- | ------------------------------------------------------------------------------ |
| 0.1.0   | 2026-06-30 | Initial AI Developer Guide established                                         |
| 0.1.0   | 2026-07-01 | Documentation Freeze completed                                                 |
| 0.2.0   | 2026-07-04 | Added Session Recovery Workflow and updated references                         |
| 0.3.0   | 2026-07-05 | Added Step-by-Step Development Workflow and Session protocols                  |
| 0.4.0   | 2026-07-05 | Updated Command Execution Pattern with step-by-step protocol                   |
| 0.5.0   | 2026-07-06 | Added Rules 9-10 for PowerShell and CD command protocols                       |
| 0.6.0   | 2026-07-07 | Replaced PowerShell method with Manual Documentation Update Protocol (Rule 10) |
| 0.7.0   | 2026-07-07 | Updated references and reading order with new documentation structure          |

---

Document Status: Frozen

This document defines the standard operating procedure for AI assistants contributing to the CardVerse project.

Every AI system should follow this workflow to ensure consistent, maintainable and high-quality development.

Changes to this document require updating the Version History.

This document defines the standard operating procedure for AI collaboration within CardVerse.

All AI-assisted development sessions should follow this guide unless explicitly instructed otherwise by the project owner.
```
