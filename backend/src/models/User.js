import pool from '../config/db.js';

const userColumns = `
  id AS "_id", name, email, phone, role,
  created_at AS "createdAt", updated_at AS "updatedAt"
`;

export async function findUserByEmail(email, includePassword = false) {
  const columns = includePassword ? `${userColumns}, password` : userColumns;
  const { rows } = await pool.query(`SELECT ${columns} FROM users WHERE email = $1`, [email]);
  return rows[0] || null;
}

export async function findUserById(id) {
  const { rows } = await pool.query(`SELECT ${userColumns} FROM users WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function createUser({ name, email, phone = '', password, role }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, phone, password, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${userColumns}`,
    [name.trim(), email, phone.trim(), password, role]
  );
  return rows[0];
}

export async function listUsers() {
  const { rows } = await pool.query(`SELECT ${userColumns} FROM users ORDER BY created_at DESC`);
  return rows;
}

export async function countUsers() {
  const { rows } = await pool.query('SELECT count(*)::int AS count FROM users');
  return rows[0].count;
}

export async function deleteUserById(id) {
  const { rows } = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING ${userColumns}`,
    [id]
  );
  return rows[0] || null;
}
