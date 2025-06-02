const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createRequestService = async (guestPhone, requestText) => {
  return await prisma.request.create({
    data: {
      guestPhone,
      requestText
    }
  });
};

const getAllPendingRequestsService = async () => {
  return await prisma.request.findMany({
    where: {
      status: 'pending'
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

module.exports = {
  createRequestService,
  getAllPendingRequestsService
};
