const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.getDashboardStats = async (req, res) => {
  try {
    const [completedRequests, oldestPendingRequest] = await Promise.all([
      prisma.request.findMany({
        where: { status: 'COMPLETED' },
        select: { createdAt: true, updatedAt: true },
      }),
      prisma.request.findFirst({
        where: { status: 'pending' },
        orderBy: { createdAt: 'asc' },
        include: { stay: { select: { roomNumber: true } } },
      }),
    ]);

    let averageResponseTime = 0;
    if (completedRequests.length > 0) {
      const totalResponseMilliseconds = completedRequests.reduce((acc, req) => {
        // Ensure both dates are valid before calculating
        if (req.updatedAt && req.createdAt) {
          const diff = new Date(req.updatedAt).getTime() - new Date(req.createdAt).getTime();
          return acc + diff;
        }
        return acc;
      }, 0);
      const avgMilliseconds = totalResponseMilliseconds / completedRequests.length;
      averageResponseTime = Math.round(avgMilliseconds / 60000); // Convert to minutes
    }

    const highestPriorityRoom = oldestPendingRequest?.stay?.roomNumber || 'N/A';

    res.status(200).json({
      averageResponseTime,
      highestPriorityRoom,
    });
  } catch (error) {
    console.error("Failed to get dashboard stats:", error);
    res.status(500).json({ message: "Failed to retrieve dashboard stats" });
  }
};