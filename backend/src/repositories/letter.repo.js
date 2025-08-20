const prisma = require('../config/prisma');

const create = (data) => prisma.letter.create({ data });
const findByMailbox = (mailboxId, take=50, skip=0) =>
  prisma.letter.findMany({ where:{ mailboxId:Number(mailboxId) }, orderBy:{ createdAt:'desc' }, take, skip });
const findByIdWithMailbox = (id) =>
  prisma.letter.findUnique({ where:{ id:Number(id) }, include:{ mailbox:true }});

module.exports = { create, findByMailbox, findByIdWithMailbox };
