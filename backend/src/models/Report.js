import pool from '../config/db.js';

const reportColumns = `
  id AS "_id", title, type, category, description, location, date, status,
  image_url AS "imageUrl", image_public_id AS "imagePublicId",
  contact_name AS "contactName", contact_email AS "contactEmail",
  contact_phone AS "contactPhone", posted_by AS "postedBy",
  created_at AS "createdAt", updated_at AS "updatedAt"
`;
const qualifiedReportColumns = reportColumns.trim().split(', ').map(column => `r.${column}`).join(', ');

function mapReport(row) {
  if (!row) return null;
  if (row.poster_name !== undefined) {
    row.postedBy = {
      _id: row.postedBy,
      name: row.poster_name,
      ...(row.poster_email !== undefined && { email: row.poster_email }),
      ...(row.poster_phone !== undefined && { phone: row.poster_phone })
    };
    delete row.poster_name;
    delete row.poster_email;
    delete row.poster_phone;
  }
  return row;
}

export async function listReports({ q, category, location, status, type }) {
  const conditions = [];
  const values = [];
  const addCondition = (sql, value) => {
    values.push(value);
    conditions.push(sql.replace('?', `$${values.length}`));
  };

  if (category) addCondition('r.category = ?', category);
  if (location) addCondition('r.location ILIKE ?', `%${location}%`);
  if (status) addCondition('r.status = ?', status);
  if (type) addCondition('r.type = ?', type);
  if (q) {
    const search = `%${q}%`;
    values.push(search, search, search, search);
    const start = values.length - 3;
    conditions.push(`(r.title ILIKE $${start} OR r.description ILIKE $${start + 1} OR r.location ILIKE $${start + 2} OR r.category ILIKE $${start + 3})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT ${qualifiedReportColumns}, u.name AS poster_name
     FROM reports r JOIN users u ON u.id = r.posted_by
     ${where}
     ORDER BY r.created_at DESC LIMIT 200`,
    values
  );
  return rows.map(mapReport);
}

export async function findReportById(id, includeContact = false) {
  const posterColumns = includeContact
    ? 'u.name AS poster_name, u.email AS poster_email, u.phone AS poster_phone'
    : 'u.name AS poster_name';
  const { rows } = await pool.query(
    `SELECT ${qualifiedReportColumns}, ${posterColumns}
     FROM reports r JOIN users u ON u.id = r.posted_by
     WHERE r.id = $1`,
    [id]
  );
  return mapReport(rows[0]);
}

export async function createReport(data) {
  const values = [
    data.title.trim(), data.type, data.category.trim(), data.description.trim(),
    data.location.trim(), data.date, data.status || data.type, data.imageUrl || '',
    data.imagePublicId || '', data.contactName, data.contactEmail, data.contactPhone || '',
    data.postedBy
  ];
  const { rows } = await pool.query(
    `INSERT INTO reports (
       title, type, category, description, location, date, status, image_url,
       image_public_id, contact_name, contact_email, contact_phone, posted_by
     ) VALUES (${values.map((_, index) => `$${index + 1}`).join(', ')})
     RETURNING ${reportColumns}`,
    values
  );
  return rows[0];
}

export async function updateReport(id, data) {
  const columns = {
    title: 'title',
    type: 'type',
    category: 'category',
    description: 'description',
    location: 'location',
    date: 'date',
    status: 'status',
    imageUrl: 'image_url',
    imagePublicId: 'image_public_id'
  };
  const values = [];
  const assignments = [];

  for (const [key, column] of Object.entries(columns)) {
    if (data[key] === undefined) continue;
    values.push(typeof data[key] === 'string' && ['title', 'category', 'description', 'location'].includes(key) ? data[key].trim() : data[key]);
    assignments.push(`${column} = $${values.length}`);
  }
  assignments.push('updated_at = now()');
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE reports SET ${assignments.join(', ')} WHERE id = $${values.length}
     RETURNING ${reportColumns}`,
    values
  );
  return rows[0] || null;
}

export async function deleteReportById(id) {
  const { rows } = await pool.query(
    `DELETE FROM reports WHERE id = $1 RETURNING ${reportColumns}`,
    [id]
  );
  return rows[0] || null;
}

export async function listReportsByUser(userId) {
  const { rows } = await pool.query(
    `SELECT ${reportColumns} FROM reports WHERE posted_by = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

export async function countReportsByStatus(status) {
  const { rows } = await pool.query(
    `SELECT count(*)::int AS count FROM reports${status ? ' WHERE status = $1' : ''}`,
    status ? [status] : []
  );
  return rows[0].count;
}
