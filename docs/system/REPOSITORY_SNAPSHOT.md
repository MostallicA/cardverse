# CardVerse Repository Snapshot

**Document ID:** CV-SYS-009
**Version:** 1.0.0
**Status:** Operational
**Classification:** System
**Owner:** Mostafa & ChatGPT
**Created:** 2026-07-04
**Last Updated:** 2026-07-04

---

## Table of Contents

1. Purpose
2. Repository Structure
3. Root Directory Files
4. Directory Structure
5. Configuration Files Content
6. Dependencies Status
7. Development Commands
8. References
9. Version History

---

## 1. Purpose

This document provides a complete snapshot of the CardVerse repository at the time of the Documentation Freeze.

It contains every file that exists in the repository, including hidden files, configuration files and empty directories.

**This document is the ultimate source of truth for the repository state.**

Any AI assistant starting a new session should read this document to understand exactly what exists in the repository without needing access to the actual files.

---

## 2. Repository Structure

### Root Directory

C:\Dev\CardVerse\

### File Inventory

| File/Directory      | Type      | Status                 |
| ------------------- | --------- | ---------------------- |
| .git                | Directory | Repository initialized |
| .gitignore          | File      | Complete               |
| all_files.txt       | File      | Temporary (ignore)     |
| assets/             | Directory | Empty (with .gitkeep)  |
| backend/            | Directory | Empty (with .gitkeep)  |
| backups/            | Directory | Empty (with .gitkeep)  |
| CHANGELOG.md        | File      | Complete               |
| docs/               | Directory | Complete               |
| frontend/           | Directory | Empty (with .gitkeep)  |
| LICENSE             | File      | Complete               |
| package.json        | File      | Complete               |
| pnpm-workspace.yaml | File      | Complete               |
| README.md           | File      | Frozen                 |
| shared/             | Directory | Empty (with .gitkeep)  |
| temp/               | Directory | Empty (with .gitkeep)  |
| tests/              | Directory | Empty (with .gitkeep)  |
| tools/              | Directory | Empty (with .gitkeep)  |

---

## 3. Root Directory Files

### .gitignore

# Dependencies

node_modules/
.pnpm-store/

# Build outputs

dist/
build/
*.log

# Environment

.env
.env.local
.env.*.local

# IDE

.vscode/
.idea/
*.swp
*.swo

# OS

.DS_Store
Thumbs.db

# Temporary

temp/
*.tmp

# Backups

backups/_.sql
backups/_.dump

---

### package.json

{
"name": "cardverse",
"version": "0.1.0",
"private": true,
"description": "CardVerse - Multiplayer Card Game Platform",
"scripts": {
"dev": "pnpm run --parallel dev",
"build": "pnpm run --parallel build",
"test": "pnpm run --parallel test",
"lint": "pnpm run --parallel lint",
"format": "prettier --write ."
},
"engines": {
"node": ">=20.0.0",
"pnpm": ">=9.0.0"
},
"packageManager": "pnpm@9.0.0"
}

---

### pnpm-workspace.yaml

packages:

- 'backend'
- 'frontend'
- 'shared'
- 'tools/*'

---

### README.md

Status: Frozen (CV-0001)

Purpose: Project introduction, vision, mission and repository structure.

---

### CHANGELOG.md

Status: Operational

Purpose: Records all notable changes to the project following Semantic Versioning.

---

### LICENSE

Status: Complete

Type: Private Project - All rights reserved.

---

## 4. Directory Structure

CardVerse/
.
+-- .git/ (Git repository)
+-- .gitignore (Git ignore rules)
+-- .editorconfig (Editor standards)
+-- .prettierrc (Code formatting)
+-- eslint.config.js (ESLint 9.x flat config)
+-- tsconfig.base.json (TypeScript base config)
+-- commitlint.config.js (Commit message validation)
+-- lint-staged.config.js (Pre-commit checks)
+-- .env.example (Environment variables template)
+-- .husky/ (Git hooks)
| +-- pre-commit
| +-- commit-msg
+-- .github/ (GitHub templates)
| +-- PULL_REQUEST_TEMPLATE.md
| +-- ISSUE_TEMPLATE.md
+-- assets/ (Static assets)
| +-- .gitkeep
+-- backend/ (Backend services)
| +-- package.json
| +-- tsconfig.json
| +-- tsconfig.tsbuildinfo
| +-- src/
| +-- index.ts (Express server)
| +-- config/
| | +-- index.ts (Configuration)
| +-- middleware/
| +-- logger.ts (Logger middleware)
| +-- errorHandler.ts (Error handling)
| +-- modules/
| | +-- auth/
| | | +-- auth.types.ts
| | | +-- auth.service.ts
| | | +-- auth.validator.ts
| | | +-- auth.controller.ts
| | | +-- auth.routes.ts
| | +-- user/
| | | +-- user.types.ts
| | | +-- user.service.ts
| | | +-- user.validator.ts
| | | +-- user.controller.ts
| | | +-- user.routes.ts
| +-- routes/
| | +-- v1/
| | | +-- index.ts
| +-- utils/
| | +-- response.ts
| +-- middleware/
| | +-- asyncHandler.ts
| | +-- validate.ts
+-- backups/ (Backup storage)
| +-- .gitkeep
+-- CHANGELOG.md (Version history)
+-- docs/ (Documentation)
| +-- core/ (Core documents - Frozen)
| | +-- API.md
| | +-- ARCHITECTURE.md
| | +-- DATABASE.md
| | +-- PRODUCT_BIBLE.md
| | +-- RULEBOOK.md
| +-- system/ (System documents)
| +-- AI_DEVELOPER_GUIDE.md
| +-- CARDVERSE_INDEX.md
| +-- DECISION_LOG.md
| +-- GLOSSARY.md
| +-- IMPLEMENTATION_STATUS.md
| +-- PROJECT_DNA.md
| +-- PROJECT_RULES.md
| +-- PROJECT_STATUS.md
| +-- REPOSITORY_SNAPSHOT.md
| +-- SETUP_GUIDE.md
| +-- SYSTEM_START_HERE.md
+-- frontend/ (Frontend application)
| +-- .gitkeep
| +-- tsconfig.json
+-- LICENSE (Private project license)
+-- package.json (Root package configuration)
+-- pnpm-lock.yaml (Lockfile)
+-- pnpm-workspace.yaml (pnpm workspace configuration)
+-- README.md (Project introduction)
+-- shared/ (Shared code)
| +-- package.json
| +-- tsconfig.json
| +-- tsconfig.tsbuildinfo
| +-- src/
| +-- index.ts
| +-- utils/
| | +-- index.ts
| +-- constants/
| | +-- index.ts
| +-- types/
| +-- index.ts
+-- temp/ (Temporary files)
| +-- .gitkeep
+-- tests/ (Test files)
| +-- .gitkeep
+-- tools/ (Development tools)
+-- .gitkeep

---

## 5. Configuration Files Content

### .gitignore

(See Section 3)

### package.json

(See Section 3)

### pnpm-workspace.yaml

(See Section 3)

---

## 6. Dependencies Status

| Tool    | Version | Status    | Notes           |
| ------- | ------- | --------- | --------------- |
| Git     | v2.x    | Installed | Required        |
| Node.js | v20.x   | Installed | Required        |
| npm     | v10.x   | Installed | Comes with Node |
| pnpm    | v9.x    | Installed | Required        |

---

## 7. Development Commands

| Command         | Purpose                   |
| --------------- | ------------------------- |
| pnpm install    | Install all dependencies  |
| pnpm run dev    | Start development servers |
| pnpm run build  | Build all packages        |
| pnpm run test   | Run all tests             |
| pnpm run lint   | Lint all code             |
| pnpm run format | Format all code           |

---

## 8. References

Related documents:

- README.md
- PROJECT_STATUS.md
- SETUP_GUIDE.md
- CARDVERSE_INDEX.md

---

## 9. Version History

| Version | Date       | Description                                              |
| ------- | ---------- | -------------------------------------------------------- |
| 1.0.0   | 2026-07-04 | Initial repository snapshot created                      |
| 1.1.0   | 2026-07-06 | Added auth and user modules, updated directory structure |

---

**Document Status:** Operational

This document provides a complete snapshot of the CardVerse repository.

It is the authoritative source for the repository state and should be updated whenever significant structural changes occur.

Changes to this document require updating the Version History.
