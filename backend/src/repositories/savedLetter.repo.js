// backend/src/repositories/savedLetter.repo.js
const prisma = require('../../prisma/client');

const upsert = async ({ userId, letterId }) => {
  // 이미 저장되어 있으면 update 없이 그대로, 없으면 create
  return prisma.savedLetter.upsert({
    where: { userId_letterId_unique: { userId, letterId } },
    update: {},
    create: { userId, letterId },
    include: { letter: true },
  });
};

const remove = async ({ userId, letterId }) => {
  return prisma.savedLetter.delete({
    where: { userId_letterId_unique: { userId, letterId } },
  });
};

const exists = async ({ userId, letterId }) => {
  const found = await prisma.savedLetter.findUnique({
    where: { userId_letterId_unique: { userId, letterId } },
    select: { id: true },
  });
  return !!found;
};

module.exports = { upsert, remove, exists };
