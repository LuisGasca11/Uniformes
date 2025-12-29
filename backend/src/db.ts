import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: '../.env' });

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'uniformes',
  user: 'postgres',
  password: 'Blackkey26$',
});

export default pool;
