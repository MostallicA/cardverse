// Prisma Client singleton
// Centralized Prisma Client instance for the CardVerse backend.
// Uses the PostgreSQL driver adapter (@prisma/adapter-pg) as required by Prisma 7.

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL ?? '';

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });
