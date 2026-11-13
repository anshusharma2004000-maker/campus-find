import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Set it to your Neon PostgreSQL connection string.');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function connectDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name varchar(80) NOT NULL,
      email text NOT NULL UNIQUE,
      phone varchar(20) NOT NULL DEFAULT '',
      password text NOT NULL,
      role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS reports (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title varchar(100) NOT NULL,
      type text NOT NULL CHECK (type IN ('Lost', 'Found')),
      category text NOT NULL,
      description varchar(2000) NOT NULL,
      location text NOT NULL,
      date date NOT NULL,
      status text NOT NULL CHECK (status IN ('Lost', 'Found', 'Returned')),
      image_url text NOT NULL DEFAULT '',
      image_public_id text NOT NULL DEFAULT '',
      contact_name text NOT NULL,
      contact_email text NOT NULL,
      contact_phone text NOT NULL DEFAULT '',
      posted_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports (created_at DESC);
    CREATE INDEX IF NOT EXISTS reports_posted_by_idx ON reports (posted_by);
  `);
  console.log('Neon PostgreSQL connected and schema is ready');
}

export default pool;
