const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createRequest = async (req, res) => {
  const { telegramId, requestText } = req.body;
  try {
    const request = await prisma.request.create({
      data: { telegramId, requestText },
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

exports.checkinGuest = async (req, res) => {
  const { telegramId, roomNumber } = req.body;

  if (!telegramId || !roomNumber) {
    return res.status(400).json({ error: "telegramId and roomNumber are required" });
  }

  try {
    const guest = await prisma.guest.upsert({
      where: { telegramId },
      update: { roomNumber },
      create: {
        telegramId,
        roomNumber,
      },
    });

    return res.status(200).json({ message: "Check-in successful", guest });
  } catch (error) {
    console.error("Check-in error:", error);
    return res.status(500).json({ error: "Check-in failed" });
  }
};
