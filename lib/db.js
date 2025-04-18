// lib/db.js
import { Pool } from 'pg';

let pool;

// Create and export the database connection pool
export const getDbConnection = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      application_name: 'pma-web-app',
    });

    // Set timezone for all connections
    pool.on('connect', async (client) => {
      try {
        await client.query('SET TIME ZONE \'Asia/Dhaka\'');
        console.log('Database timezone set to Asia/Dhaka');
      } catch (error) {
        console.error('Error setting timezone:', error);
      }
    });

    // Log connection events
    pool.on('connect', () => console.log('New database connection established'));
    pool.on('acquire', () => console.log('Client acquired from pool'));
    pool.on('remove', () => console.log('Client removed from pool'));
    
    console.log('Database Connection Pool Created');
  }
  return pool;
};

// Enhanced query function with timezone awareness
export const query = async (text, params) => {
  const client = await getDbConnection().connect();
  try {
    console.log('Executing query:', text.replace(/\s+/g, ' '), 'Params:', params);
    const start = Date.now();
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    console.log(`Query completed in ${duration}ms`, result.rowCount, 'rows affected');
    return result;
  } catch (error) {
    console.error('Database Query Error:', {
      query: text,
      params,
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Database operation failed: ${error.message}`);
  } finally {
    client.release();
  }
};

// Improved connection pool shutdown
export const closeDbConnectionPool = async () => {
  if (pool) {
    console.log('Closing database connection pool...');
    try {
      await pool.end();
      console.log('Database Connection Pool Closed');
    } catch (error) {
      console.error('Error closing connection pool:', error);
    }
  }
};

// Handle application shutdown gracefully
const shutdown = async () => {
  console.log('Application shutdown initiated');
  await closeDbConnectionPool();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', shutdown);