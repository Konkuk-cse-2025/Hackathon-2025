const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

function sign(payload, opt={}) {
  return new Promise((resolve, reject) =>
    jwt.sign(payload, SECRET, { expiresIn: '10m', ...opt }, (e, t) => e ? reject(e) : resolve(t))
  );
}
function verify(token) {
  return new Promise((resolve, reject) =>
    jwt.verify(token, SECRET, (e, p) => e ? reject(e) : resolve(p))
  );
}
module.exports = { sign, verify };
