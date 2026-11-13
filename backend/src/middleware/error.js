export function notFound(req, res) { res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }); }
export function errorHandler(err, req, res, next) {
  const duplicateKey = err.code === 11000;
  const isProduction = process.env.NODE_ENV === 'production';
  const status = err.status
    || (err.name === 'ValidationError' || err.name === 'CastError' ? 400
      : duplicateKey ? 409
        : err.type === 'entity.parse.failed' ? 400
          : err.code === 'LIMIT_FILE_SIZE' ? 413 : 500);

  if (status >= 500) {
    if (isProduction) {
      console.error(JSON.stringify({ level: 'error', method: req.method, path: req.path, status, error: err.name || 'Error' }));
    } else {
      console.error('CampusFind request failed:', err);
    }
  } else if (isProduction) {
    console.warn(JSON.stringify({ level: 'warn', method: req.method, path: req.path, status, error: err.name || 'RequestError' }));
  } else {
    console.warn('CampusFind request rejected:', err.message);
  }

  const message = duplicateKey
    ? 'An account with this email already exists.'
    : status >= 500 && isProduction
      ? 'An unexpected server error occurred.'
      : err.message || 'Server error';
  res.status(status).json({ message });
}
