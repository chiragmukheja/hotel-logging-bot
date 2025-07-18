const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log("✅ requests.controller.js loaded");
// Guest check-in: creates a new Stay per visit
exports.checkinGuest = async (req, res) => {
  const { telegramId, roomNumber, name } = req.body;

  if (!telegramId || !roomNumber) {
    return res.status(400).json({ error: "telegramId and roomNumber are required" });
  }

  try {
    let guest = await prisma.guest.findUnique({ where: { telegramId } });

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          telegramId,
          name: name || undefined,
        },
      });
    }

    const stay = await prisma.stay.create({
      data: {
        guestId: guest.id,
        roomNumber: roomNumber.trim(),
      },
    });

    return res.status(200).json({ message: "Check-in successful", stay });
  } catch (error) {
    console.error("Check-in error:", error);
    return res.status(500).json({ error: "Check-in failed" });
  }
};

// Create request under current active stay
exports.createRequest = async (req, res) => {
  const { telegramId, requestText } = req.body;

  if (!telegramId || !requestText) {
    return res.status(400).json({ error: "telegramId and requestText are required" });
  }

  try {
    const guest = await prisma.guest.findUnique({
      where: { telegramId },
      include: {
        stays: {
          orderBy: { checkedInAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!guest || guest.stays.length === 0) {
      return res.status(404).json({ error: "Guest not checked in." });
    }

    const currentStay = guest.stays[0];

    const request = await prisma.request.create({
      data: {
        stayId: currentStay.id,
        requestText,
      },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error("Request creation error:", error);
    res.status(500).json({ error: "Failed to create request" });
  }
};

// Fetch rooms with pending request count
exports.getRoomsWithPendingCount = async (req, res) => {
  try {
    const stays = await prisma.stay.findMany({
      where: {
        requests: {
          some: { status: 'pending' },
        },
      },
      select: {
        id: true,
        roomNumber: true,
        _count: {
          select: {
            requests: {
              where: { status: 'pending' },
            },
          },
        },
      },
      orderBy: { roomNumber: 'asc' },
    });

    res.json(stays);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

// Get details of room (i.e., stay)
exports.getRoomDetails = async (req, res) => {
  const { stayId } = req.params;

  try {
    const stay = await prisma.stay.findUnique({
      where: { id: stayId },
      include: {
        guest: true,
        requests: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!stay) {
      return res.status(404).json({ error: "Stay not found." });
    }

    res.json({
      stayId: stay.id,
      roomNumber: stay.roomNumber,
      checkInAt: stay.checkedInAt,
      name: stay.guest.name || null,
      telegramId: stay.guest.telegramId,
      requests: stay.requests,
    });
  } catch (err) {
    console.error("Error fetching room details:", err);
    res.status(500).json({ error: 'Failed to fetch room details' });
  }
};

// Update name
exports.updateGuestName = async (req, res) => {
  const { telegramId } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const guest = await prisma.guest.update({
      where: { telegramId },
      data: { name },
    });

    res.json({ message: "Name updated", guest });
  } catch (err) {
    console.error("Error updating guest name", err);
    res.status(500).json({ error: "Failed to update name" });
  }
};

// Mark request as complete
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
