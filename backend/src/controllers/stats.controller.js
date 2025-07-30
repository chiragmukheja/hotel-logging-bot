const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.getDashboardStats = async (req, res) => {
  let highestPriorityRoom = 'N/A';

  try {
    // We only need to calculate the highest priority room now
    const oldestPendingRequest = await prisma.request.findFirst({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      include: { stay: { select: { roomNumber: true } } },
    });

    if (oldestPendingRequest?.stay?.roomNumber) {
      highestPriorityRoom = oldestPendingRequest.stay.roomNumber;
    }
    
    // Always succeed, returning only the data we can calculate
    res.status(200).json({
      // We no longer calculate averageResponseTime
      highestPriorityRoom,
    });

  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};