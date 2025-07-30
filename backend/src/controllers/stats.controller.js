const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
  try {
    // Perform calculations in parallel for efficiency
    const [completedRequests, oldestPendingRequest] = await Promise.all([
      // 1. Get all completed requests for avg. response time calculation
      prisma.request.findMany({
        where: { status: 'COMPLETED' },
        select: { createdAt: true, updatedAt: true },
      }),
      // 2. Get the oldest pending request to determine the highest priority room
      prisma.request.findFirst({
        where: { status: 'pending' },
        orderBy: { createdAt: 'asc' },
        include: { stay: { select: { roomNumber: true } } },
      }),
    ]);

    // Calculate Average Response Time
    let averageResponseTime = 0;
    if (completedRequests.length > 0) {
      const totalResponseMilliseconds = completedRequests.reduce((acc, req) => {
        const diff = new Date(req.updatedAt).getTime() - new Date(req.createdAt).getTime();
        return acc + diff;
      }, 0);
      const avgMilliseconds = totalResponseMilliseconds / completedRequests.length;
      averageResponseTime = Math.round(avgMilliseconds / 60000); // Convert to minutes
    }

    // Determine Highest Priority Room
    const highestPriorityRoom = oldestPendingRequest ? oldestPendingRequest.stay.roomNumber : 'N/A';

    res.status(200).json({
      averageResponseTime,
      highestPriorityRoom,
    });
  } catch (error) {
    console.error("Failed to get dashboard stats:", error);
    res.status(500).json({ message: "Failed to retrieve dashboard stats" });
  }
};