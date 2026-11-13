import User from '../models/User.js';
import Report from '../models/Report.js';
export async function overview(req, res) {
  const [users, reports, lost, found, returned] = await Promise.all([
    User.countDocuments(),
    Report.countDocuments(),
    Report.countDocuments({ status: 'Lost' }),
    Report.countDocuments({ status: 'Found' }),
    Report.countDocuments({ status: 'Returned' })
  ]);
  res.json({ stats: { users, reports, lost, found, returned } });
}

export async function usersList(req, res) {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ users });
}

export async function deleteUser(req, res) {
  if (req.params.id === String(req.user._id)) return res.status(400).json({ message: 'You cannot delete your own admin account.' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  await Report.deleteMany({ postedBy: user._id });
  await user.deleteOne();
  res.json({ message: 'User and their reports deleted.' });
}
