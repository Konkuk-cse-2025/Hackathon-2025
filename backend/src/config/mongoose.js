const mongoose = require('mongoose');

async function connectMongo(uri) {
  if (!uri) throw new Error('MONGODB_URI is missing');
  await mongoose.connect(uri);
  const { host, name } = mongoose.connection;
  console.log(`[mongo] connected to ${host}/${name}`); // ★ 현재 DB명 확인
}
module.exports = connectMongo;
