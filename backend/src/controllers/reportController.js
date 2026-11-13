import { cloudinary, configured } from '../config/cloudinary.js';
import {
  createReport as insertReport,
  deleteReportById,
  findReportById,
  listReports as queryReports,
  listReportsByUser,
  updateReport as updateReportRecord
} from '../models/Report.js';
const fields = ['title','type','category','description','location','date'];
function payload(body) { const out = {}; for (const key of fields) if (body[key] !== undefined) out[key] = body[key]; return out; }
async function uploadImage(file) {
  if (!file) return {};
  if (!configured) throw Object.assign(new Error('Image upload is not configured. Add Cloudinary credentials to backend/.env.'), { status: 503 });
  const result = await new Promise((resolve, reject) => { const stream = cloudinary.uploader.upload_stream({ folder: 'campusfind' }, (err, data) => err ? reject(err) : resolve(data)); stream.end(file.buffer); });
  return { imageUrl: result.secure_url, imagePublicId: result.public_id };
}
export async function listReports(req, res) {
  const { q, category, location, status, type } = req.query;
  const reports = await queryReports({ q, category, location, status, type });
  res.json({ reports });
}
export async function getReport(req, res) {
  const report = await findReportById(req.params.id, true);
  if (!report) return res.status(404).json({ message: 'Report not found.' });
  res.json({ report });
}
export async function createReport(req, res) {
  const data = payload(req.body);
  for (const key of fields) if (!data[key]) return res.status(400).json({ message: `${key} is required.` });
  const image = await uploadImage(req.file);
  const report = await insertReport({ ...data, ...image, status: data.type, contactName: req.user.name, contactEmail: req.user.email, contactPhone: req.user.phone || '', postedBy: req.user._id });
  res.status(201).json({ report });
}
export async function updateReport(req, res) {
  const report = await findReportById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found.' });
  if (String(report.postedBy) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'You can only edit your own reports.' });
  const data = payload(req.body);
  if (req.body.type && !req.body.status) data.status = req.body.type;
  if (req.file) Object.assign(data, await uploadImage(req.file));
  const updatedReport = await updateReportRecord(req.params.id, data);
  res.json({ report: updatedReport });
}
export async function deleteReport(req, res) {
  const report = await findReportById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found.' });
  if (String(report.postedBy) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'You can only delete your own reports.' });
  if (report.imagePublicId && configured) await cloudinary.uploader.destroy(report.imagePublicId).catch(() => {});
  await deleteReportById(req.params.id); res.json({ message: 'Report deleted.' });
}
export async function markReturned(req, res) {
  const report = await findReportById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found.' });
  if (String(report.postedBy) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Only the owner of this report can update its status.' });
  const updatedReport = await updateReportRecord(req.params.id, { status: 'Returned' });
  res.json({ report: updatedReport });
}
export async function myReports(req, res) { const reports = await listReportsByUser(req.user._id); res.json({ reports }); }
