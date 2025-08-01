const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ========================
// GUEST-INITIATED ACTIONS 
// ========================

exports.checkinGuest = async (req, res) => {
  const { telegramId, roomNumber, name } = req.body;
  if (!telegramId || !roomNumber) {
    return res.status(400).json({ error: "telegramId and roomNumber are required" });
  }
  const trimmedRoomNumber = roomNumber.trim();

  try {
    const guest = await prisma.guest.upsert({
      where: { telegramId },
      update: { name: name || undefined },
      create: { telegramId, name: name || undefined },
    });

    const roomOccupiedByOther = await prisma.stay.findFirst({
      where: { roomNumber: trimmedRoomNumber, status: 'ACTIVE', guestId: { not: guest.id } },
    });
    if (roomOccupiedByOther) {
      return res.status(409).json({ message: `Error: Room ${trimmedRoomNumber} is currently occupied.` });
    }

    const alreadyInThisRoom = await prisma.stay.findFirst({
      where: { guestId: guest.id, roomNumber: trimmedRoomNumber, status: 'ACTIVE' },
    });
    if (alreadyInThisRoom) {
      return res.status(200).json({ message: `You are already checked in to Room ${trimmedRoomNumber}.`, stay: alreadyInThisRoom });
    }

    await prisma.stay.updateMany({
      where: { guestId: guest.id, status: 'ACTIVE' },
      data: { status: 'INACTIVE' },
    });

    const newStay = await prisma.stay.create({
      data: { guestId: guest.id, roomNumber: trimmedRoomNumber, status: 'ACTIVE' },
    });

    return res.status(201).json({ message: "Check-in successful", stay: newStay });
  } catch (error) {
    console.error("Check-in error:", error);
    return res.status(500).json({ error: "Check-in failed" });
  }
};

exports.createRequest = async (req, res) => {
  const { telegramId, requestText } = req.body;
  if (!telegramId || !requestText) {
    return res.status(400).json({ error: "telegramId and requestText are required" });
  }

  try {
    const activeStay = await prisma.stay.findFirst({
      where: { guest: { telegramId }, status: 'ACTIVE' },
      include: { guest: true }
    });
    if (!activeStay) {
      return res.status(404).json({ error: "Guest not checked in with an active stay." });
    }

    const request = await prisma.request.create({
      data: { stayId: activeStay.id, requestText },
      include: { stay: { include: { guest: true } } },
    });
    if (req.app.get("io")) {
      req.app.get("io").emit("new-request", request);
    }
    res.status(201).json(request);
  } catch (error) {
    console.error("Request creation error:", error);
    res.status(500).json({ error: "Failed to create request" });
  }
};

exports.checkoutGuest = async (req, res) => {
  const { telegramId } = req.body;
  if (!telegramId) {
    return res.status(400).json({ error: "telegramId is required" });
  }

  try {
    const guest = await prisma.guest.findUnique({ where: { telegramId } });
    if (!guest) {
      return res.status(404).json({ error: "Guest not found." });
    }
    const updatedStays = await prisma.stay.updateMany({
      where: { guestId: guest.id, status: 'ACTIVE' },
      data: { status: 'INACTIVE' },
    });
    if (updatedStays.count === 0) {
      return res.status(200).json({ message: "No active check-in found." });
    }
    return res.status(200).json({ message: "Checkout successful. Thank you for your stay!" });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ error: "Checkout failed" });
  }
};


// ========================
// ADMIN-INITIATED ACTIONS 
// ========================

exports.adminCheckoutStay = async (req, res) => {
    const { stayId } = req.params;
    try {
        const updatedStay = await prisma.stay.update({
            where: { id: stayId },
            data: { status: 'INACTIVE' },
        });
        res.status(200).json({ message: `Stay for room ${updatedStay.roomNumber} has been checked out.`, stay: updatedStay });
    } catch (error) {
        console.error("Admin checkout error:", error);
        res.status(500).json({ error: 'Admin checkout failed' });
    }
};

exports.adminTransferStay = async (req, res) => {
    const { stayId } = req.params;
    const { newRoomNumber } = req.body;

    if (!newRoomNumber) {
        return res.status(400).json({ error: 'New room number is required.' });
    }

    try {
        const originalStay = await prisma.stay.findUnique({ where: { id: stayId } });
        if (!originalStay) {
            return res.status(404).json({ error: 'Original stay not found.' });
        }

        const roomOccupiedByOther = await prisma.stay.findFirst({
            where: { roomNumber: newRoomNumber, status: 'ACTIVE', guestId: { not: originalStay.guestId } }
        });
        if (roomOccupiedByOther) {
            return res.status(409).json({ message: `Error: Room ${newRoomNumber} is currently occupied.` });
        }

        const pendingRequests = await prisma.request.findMany({
            where: { stayId: originalStay.id, status: 'pending' },
        });

        const newStay = await prisma.stay.create({
            data: { guestId: originalStay.guestId, roomNumber: newRoomNumber, status: 'ACTIVE' },
        });

        if (pendingRequests.length > 0) {
            await prisma.request.updateMany({
                where: { id: { in: pendingRequests.map(r => r.id) } },
                data: { stayId: newStay.id },
            });
        }
        
        await prisma.stay.update({
            where: { id: originalStay.id },
            data: { status: 'INACTIVE' },
        });

        res.status(200).json({ message: 'Transfer successful.', newStay });

    } catch (error) {
        console.error("Admin transfer error:", error);
        res.status(500).json({ error: 'Admin transfer failed' });
    }
};


exports.getRoomsWithPendingCount = async (req, res) => {
  try {
    const stays = await prisma.stay.findMany({
      where: {
        status: 'ACTIVE', // Also only show active stays on the dashboard
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
      status: stay.status // Include status in details
    });
  } catch (err) {
    console.error("Error fetching room details:", err);
    res.status(500).json({ error: 'Failed to fetch room details' });
  }
};

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

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await prisma.request.findMany({
      where: { stay: { status: 'ACTIVE' } }, // Only show requests from active stays
      orderBy: { createdAt: 'desc' },
      include: {
        stay: {
          select: { roomNumber: true, guest: { select: { name: true } } },
        },
      },
    });
    res.status(200).json(requests);
  } catch (error) {
    console.error("Failed to get all requests:", error);
    res.status(500).json({ error: "Failed to retrieve requests" });
  }
};