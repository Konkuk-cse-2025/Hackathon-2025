// src/middlewares/errorHandler.js
module.exports = function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (status >= 500) console.error('🔥 Error:', err);
  res.status(status).json({ message });
};

