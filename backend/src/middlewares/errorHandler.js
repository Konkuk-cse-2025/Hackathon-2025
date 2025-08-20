function errorHandler(err, req, res, _next){
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal Error' });
}
module.exports = { errorHandler };
