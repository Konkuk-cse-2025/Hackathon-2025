<<<<<<< HEAD
function errorHandler(err, req, res, _next){
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal Error' });
}
module.exports = { errorHandler };
=======
// src/middlewares/errorHandler.js
module.exports = function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (status >= 500) console.error('🔥', err);
  res.status(status).json({ error: message });
};
>>>>>>> 2eacb83 (엔드포인트 DB 수정)
