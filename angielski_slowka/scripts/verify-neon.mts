import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function main() {
  const [{ prisma }, { verifyObjectStorage }] = await Promise.all([
    import('../lib/prisma'),
    import('../services/neonStorage'),
  ]);
  try {
    const rows = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`;
    if (Number(rows[0]?.ok) !== 1) throw new Error('Neon Postgres returned an unexpected result.');
    console.log('Postgres: SELECT 1 succeeded.');

    await verifyObjectStorage();
    console.log('Object Storage: temporary upload, download, and delete succeeded.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Neon verification failed.');
  process.exitCode = 1;
});
