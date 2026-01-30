import { beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '../lib/prisma.js';

beforeAll(async () => {
  // ensure test database is connected
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // clean up database between tests (in reverse order of dependencies)
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  if (tables.length > 0) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch {
      // tables might not exist yet during first run
    }
  }
});
