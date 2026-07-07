# Changelog

All notable changes to the CardVerse project will be documented in this file.

The format is inspired by **Keep a Changelog** and follows **Semantic Versioning** principles.

---

## [Unreleased]

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
