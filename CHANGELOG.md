# Changelog

All notable changes to the CardVerse project will be documented in this file.

The format is inspired by **Keep a Changelog** and follows **Semantic Versioning** principles.

---

## [3.0.0] - 2026-08-17 — Sprint 11.5: Database Completion

### Added

- 9 new entities to Prisma schema: Profile, Friend, Wallet, Transaction, Inventory, Achievement, Statistics, Season, Notification
- 5 database migrations applied successfully
- ShopItem model for in-game store
- Daily reward fields (lastDailyClaim, dailyStreak) to Wallet model

### Changed

- **User Service**: migrated from in-memory Map to Prisma
- **Wallet Service**: migrated from in-memory Map to Prisma
- **Shop Service**: migrated from in-memory Map to Prisma
- **Inventory Service**: migrated from in-memory Map to Prisma
- **Friends Service**: migrated from in-memory arrays to Prisma

### Fixed

- All platform modules now persist data in PostgreSQL
- Removed all in-memory storage from platform layer
- Database schema now fully aligned with DATABASE.md

### Database

- 15 tables created: users, profiles, friends, wallets, transactions, inventory, shop_items, achievements, statistics, seasons, notifications, matches, match_players, sessions, _prisma_migrations
- Database schema is up to date with all migrations

---

## [2.0.0] - 2026-08-17 — Sprint 10: Production Correctness

### Added

- PostgreSQL 18.6 local database setup with `cardverse` database
- Prisma migrations for `matches.state` column
- Real JWT authentication with Prisma (guest/me verified)
- `currentTrick` tracking in MatchState for real trick winner calculation

### Changed

- Auth service wired to real `generateToken` + Prisma (replaced mock tokens)
- `engine.service.ts` playCard now uses `ruleExecutor.getTrickWinner` for correct trick winner
- `frontend/vite.config.ts` proxy target changed from 5000 to 3000
- `frontend/src/services/auth.service.ts` baseURL changed from 5000 to 3000
- `shared/src/index.ts` rebuilt with proper exports
- `frontend/src/index.ts` renamed to `index.tsx`
- Socket.IO authentication now requires valid JWT token (backdoor removed)

### Removed

- `directUserId` backdoor from Socket.IO authentication
- Mock token logic from auth service

### Fixed

- Frontend build with JSX support
- Shared package entry point
- Port unification (all services on port 3000)
- Optimistic tricksWon replaced with real trick winner logic
- Socket.IO security vulnerability

---

## [1.5.0] - 2026-08-17 — Sprint 10: Real Trick Winner

### Changed

- `engine.service.ts` playCard method now uses `ruleExecutor.getTrickWinner` to determine the actual trick winner instead of optimistic increment
- `MatchState` now properly tracks `currentTrick` with cards, playedBy, and leadSuit
- Completed trick is recorded in `tricks[]` array with winner information

### Fixed

- Tricks are now correctly awarded to the team that actually wins the trick per RULEBOOK.md Section 8
- Removed optimistic `tricksWon += 1` that incorrectly awarded tricks to the player who played the card

---

## [1.4.0] - 2026-08-16 — Sprint 10: Build Repair

### Changed

- `shared/src/index.ts` rebuilt with proper exports for types, utils, and constants
- `frontend/src/index.ts` renamed to `index.tsx` (JSX support)
- `frontend/index.html` script src updated to `/src/index.tsx`
- `frontend/vite.config.ts` proxy target changed from port 5000 to 3000
- `frontend/src/services/auth.service.ts` baseURL changed from port 5000 to 3000
- DASHBOARD.md updated to version 4.3.0

### Fixed

- Frontend build now works correctly with JSX files
- Shared package now has proper entry point for builds
- Port unification: all services now consistently use port 3000

---

## [1.3.0] - 2026-08-16 — Sprint 10: Auth + Database Operational

### Added

- Real JWT + Prisma authentication (guest/me verified 200 with real token)
- Prisma migration `20260816150047_add_match_state` (matches.state column)

### Changed

- `prisma.config.ts` loads `.env` from `backend/` directory
- DASHBOARD.md → version 4.2.0
- Sprint 10 tasks 10.3 and 10.4 marked Complete

### Fixed

- ESLint `no-unused-vars` errors in auth.service (removed unused `deviceId` destructure)
- Pre-commit hook now passes cleanly

---

## [1.2.0] - 2026-08-14 — Sprint 10: Realism & Remediation

### Changed

- DASHBOARD.md updated to version 4.0.0 with an honest project baseline
- Downgraded overstated `Complete` flags to `In Progress` / `Blocked` / `Not Ready` (Auth, Database, Engine, Frontend, E2E, Production Ready)
- Added Section 8 (Remediation Plan) and CV-DEC-0020 to DASHBOARD.md
- Auth service wired to real `generateToken` + Prisma (replacing in-memory mock tokens)

### Known Blockers (recorded honestly)

- **Resolved (2026-08-14):** PostgreSQL 18.6 installed and running; DB `cardverse` created; `.env` created; `psql` on PATH. Prisma migrations and E2E on a real DB are now possible (not yet applied at this changelog entry).
- `auth.service.ts` Google path still uses `hashToken` placeholder (real ID-token verification pending)
- `migration.sql` is missing the `matches.state` column that exists in `schema.prisma` — the alignment migration is task Sprint 10.3

### Removed (corrected claim)

- Previous CHANGELOG 1.0.0 incorrectly claimed mock tokens were fully removed. In reality mock tokens remained until Sprint 10 began; this version documents the actual wiring to real JWT.

---

## [1.1.0] - 2026-08-11 — Sprint 9: Game Layer (Hokm)

### Added

- Scoring System fully implemented and tested (15/15 tests passed)
- Jest configuration and test scripts for backend testing
- Scoring Service with Trick → Set → Match hierarchy
- Unit tests for Scoring Service (15 tests covering all scenarios)
- Unit tests for Rule Executor

### Changed

- Updated DASHBOARD.md to version 3.1.0
- Updated CHANGELOG.md to version 1.1.0

### Security

- No security changes in this release

---

## [1.0.0] - 2026-08-10 — Sprint 8: Production Hardening

### Added

- JWT authentication service (`jwt.service.ts`) with generateToken and verifyToken
- Real JWT authentication replacing mock tokens in auth middleware
- Socket.IO authentication with JWT token validation
- PostgreSQL database integration with Prisma ORM
- Database schema for Users, Sessions, Matches, and MatchPlayers
- Game state persistence service with database fallback to memory
- Environment validation with Joi for production safety
- Rate limiting, CORS whitelist, and request timeout for production

### Changed

- Updated `.env` and `.env.example` with JWT_SECRET and DATABASE_URL
- Updated `socket/index.ts` to use JWT verification
- Updated `auth.middleware.ts` to use real JWT instead of mock tokens
- Updated `engine.service.ts` with persistence integration
- Updated all core documentation (RULEBOOK, ARCHITECTURE, PRODUCT_BIBLE, API)

### Removed

- Removed mock token logic (`mock_access_guest_*`, `mock_access_google_*`)
- Removed deprecated packages: `@types/helmet`, `@types/joi`

### Security

- Added JWT-based authentication for all protected endpoints
- Added real authentication for Socket.IO connections
- Added environment variable validation
- Added rate limiting and CORS whitelist for production

---

## [0.9.0] - 2026-08-07 — Documentation Consolidation

### Added

- Repository Standards (ESLint, Prettier, Husky, Commitlint)
- TypeScript Foundation (tsconfig.base.json)
- Shared Tooling Configuration (@cardverse/shared package)
- Backend Express Server with middleware (cors, helmet, compression, morgan)
- Backend Core Configuration (config module, logger, error handler)
- Authentication Module (guest login, Google login, account upgrade)
- User Management Module (profile CRUD, search)
- Friends System Module (requests, accept, reject, list, remove)
- Presence System Module (status tracking, heartbeat, batch queries)
- Chat System Module (private messaging between friends, chat rooms, unread counts)
- Notifications System Module (create, list, read/unread, delete, preferences)
- Matchmaking Foundation Module (queue management, skill-based matching, region optimization)
- Wallet System Module (balance management, transactions, daily rewards with streak system)
- Shop System Module (item catalog, purchasing, inventory management, equip/unequip)
- Inventory System Module (view inventory, use consumables, transfer items, equip/unequip)
- Frontend Foundation (React, TypeScript, Vite)
- Frontend Configuration (package.json, tsconfig.json, vite.config.ts)
- Frontend Core Components (App, index, styles)
- Shared Package Configuration (@cardverse/shared)
- Tests Package Configuration (@cardverse/tests)
- Tools Package Configuration (@cardverse/tools)
- Frontend Authentication Integration (auth service, AuthContext, Login/Register pages)
- Frontend UI Components (ProtectedRoute, authentication styles)
- Frontend Routing (react-router-dom integration)

### Changed

- Restructured documentation: merged operational docs into DASHBOARD.md
- Updated README.md with setup instructions
- Updated PRODUCT_BIBLE.md with comprehensive glossary

### Removed

- REPOSITORY_SNAPSHOT.md (replaced by targeted query method)
- SYSTEM_START_HERE.md (merged into DASHBOARD.md)
- SETUP_GUIDE.md (merged into README.md)
- IMPLEMENTATION_STATUS.md (merged into DASHBOARD.md)
- PROJECT_STATUS.md (merged into DASHBOARD.md)
- DECISION_LOG.md (merged into DASHBOARD.md)
- GLOSSARY.md (merged into PRODUCT_BIBLE.md)

### Fixed

- Documentation cross-reference consistency
- Version alignment across all documents

---

## [0.1.0] - 2026-06-30

### Added

- Initial repository structure
- Project documentation framework
- README
- Product Bible
- Architecture
- Database Bible
- API Bible
- RuleBook foundation
- AI system documentation structure

### Changed

- Repository naming conventions standardized
- Documentation structure redesigned for Enterprise architecture

### Fixed

- Cross-reference consistency
- Document headers
- Versioning alignment

---

## Future Releases

Future versions will document:

- Added
- Changed
- Deprecated
- Removed
- Fixed
- Security
