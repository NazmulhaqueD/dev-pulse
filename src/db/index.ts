import { Pool } from "pg";
import config from "../config";
export const pool = new Pool({ connectionString: config.connection_string });

export const initDb = async () => {
  try {
    // =====users table =====
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(20),
        email VARCHAR(30) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(15) DEFAULT 'contributor',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `);

    await pool.query(`
          CREATE TABLE IF NOT EXISTS issues(
          id SERIAL PRIMARY KEY,
          title VARCHAR(150),
          description	TEXT CHECK (LENGTH(description) >= 20),
          type VARCHAR(20) NOT NULL CHECK (type IN ('bug','feature_request')),
          status VARCHAR(20) DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved')),
          reporter_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
          )
          `);

    console.log("Database connected successfully");
  } catch (error) {}
};
