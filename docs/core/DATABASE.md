# CardVerse Database

**Document ID:** CV-9001
**Version:** 0.4.0
**Status:** Frozen
**Classification:** Technical
**Owner:** Mostafa
**Created:** 2026-06-27
**Last Updated:** 2026-08-18

---

# Table of Contents

1. Database Overview

2. Database Design Principles

3. Naming Conventions

4. Core Entities

5. Relationships

6. Data Integrity

7. Indexing Strategy

8. Performance Strategy

9. Scalability Strategy

10. Future Evolution

11. References

12. Version History

---

# 1. Database Overview

## Purpose

This document defines the database architecture, design principles, entity ownership and persistence strategy for the CardVerse platform.

The database is responsible for persistent data storage only.

Business rules, gameplay logic and application workflows are implemented outside the database.

---

## Scope

This document defines:

- Database philosophy
- Entity ownership
- Naming conventions
- Relationships
- Constraints
- Indexing strategy
- Performance guidelines
- Scalability strategy

Implementation details such as SQL scripts and migrations are documented separately.

---

## Responsibilities

The database stores persistent platform data including:

- Users
- Profiles
- Friends
- Wallets
- Inventory
- Statistics
- Matches
- Seasons
- Notifications
- Achievements
- Configuration

The database never contains business logic or game rules.

---

## Design Goals

The database must provide:

- Data Integrity
- High Performance
- Scalability
- Reliability
- Maintainability
- Auditability
- Vendor Independence

---

# 2. Database Design Principles

## Data Integrity First

Maintaining consistent and correct data always has higher priority than optimization.

---

## Normalization First

Data should remain normalized unless measurable performance requirements justify controlled denormalization.

---

## Performance Awareness

Database design should minimize unnecessary joins, duplicated writes and inefficient queries.

---

## Soft Delete by Default

Business entities should use soft deletion whenever historical information may be valuable.

Deletion timestamps are stored in:

- deleted_at

Physical deletion is reserved for exceptional cases.

---

## Audit Friendly

Important business entities should preserve historical changes whenever appropriate.

Auditability must be considered during schema design.

---

## Vendor Independence

Database structures should avoid vendor-specific features unless there is a clear architectural justification.

---

## Module Ownership

Each entity belongs to exactly one module.

Only the owning module is responsible for modifying its data.

Other modules access data only through defined services or interfaces.

---

# 3. Naming Conventions

## Tables

Table names use:

snake_case

Examples:

- users
- player_profiles
- friend_requests

---

## Columns

Column names use:

snake_case

Examples:

- display_name
- current_rank
- created_at

---

## Primary Keys

Every table contains:

id

Primary keys use a consistent strategy across the platform.

---

## Foreign Keys

Foreign keys follow the convention:

<entity>_id

Examples:

- user_id
- season_id
- room_id

---

## Timestamp Columns

Standard timestamp fields:

- created_at
- updated_at
- deleted_at

All timestamps use UTC.

---

## Boolean Fields

Boolean columns begin with descriptive prefixes whenever appropriate.

Examples:

- is_active
- is_verified
- has_completed_tutorial

---

## Junction Tables

Relationship tables combine entity names.

Examples:

- user_roles
- player_achievements
- match_players

---

## Index Names

Indexes follow a consistent convention.

Examples:

- idx_users_email
- idx_matches_status
- idx_statistics_rank

---

## Constraint Names

Constraints use descriptive names.

Examples:

- pk_users
- fk_profiles_user
- uq_users_email
- ck_wallet_balance

---

# 4. Core Entities

## Purpose

This chapter defines the primary persistent entities of the CardVerse platform and identifies their ownership and responsibilities.

---

## 4.1 User

**Owner Module:** Authentication

Represents a player account.

Responsibilities:

- Authentication
- Identity
- Account Status
- Login Information

A User is the root entity for all player-related data.

---

## 4.2 Profile

**Owner Module:** Profiles

Stores public player information.

Contains:

- Username
- Avatar
- Avatar Frame
- Country
- Bio
- Player Level

Each User owns exactly one Profile.

---

## 4.3 Friend

**Owner Module:** Friends

Stores friendship relationships.

Supports:

- Friend Requests
- Accepted Friends
- Blocking
- Favorite Friends (Future)

---

## 4.4 Match

**Owner Module:** Match Engine

Represents one gameplay session.

Contains:

- Participants
- Teams
- Match Status
- Final Result
- Statistics Reference

Gameplay rules are not stored in this entity.

---

## 4.5 Room — Removed

**Decision (2026-08-18):** Removed per DASHBOARD.md CV-DEC-0022 — `Room` is not a database entity. Room management is an Engine Layer (Room Manager) concern, and active tables persist through the `Session` entity (§4.13). No `Room` table exists in `schema.prisma`.

---

## 4.6 Wallet

**Owner Module:** Economy

Stores player currencies.

Supported currencies:

- Coins
- Gems (Planned)

Every balance modification must generate a transaction record.

---

## 4.7 Inventory

**Owner Module:** Inventory

Stores owned cosmetic items.

Examples:

- Avatars
- Frames
- Card Backs
- Themes
- Titles

Inventory never stores gameplay advantages.

---

## 4.8 Achievement

**Owner Module:** Achievement System

Stores unlocked achievements and progression.

Contains:

- Achievement Identifier
- Progress
- Unlock Date
- Reward Status

---

## 4.9 Statistics

**Owner Module:** Statistics

Stores permanent player statistics.

Examples:

- Total Matches
- Wins
- Losses
- Win Rate
- Fair Play Score
- Game-specific Statistics

---

## 4.10 Season

**Owner Module:** Seasons

Stores seasonal progression.

Contains:

- Seasonal Rating
- Seasonal Rank
- Season Rewards

Lifetime statistics remain separate.

---

## 4.11 Notification

**Owner Module:** Notifications

Stores pending player notifications.

Examples:

- Friend Requests
- Match Invitations
- Rewards
- Announcements

Notifications may expire automatically.

---

## 4.12 Report — Deferred

**Decision (2026-08-18):** Deferred to a future release per DASHBOARD.md CV-DEC-0022. Moderation/reporting is not required for V1, so no `Report` entity is modeled in `schema.prisma`. This section will be restored when the feature is scheduled.

---

## 4.13 Session

**Owner Module:** Engine Layer

Represents an active game session.

Contains:

- matchId (unique)
- status (active | completed | abandoned)
- players (reference to MatchPlayer)

Sessions track live game state and are persisted in the database for recovery.

---

## 4.14 MatchPlayer

**Owner Module:** Engine Layer

Junction table linking players to matches.

Contains:

- matchId
- sessionId
- userId
- seatIndex
- teamId (1 or 2)
- isBot
- isWinner

This entity enables querying which players participated in which matches.

---

# 5. Relationships

## Purpose

This chapter defines logical relationships between core entities.

---

## User Relationships

A User owns:

- One Profile
- One Wallet
- One Statistics Record

A User may own:

- Multiple Inventory Items
- Multiple Matches
- Multiple Notifications
- Multiple Achievements
- Multiple Reports

---

## Match Relationships

A Match contains:

- Multiple Players
- One Room (Optional)
- One Result
- One Statistics Snapshot

---

## Season Relationships

A Season relates to:

- Rankings
- Statistics
- Rewards

Historical seasons remain immutable.

---

## Inventory Relationships

Each Inventory Item belongs to exactly one User.

Items never belong to multiple users simultaneously.

---

## Relationship Principles

Relationships should:

- Minimize duplication
- Preserve integrity
- Remain normalized
- Support efficient queries

---

# 6. Data Integrity

## Purpose

This chapter defines the rules that guarantee database consistency.

---

## Primary Keys

Every entity contains a primary key.

Primary keys are immutable.

---

## Foreign Keys

Relationships must be enforced using foreign keys whenever appropriate.

Orphan records are not permitted.

---

## Unique Constraints

Unique constraints protect business rules.

Examples:

- Username
- Email
- External Account Identifier

---

## Soft Delete

Business entities should be soft deleted whenever historical information has value.

Soft deletion uses:

deleted_at

---

## Transactions

Multi-step business operations must execute inside database transactions.

Either every change succeeds or none of them are persisted.

---

## Audit Fields

Business entities should include:

- created_at
- updated_at

Soft-deletable entities also include:

- deleted_at

---

## Data Ownership

Only the owning module may modify an entity.

Cross-module writes are prohibited.

---

## Referential Integrity

Every relationship must preserve referential integrity throughout the entity lifecycle.

Broken references are not allowed.

---

# 7. Indexing Strategy

## Purpose

This chapter defines the indexing strategy used to optimize query performance while maintaining efficient write operations.

---

## Primary Indexes

Every table must define a primary key index.

Primary keys uniquely identify each record and must remain immutable.

---

## Foreign Key Indexes

Foreign key columns should be indexed whenever they are frequently used in joins.

Examples:

- user_id
- profile_id
- match_id
- season_id

---

## Unique Indexes

Unique indexes enforce business rules.

Examples:

- Email Address
- Username
- External Authentication Identifier

---

## Composite Indexes

Composite indexes should be created only when query patterns justify them.

Examples:

- (season_id, rank)
- (user_id, created_at)
- (match_status, created_at)

---

## Search Indexes

Frequently searched columns should be indexed.

Examples:

- Username
- Display Name
- Match Status

---

## Index Design Principles

Indexes should:

- Improve read performance
- Avoid redundancy
- Match actual query patterns
- Be reviewed regularly

Unnecessary indexes increase write costs and should be avoided.

---

# 8. Performance Strategy

## Purpose

This chapter defines database performance guidelines.

---

## Read Optimization

Optimize frequently executed read queries by:

- Proper indexing
- Efficient filtering
- Limiting returned columns
- Avoiding unnecessary joins

---

## Write Optimization

Batch writes when appropriate.

Avoid repeated updates within a single transaction.

---

## Pagination

Large datasets must use pagination.

Offset-based pagination is acceptable for small datasets.

Cursor-based pagination may be introduced for large collections.

---

## Query Standards

Queries should:

- Return only required columns
- Avoid SELECT *
- Minimize nested queries
- Use indexes effectively

---

## Archiving

Historical data may be archived when it is no longer required for operational workloads.

Archived data must remain recoverable.

---

# 9. Scalability Strategy

## Purpose

This chapter defines how the database architecture will evolve as CardVerse grows.

---

## Initial Deployment

Version 1.0 uses:

- Single Database
- Modular Monolith
- Shared Schema

This approach simplifies development while preserving modular boundaries.

---

## Future Evolution

Future versions may introduce:

- Read Replicas
- Database Partitioning
- Distributed Caching
- Independent Data Stores
- Dedicated Analytics Database

Architectural evolution must preserve data integrity.

---

## Migration Strategy

Schema changes must be applied through version-controlled migrations.

Manual schema modifications are prohibited.

Every migration must be reversible whenever practical.

---

## Backup Strategy

Production databases must support:

- Scheduled Backups
- Point-in-Time Recovery
- Restore Validation

Backup procedures should be tested regularly.

---

## Data Retention

Retention policies should balance:

- Business requirements
- Legal requirements
- Storage costs

Historical gameplay data may be archived but should not be silently discarded.

---

# 10. Future Evolution

The database is designed to support long-term platform growth.

Future enhancements may include:

- Sharding
- Multi-Region Replication
- Event Sourcing Support
- Dedicated Reporting Database
- Real-Time Analytics Pipeline

These enhancements must preserve compatibility with the architectural principles defined in the Architecture document.

---

# 11. References

Related documents:

- CARDVERSE_INDEX.md
- DASHBOARD.md
- README.md
- PRODUCT_BIBLE.md
- ARCHITECTURE.md
- API.md
- RULEBOOK.md
- PROJECT_RULES.md
- PROJECT_DNA.md
- POSTGRESQL_PLAN.md

---

# 12. Version History

| Version | Date       | Description                                                                    |
| ------- | ---------- | ------------------------------------------------------------------------------ |
| 0.1.0   | 2026-06-30 | Enterprise database foundation                                                 |
| 0.1.0   | 2026-07-01 | Documentation Freeze completed                                                 |
| 0.2.0   | 2026-08-09 | Added Session and MatchPlayer entities; added POSTGRESQL_PLAN.md to References |
| 0.3.0   | 2026-08-10 | References updated: PROJECT_STATUS.md replaced with DASHBOARD.md               |
| 0.4.0   | 2026-08-18 | Removed `Room` (replaced by `Session`) and deferred `Report` per DASHBOARD.md CV-DEC-0022; responsibilities list aligned with actual schema                                                                       |

---

This document defines the official database design principles for the CardVerse platform.

All database schemas, migrations and persistence implementations must remain consistent with this document.

Changes to this document require updating the Version History.
