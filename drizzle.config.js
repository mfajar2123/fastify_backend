
require('dotenv').config();

/** @type {import('drizzle-kit').Config} */
module.exports = {
  schema: './src/db/schema.js',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: 'postgresql://postgresql_fastify_user:dK50FIQfx9xk67cR252MWudvi1HKef0v@dpg-d0a48ujuibrs73aq93c0-a.singapore-postgres.render.com/postgresql_fastify' ,
    ssl: true
  },
};