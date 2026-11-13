import { cloudinary, configured } from '../config/cloudinary.js';
import Report from '../models/Report.js';
const fields = ['title','type','category','description','location','date'];
function payload(body) { const out = {}; for (const key of fields) if (body[key] !== undefined) out[key] = body[key]; return out; }
function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
async function uploadImage(file) {
  if (!file) return {};
  if (!configured) throw Object.assign(new Error('Image upload is not configured. Add Cloudinary credentials to the backend environment.'), { status: 503 });
  const result = await new Promise((resolve, reject) => { const stream = cloudinary.uploader.upload_stream({ folder: 'campusfind' }, (err, data) => err ? reject(err) : resolve(data)); stream.end(file.buffer); });
  return { imageUrl: result.secure_url, imagePublicId: result.public_id };
}
export async function listReports(req, res) {
  const { q, category, location, status, type } = req.query;
  const filter = {};
  if (typeof category === 'string' && category) filter.category = category;
  if (typeof location === 'string' && location) filter.location = { $regex: escapeRegex(location), $options: 'i' };
  if (typeof status === 'string' && status) filter.status = status;
  if (typeof type === 'string' && type) filter.type = type;
  if (typeof q === 'string' && q.trim()) {
    const search = { $regex: escapeRegex(q.trim()), $options: 'i' };
    filter.$or = ['title', 'description', 'location', 'category'].map(field => ({ [field]: search }));
  }
  const reports = await Report.find(filter)
    .populate('postedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(200);
  res.json({ reports });
}

export async function getReport(req, res) {
  const report = await Report.findById(req.params.id).populate('postedBy', 'name email phone');
  if (!report) return res.status(404).json({ message: 'Report not found.' });
  res.json({ report });
}

export async function createReport(req, res) {
  const data = payload(req.body);
  for (const key of fields) if (!data[key]) return res.status(400).json({ message: `${key} is required.` });
  const image = await uploadImage(req.file);
  const report = await Report.create({
    ...data,
    ...image,
    status: data.type,
    contactName: req.user.name,
    contactEmail: req.user.email,
    contactPhone: req.user.phone || '',
    postedBy: req.user._id
  });
  res.status(201).json({ report });
}

export async function updateReport(req, res) {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found.' });
  if (String(report.postedBy) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'You can only edit your own reports.' });
  Object.assign(report, payload(req.body));
  if (req.body.type && !req.body.status) report.status = req.body.type;
  if (req.file) Object.assign(report, await uploadImage(req.file));
  await report.save();
  res.json({ report });
}

export async function deleteReport(req, res) {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found.' });
  if (String(report.postedBy) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'You can only delete your own reports.' });
  if (report.imagePublicId && configured) await cloudinary.uploader.destroy(report.imagePublicId);
  await report.deleteOne();
  res.json({ message: 'Report deleted.' });
}

export async function markReturned(req, res) {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found.' });
  if (String(report.postedBy) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ message: 'Only the owner of this report can update its status.' });
  report.status = 'Returned';
  await report.save();
  res.json({ report });
}

export async function myReports(req, res) {
  const reports = await Report.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
  res.json({ reports });
}
