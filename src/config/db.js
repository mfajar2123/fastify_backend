require('dotenv').config();
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

const connectionString = 'postgresql://postgresql_fastify_user:dK50FIQfx9xk67cR252MWudvi1HKef0v@dpg-d0a48ujuibrs73aq93c0-a.singapore-postgres.render.com/postgresql_fastify';
const pgClient = postgres(connectionString, {
    ssl: 'require'
});
const db = drizzle(pgClient);

module.exports = { db };