require('dotenv').config();
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;
const pgClient = postgres(connectionString, {
    ssl: 'require'
});
const db = drizzle(pgClient);

module.exports = { db };