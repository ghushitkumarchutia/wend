import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { user } from './schema/auth';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@wend.app';
const ADMIN_NAME = process.env.ADMIN_NAME ?? 'Wend Admin';

async function seed() {
  const client = postgres(DATABASE_URL!, { max: 1 });
  const db = drizzle(client);

  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
    await client.end();
    return;
  }

  await db.insert(user).values({
    id: crypto.randomUUID(),
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    emailVerified: true,
    role: 'admin',
  });

  console.log(`Admin user created: ${ADMIN_EMAIL}`);
  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
