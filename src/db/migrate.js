require('dotenv').config();
const { drizzle } = require('drizzle-orm/postgres-js');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const postgres = require('postgres');

const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });

async function runMigration() {
  try {
    console.log('Starting migration...');
    const db = drizzle(migrationClient);
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();