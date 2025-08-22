import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoomSummary } from "../api/requests";
import { getDashboardStats } from "../api/stats";
import { socket } from "../socket";
import DashboardStatCard from "./layout/DashboardStatCard";
import { BellAlertIcon, CheckCircleIcon, ClockIcon, ListIcon } from "./layout/Icons";

function DashboardPage() {
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({ averageResponseTime: '..', highestPriorityRoom: '..' }); 
  const navigate = useNavigate();

  // --- Data Fetching ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch both sets of data in parallel
        const [roomsData, statsData] = await Promise.all([
          getRoomSummary(),
          getDashboardStats()
        ]);
        setRooms(roomsData);
        setStats(statsData);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchAllData(); // Initial fetch

    // Socket listener to refetch rooms list on new request
    socket.on("new-request", () => {
        getRoomSummary().then(setRooms);
        getDashboardStats().then(setStats); // Also refetch stats
    });
    
    return () => {
      socket.off("new-request");
    };
  }, []);

  // --- KPI Calculations ---
  const totalPending = useMemo(() => {
    return rooms.reduce((acc, room) => acc + room._count.requests, 0);
  }, [rooms]);

  // --- JSX Structure ---
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <DashboardStatCard
          title="Total Pending Requests"
          value={totalPending}
          icon={<BellAlertIcon className="w-7 h-7" />}
          color="yellow"
        />
        <DashboardStatCard
          title="Rooms with Requests"
          value={rooms.length}
          icon={<ListIcon className="w-7 h-7" />}
          color="cyan"
        />

        <DashboardStatCard
          title="Highest Priority"
          value={stats.highestPriorityRoom !== 'N/A' 
                   ? `${stats.highestPriorityRoom}` 
                   : 'N/A'
                }
          icon={<BellAlertIcon className="w-7 h-7" />}
          color="red"
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-yellow-300 mb-6">Rooms with Active Requests</h2>
        {rooms.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/30 rounded-lg">
            <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500" />
            <p className="text-gray-400 mt-4 text-lg">🎉 All guest requests are completed!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {rooms.map((room) => (
              <div
                key={room.id}
                
                className="group relative bg-gray-800/50 border border-white/10 rounded-xl p-5 shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/dashboard/room/${room.id}`)}
              >
                
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-yellow-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-lg"></div>

                {/* content sits on top with a relative position */}
                <div className="relative">
                  <h3 className="text-xl font-semibold text-yellow-200">Room {room.roomNumber}</h3>
                  <p className="text-sm text-gray-400 mt-2">
                    {room._count.requests} pending request{room._count.requests > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;