// Central JSON error handler returning friendly user-facing messages.

export function errorHandler(err, req, res, next) {
  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const message = err.message || 'An unexpected error occurred. Please try again.';

  res.status(statusCode).json({
    error: message
  });
}
