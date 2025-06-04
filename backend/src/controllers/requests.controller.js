const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createRequest = async (req, res) => {
  const { guestPhone, requestText } = req.body;

  if (!guestPhone || !requestText) {
    return res.status(400).json({ error: 'Missing guestPhone or requestText' });
  }

  try {
    const newRequest = await prisma.request.create({
      data: {
        guestPhone,
        requestText,
        status: 'PENDING',
      },
    });
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Create Request Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPendingRequests = async (_req, res) => {
  try {
    const requests = await prisma.request.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (error) {
    console.error('Get Requests Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.markRequestAsCompleted = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await prisma.request.update({
      where: { id: parseInt(id) },
      data: { status: 'COMPLETED' },
    });
    res.json(updated);
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ error: 'Could not update request' });
  }
};