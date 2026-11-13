export function notFound(req, res) { res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }); }
export function errorHandler(err, req, res, next) {
  console.error(err);
  const duplicateKey = err.code === 11000 || err.code === '23505';
  const status = err.status || (err.name === 'ValidationError' ? 400 : duplicateKey ? 409 : 500);
  res.status(status).json({ message: duplicateKey ? 'An account with this email already exists.' : err.message || 'Server error' });
}
