import { countReportsByStatus } from '../models/Report.js';
import { countUsers, deleteUserById, listUsers } from '../models/User.js';
export async function overview(req, res) {
  const [users, reports, lost, found, returned] = await Promise.all([
    countUsers(), countReportsByStatus(), countReportsByStatus('Lost'),
    countReportsByStatus('Found'), countReportsByStatus('Returned')
  ]);
  res.json({ stats: { users, reports, lost, found, returned } });
}
export async function usersList(req, res) { const users = await listUsers(); res.json({ users }); }
export async function deleteUser(req, res) {
  if (req.params.id === String(req.user._id)) return res.status(400).json({ message: 'You cannot delete your own admin account.' });
  const user = await deleteUserById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' }); res.json({ message: 'User and their reports deleted.' });
}
