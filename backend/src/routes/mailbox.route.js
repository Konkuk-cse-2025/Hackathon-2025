const r = require('express').Router();
const c = require('../controllers/mailbox.controller');
r.get('/', c.list);
r.post('/', c.create);
r.post('/:id/gate', c.gate);
module.exports = r;
