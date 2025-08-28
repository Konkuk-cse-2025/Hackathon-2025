const r = require('express').Router();
r.use('/mailboxes', require('./mailbox.route'));
r.use('/letters', require('./letter.route'));
module.exports = r;
