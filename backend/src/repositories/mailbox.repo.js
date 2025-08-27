// src/repositories/mailbox.repo.js
const prisma = require("../config/prisma");

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
    data,
    select: {
      id: true,
      name: true,
      type: true,
      lat: true,
      lng: true,
      createdAt: true,
    },
  });
}

// bounds: { minLat, maxLat, minLng, maxLng }
async function findInBounds(bounds) {
  return prisma.mailbox.findMany({
    where: {
      lat: { gte: bounds.minLat, lte: bounds.maxLat },
      lng: { gte: bounds.minLng, lte: bounds.maxLng },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      type: true,
      lat: true,
      lng: true,
      createdAt: true,
    },
  });
}

async function findById(id) {
  if (!id || !Number.isFinite(Number(id))) {
    throw new Error("유효하지 않은 ID가 전달되었습니다."); // id 유효성 검사 추가
  }

  return prisma.mailbox.findUnique({
    where: {
      id: Number(id), // id를 Int로 변환
    },
    select: {
      id: true,
      name: true,
      type: true,
      lat: true,
      lng: true,
      passwordHash: true,
      createdAt: true,
    },
  });
}

module.exports = { create, findInBounds, findById };
