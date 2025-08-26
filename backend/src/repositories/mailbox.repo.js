<<<<<<< HEAD
// backend/src/repositories/mailbox.repo.js
const prisma = require('../prisma/client'); // ✅ 올바른 경로
=======
// src/repositories/mailbox.repo.js
const prisma = require("../config/prisma");
>>>>>>> origin/main

async function create({ ownerId, name, type, lat, lng, hint, passwordHash }) {
  const data = {
    name,
    type, // 'OPEN' | 'SECRET' 정확히 일치해야 함 (enum)
    lat,
    lng,
    hint,
    passwordHash,
  };

  // ownerId가 있으면 관계로 연결 (FK 자동검증)
  if (ownerId) {
    data.owner = { connect: { id: ownerId } }; // 여기! 숫자 변환 절대 X
  }
  return prisma.mailbox.create({
<<<<<<< HEAD
    data: { ownerId, name, type, lat, lng, hint, passwordHash },
    select: { id: true, ownerId: true, name: true, type: true, lat: true, lng: true, createdAt: true }
=======
    data,
    select: {
      id: true,
      name: true,
      type: true,
      lat: true,
      lng: true,
      createdAt: true,
    },
>>>>>>> origin/main
  });
}

// bounds: { minLat, maxLat, minLng, maxLng }
async function findInBounds(bounds) {
  return prisma.mailbox.findMany({
    where: {
      lat: { gte: bounds.minLat, lte: bounds.maxLat },
      lng: { gte: bounds.minLng, lte: bounds.maxLng },
    },
<<<<<<< HEAD
    orderBy: { createdAt: 'desc' },
    select: { id: true, ownerId: true, name: true, type: true, lat: true, lng: true, createdAt: true }
=======
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      type: true,
      lat: true,
      lng: true,
      createdAt: true,
    },
>>>>>>> origin/main
  });
}

async function findById(id) {
  return prisma.mailbox.findUnique({
    where: { id: Number(id) },
<<<<<<< HEAD
    select: { id: true, ownerId: true, name: true, type: true, lat: true, lng: true, passwordHash: true, createdAt: true }
=======
    select: {
      id: true,
      name: true,
      type: true,
      lat: true,
      lng: true,
      passwordHash: true,
      createdAt: true,
    },
>>>>>>> origin/main
  });
}

module.exports = { create, findInBounds, findById };
