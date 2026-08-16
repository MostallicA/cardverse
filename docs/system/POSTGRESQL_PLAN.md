# PostgreSQL Integration Plan

**Document ID:** CV-SYS-019
**Version:** 0.1.0
**Status:** Complete (Implementation)
**Classification:** System
**Owner:** Mostafa
**Created:** 2026-08-08
**Last Updated:** 2026-08-08

---

## Table of Contents

1. Purpose
2. Options Analysis
3. Recommendation
4. Installation Plan
5. Configuration Plan
6. Schema Design
7. Initial Connection Plan
8. Migration Strategy
9. Risks & Considerations
10. References

---

## 1. Purpose

This document plans the integration of a PostgreSQL database into the CardVerse backend. It evaluates available ORM/query-builder options, proposes a schema aligned with DATABASE.md, and outlines the steps to establish an initial database connection.

**No code changes are made as part of this document.** It is a planning reference for Sprint 8 (Task 8.1 — Add real database).

---

## 2. Options Analysis

Three primary approaches are considered for PostgreSQL integration.

### 2.1 `pg` (node-postgres) — Raw Driver

| Aspect       | Detail                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------- |
| **Type**     | Low-level PostgreSQL client                                                                                          |
| **Pros**     | Lightweight, full SQL control, minimal abstraction, no code generation                                               |
| **Cons**     | Manual schema/migration management, verbose, no type safety for queries, requires manual mapping to TypeScript types |
| **Best for** | Simple projects, teams wanting full SQL control, minimal dependencies                                                |

### 2.2 Prisma ORM

| Aspect       | Detail                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Type**     | Full-featured ORM with schema-first approach                                                                       |
| **Pros**     | Type-safe queries, auto-generated TypeScript types, built-in migrations, excellent DX, intuitive schema definition |
| **Cons**     | Heavier dependency, code generation step, some abstraction from raw SQL, learning curve                            |
| **Best for** | Projects prioritizing developer experience, type safety, and maintainable migrations                               |

### 2.3 TypeORM

| Aspect       | Detail                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| **Type**     | Traditional ORM with decorator-based entities                                                                 |
| **Pros**     | Familiar decorator syntax, active record & data mapper patterns, built-in migrations, good TypeScript support |
| **Cons**     | Heavier than pg, decorator-based config can be verbose, migration tooling less polished than Prisma           |
| **Best for** | Teams familiar with decorator-based ORMs (e.g., from NestJS)                                                  |

---

## 3. Recommendation

**Recommended: Prisma ORM**

Rationale:

1. **Type Safety** — Prisma generates TypeScript types directly from the schema, eliminating manual type mapping and reducing runtime errors. This aligns with the project's strict TypeScript configuration (`strict: true`).
2. **Built-in Migrations** — Prisma Migrate provides version-controlled, reversible migrations, satisfying DATABASE.md §9 (Migration Strategy: "Schema changes must be applied through version-controlled migrations").
3. **Schema-First Design** — The schema is defined in a single `schema.prisma` file, making it easy to review and align with DATABASE.md naming conventions (snake_case tables/columns).
4. **Developer Experience** — Prisma's query API is intuitive and reduces boilerplate compared to raw `pg`.
5. **Modular Monolith Fit** — Prisma works well with a modular monolith, allowing each module to access its own data through Prisma Client.

**Fallback:** If the team prefers minimal dependencies and full SQL control, `pg` with a lightweight migration tool (e.g., `node-pg-migrate`) is a viable alternative. TypeORM is recommended only if the team has existing familiarity with decorator-based ORMs.

---

## 4. Installation Plan

### 4.1 Packages (Prisma approach)

```bash
# In backend/ workspace
pnpm add @prisma/client
pnpm add -D prisma
```

### 4.2 Initialize Prisma

```bash
# In backend/ workspace
npx prisma init
```

This creates:

- `backend/prisma/schema.prisma` — schema definition
- `backend/prisma/migrations/` — migration history
- `.env` entry for `DATABASE_URL`

### 4.3 Alternative (pg approach)

```bash
pnpm add pg
pnpm add -D @types/pg
```

---

## 5. Configuration Plan

### 5.1 Environment Variables

Add to `.env` and `.env.example`:

```env
DATABASE_URL=postgresql://cardverse:cardverse@localhost:5432/cardverse?schema=public
```

### 5.2 Config Module

Extend `backend/src/config/index.ts` to include database settings:

```ts
export const config = {
  // ...existing config
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/cardverse',
  },
};
```

### 5.3 Prisma Client Singleton

Create `backend/src/db/prisma.ts`:

```ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
```

---

## 6. Schema Design

The schema follows DATABASE.md naming conventions (snake_case, `id` PK, `created_at`/`updated_at`/`deleted_at` timestamps, soft delete).

### 6.1 Users

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  username     String   @unique
  passwordHash String?
  accountType  String   @default("guest") // guest | google
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  deletedAt    DateTime? @map("deleted_at")

  sessions Session[]
  matches  MatchPlayer[]

  @@map("users")
}
```

### 6.2 Sessions

Represents an active game session (per DATABASE.md §4.4 Match / §4.5 Room).

```prisma
model Session {
  id        String   @id @default(cuid())
  matchId   String   @unique
  status    String   @default("active") // active | completed | abandoned
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  players MatchPlayer[]

  @@map("sessions")
}
```

### 6.3 Matches

Stores match history (per DATABASE.md §4.4 Match).

```prisma
model Match {
  id          String   @id @default(cuid())
  sessionId   String   @unique
  gameMode    String   @default("RANKED")
  status      String   @default("pending") // pending | playing | completed
  winnerTeam  Int?
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  session Session @relation(fields: [sessionId], references: [id])
  players MatchPlayer[]

  @@map("matches")
}

model MatchPlayer {
  id        String  @id @default(cuid())
  matchId   String
  sessionId String
  userId    String
  seatIndex Int
  teamId    Int
  isBot     Boolean @default(false)
  isWinner  Boolean @default(false)

  match   Match   @relation(fields: [matchId], references: [id])
  session Session @relation(fields: [sessionId], references: [id])
  user    User    @relation(fields: [userId], references: [id])

  @@unique([matchId, userId])
  @@map("match_players")
}
```

---

## 7. Initial Connection Plan

1. **Install Prisma** and initialize (`npx prisma init`).
2. **Define schema** in `backend/prisma/schema.prisma` (as above).
3. **Set `DATABASE_URL`** in `.env`.
4. **Run first migration:** `npx prisma migrate dev --name init`.
5. **Generate client:** `npx prisma generate`.
6. **Create Prisma client singleton** (`backend/src/db/prisma.ts`).
7. **Test connection** with a simple health check query (e.g., `SELECT 1` or count users).
8. **Wire into app** — optionally add a DB health check to the `/health` endpoint.

---

## 8. Migration Strategy

Per DATABASE.md §9:

- All schema changes via version-controlled migrations (`prisma migrate`).
- Every migration reversible where practical.
- No manual schema modifications.
- Migrations committed to the repository.

---

## 9. Risks & Considerations

| Risk                              | Mitigation                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------- |
| **Prisma adds dependency weight** | Acceptable trade-off for type safety & DX; can fall back to `pg` if needed       |
| **Code generation step**          | Add `prisma generate` to build/dev scripts                                       |
| **Existing in-memory game state** | Game state persistence (Task 8.2) is separate; DB stores history, not live state |
| **Migration conflicts**           | Use single migration workflow; review before applying                            |
| **Local PostgreSQL availability** | Provide Docker Compose or documented local setup                                 |

---

## 10. References

- DATABASE.md (core design principles)
- ARCHITECTURE.md (modular monolith, module ownership)
- DASHBOARD.md (Sprint 8 — Task 8.1)
- API.md (auth & user endpoints)
- CHANGELOG.md (Sprint 8 implementation history)

---

**Document Status:** Complete (Implementation)

This document was implemented in Sprint 8 (Tasks 8.1–8.2: real database + game state persistence). It is retained as the reference for the PostgreSQL / Prisma integration and schema design.

---

**Implementation finished:** Migrations applied to `cardverse` database on 2026-08-16. Auth is now fully operational with real JWT + Prisma.
