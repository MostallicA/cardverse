# CardVerse Setup Guide

**Document ID:** CV-SYS-011
**Version:** 1.0.0
**Status:** Frozen
**Classification:** System
**Owner:** Mostafa & ChatGPT
**Created:** 2026-07-04
**Last Updated:** 2026-07-04

---

## Table of Contents

1. Purpose
2. Prerequisites
3. Initial Setup Steps
4. Environment Variables
5. Development Commands
6. Troubleshooting
7. References
8. Version History

---

## 1. Purpose

This document provides a complete, step-by-step guide for setting up the CardVerse development environment.

Its purpose is to ensure that any developer or AI assistant can quickly and correctly set up the project from scratch.

**This document is the single source of truth for development environment setup.**

---

## 2. Prerequisites

Before beginning the setup, verify that the following tools are installed on your system.

### Required Tools

| Tool    | Minimum Version | Installation Command      | Verification Command |
|---------|-----------------|---------------------------|----------------------|
| Git     | 2.x             | Download from git-scm.com | `git --version`      |
| Node.js | 20.x            | Download from nodejs.org  | `node --version`     |
| pnpm    | 9.x             | `npm install -g pnpm`     | `pnpm --version`     |

### Installation Commands

If you need to install any of the above tools, use the following commands.

#### Install Git (Windows)
1. Download from: https://git-scm.com/download/win
2. Run the installer with default settings.
3. Verify installation: `git --version`

#### Install Node.js (Windows)
1. Download from: https://nodejs.org/
2. Choose the LTS version (20.x).
3. Run the installer with default settings.
4. Verify installation: `node --version`

#### Install pnpm (Global)

npm install -g pnpm

Verify installation:

pnpm --version

---

## 3. Initial Setup Steps

Follow these steps exactly as written.

### Step 1: Clone Repository

If you have the repository locally, navigate to the project root:
cd C:\Dev\CardVerse

If you need to clone the repository for the first time:
git clone <repository-url>
cd CardVerse

### Step 2: Verify Repository Structure

Confirm that you are in the correct directory:
dir

Expected output should include:
- .gitignore
- package.json
- pnpm-workspace.yaml
- README.md
- docs/
- backend/
- frontend/
- shared/

### Step 3: Install Dependencies

Install all project dependencies using pnpm:
pnpm install

This command will:
- Read the workspace configuration from pnpm-workspace.yaml
- Install dependencies for all packages (backend, frontend, shared, tools)
- Create the pnpm-lock.yaml file

### Step 4: Verify Installation

Verify that all dependencies were installed correctly:
pnpm list --depth=0

Check that the following directories now contain node_modules:
- backend/node_modules
- frontend/node_modules
- shared/node_modules

### Step 5: Build the Project (Optional)

To verify the build process works:
pnpm run build

This command will build all packages in the workspace.

### Step 6: Run Development Servers (Optional)

To start the development environment:
pnpm run dev

This command will start all development servers in parallel.

---

## 4. Environment Variables

### Current Status

No environment variables are required for the current phase (Repository Foundation).

Environment variables will be added in Phase 3 (Backend Foundation) and Phase 6 (Platform Features).

### Future Variables

When environment variables are introduced, they will be documented here.

### Example .env File (For Future Reference)
Server Configuration
PORT=3000

Database Configuration
DATABASE_URL=postgresql://localhost:5432/cardverse

Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

JWT
JWT_SECRET=your-secret-key

Environment
NODE_ENV=development

---

## 5. Development Commands

All commands should be run from the project root (C:\Dev\CardVerse).

### Package Management

| Command        | Purpose                  |
|----------------|--------------------------|
| `pnpm install` | Install all dependencies |
| `pnpm update`  | Update all dependencies  |
| `pnpm list`    | List installed packages  |

### Development

| Command                 | Purpose                       |
|-------------------------|-------------------------------|
| `pnpm run dev`          | Start all development servers |
| `pnpm run dev:backend`  | Start only backend server     |
| `pnpm run dev:frontend` | Start only frontend server    |

### Build

| Command                   | Purpose             |
|---------------------------|---------------------|
| `pnpm run build`          | Build all packages  |
| `pnpm run build:backend`  | Build only backend  |
| `pnpm run build:frontend` | Build only frontend |

### Testing

| Command                     | Purpose               |
|-----------------------------|-----------------------|
| `pnpm run test`             | Run all tests         |
| `pnpm run test:unit`        | Run unit tests        |
| `pnpm run test:integration` | Run integration tests |

### Linting and Formatting

| Command             | Purpose                          |
|---------------------|----------------------------------|
| `pnpm run lint`     | Lint all code                    |
| `pnpm run lint:fix` | Fix linting issues automatically |
| `pnpm run format`   | Format all code with Prettier    |

### Git Operations

| Command                   | Purpose                         |
|---------------------------|---------------------------------|
| `git status`              | Check current repository status |
| `git add <file>`          | Stage changes                   |
| `git commit -m "message"` | Commit staged changes           |
| `git push`                | Push commits to remote          |

---

## 6. Troubleshooting

### Common Issues and Solutions

#### Issue: `pnpm: command not found`

**Solution:** pnpm is not installed globally.
npm install -g pnpm

#### Issue: `node: command not found`

**Solution:** Node.js is not installed or not in PATH.
1. Download and install Node.js from https://nodejs.org/
2. Restart your terminal.

#### Issue: `pnpm install` fails with permission errors

**Solution:** Clear the cache and retry.
pnpm store prune
pnpm install

#### Issue: `pnpm run dev` fails

**Solution:** Verify that dependencies are installed.
pnpm install
pnpm run build
pnpm run dev

#### Issue: Git commands fail

**Solution:** Verify that Git is installed and configured.
git --version
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

#### Issue: Port conflicts

**Solution:** Change the port in the configuration file or stop the existing process.

---

## 7. References

Related documents:

- README.md
- PROJECT_STATUS.md
- REPOSITORY_SNAPSHOT.md
- CARDVERSE_INDEX.md
- AI_DEVELOPER_GUIDE.md

---

## 8. Version History

| Version | Date       | Description                    |
|---------|------------|--------------------------------|
| 1.0.0   | 2026-07-04 | Initial setup guide created    |

---

**Document Status:** Frozen

This document is the authoritative source for development environment setup.

All developers and AI assistants must follow this guide to set up the CardVerse development environment.

Changes to this document require updating the Version History.