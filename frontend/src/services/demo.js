const STORAGE_KEY = 'campusfind_demo_reports';

const initialReports = [
  {
    _id: 'demo-1',
    title: 'Black wireless headphones',
    type: 'Lost',
    status: 'Lost',
    category: 'Electronics',
    description: 'Black over-ear headphones with a small blue sticker on the case.',
    location: 'Central Library, 2nd floor',
    date: '2026-11-10',
    contactName: 'Aarav Mehta',
    contactEmail: 'aarav@example.com',
    contactPhone: '',
    postedBy: 'demo-aarav'
  },
  {
    _id: 'demo-2',
    title: 'Student ID card',
    type: 'Found',
    status: 'Found',
    category: 'ID Cards',
    description: 'University ID card found near the north entrance after the afternoon lecture.',
    location: 'Science Block, north entrance',
    date: '2026-11-09',
    contactName: 'Priya Sharma',
    contactEmail: 'priya@example.com',
    contactPhone: '',
    postedBy: 'demo-priya'
  },
  {
    _id: 'demo-3',
    title: 'Set of silver keys',
    type: 'Found',
    status: 'Found',
    category: 'Keys',
    description: 'Three silver keys on a blue fabric keyring, found beside the cafeteria.',
    location: 'Main Cafeteria',
    date: '2026-11-08',
    contactName: 'Kabir Singh',
    contactEmail: 'kabir@example.com',
    contactPhone: '',
    postedBy: 'demo-kabir'
  },
  {
    _id: 'demo-4',
    title: 'Green canvas backpack',
    type: 'Lost',
    status: 'Lost',
    category: 'Bags',
    description: 'Olive green backpack with a notebook and a silver water bottle inside.',
    location: 'Sports Complex',
    date: '2026-11-07',
    contactName: 'Neha Kapoor',
    contactEmail: 'neha@example.com',
    contactPhone: '',
    postedBy: 'demo-neha'
  },
  {
    _id: 'demo-5',
    title: 'Calculus notebook',
    type: 'Found',
    status: 'Returned',
    category: 'Books',
    description: 'Blue calculus notebook with handwritten notes and the name Rohan on the first page.',
    location: 'Engineering Block, room 204',
    date: '2026-11-05',
    contactName: 'Campus Help Desk',
    contactEmail: 'helpdesk@example.com',
    contactPhone: '',
    postedBy: 'demo-helpdesk'
  },
  {
    _id: 'demo-6',
    title: 'Steel water bottle',
    type: 'Lost',
    status: 'Lost',
    category: 'Water Bottles',
    description: 'Matte steel bottle with a yellow CampusFest sticker near the cap.',
    location: 'Auditorium lobby',
    date: '2026-11-04',
    contactName: 'Ishita Rao',
    contactEmail: 'ishita@example.com',
    contactPhone: '',
    postedBy: 'demo-ishita'
  }
];

function cloneReports(reports) {
  return reports.map(report => ({ ...report }));
}

function readReports() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : cloneReports(initialReports);
  } catch {
    return cloneReports(initialReports);
  }
}

function writeReports(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  return cloneReports(reports);
}

export function isDemoToken(token) {
  return typeof token === 'string' && token.startsWith('demo-');
}

export function demoAuth(form, register) {
  const name = register ? form.name.trim() : 'Demo Student';
  const email = form.email.trim().toLowerCase() || 'demo@campusfind.test';
  return {
    token: 'demo-campusfind-token',
    user: {
      id: 'demo-user',
      name,
      email,
      phone: form.phone?.trim() || '',
      role: 'student',
      demo: true
    }
  };
}

export function demoListReports({ q = '', category = '', status = '' } = {}) {
  const query = q.trim().toLowerCase();
  return readReports().filter(report => {
    const searchable = `${report.title} ${report.description} ${report.location} ${report.category}`.toLowerCase();
    return (!query || searchable.includes(query))
      && (!category || report.category === category)
      && (!status || report.status === status);
  });
}

export function demoGetReport(id) {
  return readReports().find(report => report._id === id) || null;
}

export function demoMineReports(userId = 'demo-user') {
  return readReports().filter(report => report.postedBy === userId);
}

export function demoCreateReport(form, user) {
  const report = {
    _id: `demo-${Date.now()}`,
    ...form,
    status: form.type,
    date: form.date || new Date().toISOString().slice(0, 10),
    contactName: user.name,
    contactEmail: user.email,
    contactPhone: user.phone || '',
    postedBy: user.id
  };
  writeReports([report, ...readReports()]);
  return report;
}

export function demoUpdateReport(id, form) {
  const reports = readReports().map(report => report._id === id
    ? { ...report, ...form, status: form.type || report.status }
    : report);
  writeReports(reports);
  return reports.find(report => report._id === id) || null;
}

export function demoMarkReturned(id) {
  const reports = readReports().map(report => report._id === id ? { ...report, status: 'Returned' } : report);
  writeReports(reports);
  return reports.find(report => report._id === id) || null;
}

export function demoDeleteReport(id) {
  writeReports(readReports().filter(report => report._id !== id));
}
