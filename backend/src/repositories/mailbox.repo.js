const prisma = require('../config/prisma');

const create = (data) => prisma.mailbox.create({ data });
const findById = (id) => prisma.mailbox.findUnique({ where: { id: Number(id) } });
const findInBounds = ({minLat,maxLat,minLng,maxLng}) =>
  prisma.mailbox.findMany({ where: { lat:{gte:minLat,lte:maxLat}, lng:{gte:minLng,lte:maxLng} } });

module.exports = { create, findById, findInBounds };
