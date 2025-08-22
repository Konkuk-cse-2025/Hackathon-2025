// src/utils/validate.js
function validatePassword(password) {
  return /^(?=.*\d).{8,}$/.test(password);
}
module.exports = { validatePassword };
