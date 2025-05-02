require('dotenv').config();
const { drizzle } = require('drizzle-orm/postgres-js');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const postgres = require('postgres');


const migrationClient = postgres('postgresql://postgresql_fastify_user:dK50FIQfx9xk67cR252MWudvi1HKef0v@dpg-d0a48ujuibrs73aq93c0-a.singapore-postgres.render.com/postgresql_fastify', {
  max: 1,
  ssl: 'require'
});


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