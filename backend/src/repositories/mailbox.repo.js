// backend/src/repositories/mailbox.repo.js
const prisma = require('../prisma/client'); // ✅ 올바른 경로

async function create({ ownerId, name, type, lat, lng, hint, passwordHash }) {
  return prisma.mailbox.create({
    data: { ownerId, name, type, lat, lng, hint, passwordHash },
    select: { id: true, ownerId: true, name: true, type: true, lat: true, lng: true, createdAt: true }
  });
}

// bounds: { minLat, maxLat, minLng, maxLng }
async function findInBounds(bounds) {
  return prisma.mailbox.findMany({
    where: {
      lat: { gte: bounds.minLat, lte: bounds.maxLat },
      lng: { gte: bounds.minLng, lte: bounds.maxLng },
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, ownerId: true, name: true, type: true, lat: true, lng: true, createdAt: true }
  });
}

async function findById(id) {
  return prisma.mailbox.findUnique({
    where: { id: Number(id) },
    select: { id: true, ownerId: true, name: true, type: true, lat: true, lng: true, passwordHash: true, createdAt: true }
  });
}

module.exports = { create, findInBounds, findById };
