const express = require('express');
const app = express();

app.get('/', (_req, res) => res.send('OK'));

module.exports = app;