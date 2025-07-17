const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createRequest = async (req, res) => {
  const { telegramId, requestText } = req.body;

  if (!telegramId || !requestText) {
    return res.status(400).json({ error: "telegramId and requestText are required" });
  }

  try {
    const guest = await prisma.guest.findUnique({
      where: { telegramId },
    });

    if (!guest) {
      return res.status(404).json({ error: "Guest not found. Please check in first." });
    }

    const request = await prisma.request.create({
      data: {
        guestId: guest.id,
        requestText,
      },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error("Request creation error:", error);
    res.status(500).json({ error: "Failed to create request" });
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

exports.getRoomsWithPendingCount = async (req, res) => {
  try {
    const rooms = await prisma.guest.findMany({
      where: {
        requests: {
          some: {
            status: 'pending',
          },
        },
      },
      select: {
        roomNumber: true,
        _count: {
          select: {
            requests: {
              where: {
                status: 'pending',
              },
            },
          },
        },
      },
      orderBy: {
        roomNumber: 'asc',
      },
    });

    res.json(rooms);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ error: 'Failed to fetch rooms with pending requests' });
  }
};

exports.getRoomDetails = async (req, res) => {
  const { roomNumber } = req.params;

  try {
    const guest = await prisma.guest.findFirst({
      where: { roomNumber },
      include: {
        requests: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!guest) {
      return res.status(404).json({ error: "No guest found in this room" });
    }

    res.json({
      roomNumber: guest.roomNumber,
      name: guest.name || null,
      telegramId: guest.telegramId,
      checkInAt: guest.checkInAt,
      requests: guest.requests,
    });
  } catch (err) {
    console.error("Error fetching room details:", err);
    res.status(500).json({ error: 'Failed to fetch room details' });
  }
};
