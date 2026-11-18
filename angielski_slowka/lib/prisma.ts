import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { parseEnv } from '@neon/env';
import neonConfig from '../neon';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.POSTGRES_PRISMA_URL
    ?? (process.env.DATABASE_URL ? parseEnv(neonConfig, ['DATABASE_URL']).postgres.databaseUrl : null)
    ?? 'postgresql://user:password@localhost:5432/words';
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
