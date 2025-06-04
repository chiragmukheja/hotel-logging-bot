const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createRequest = async (req, res) => {
  const { guestPhone, requestText } = req.body;
  try {
    const request = await prisma.request.create({
      data: { guestPhone, requestText },
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: 'Error creating request', details: err });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const pending = await prisma.request.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching requests', details: err });
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
  } catch (err) {
    res.status(500).json({ error: 'Error updating request', details: err });
  }
};
