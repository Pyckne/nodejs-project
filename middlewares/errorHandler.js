module.exports = (err, req, res, next) => {
  console.error('🔥 Error capturado por el middleware:', err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    error: err.name || 'UnhandledException',
    cause: err.cause || 'Unknown'
  });
};