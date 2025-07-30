import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoomSummary } from "../api/requests";
import { socket } from "../socket";
import DashboardStatCard from "./Layout/DashboardStatCard";
import { BellAlertIcon, CheckCircleIcon, ClockIcon, ListIcon } from "./Layout/Icons";

function DashboardPage() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  // --- Data Fetching ---
  const fetchRooms = async () => {
    try {
      const data = await getRoomSummary();
      setRooms(data);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    }
  };

  useEffect(() => {
    fetchRooms();
    socket.on("new-request", fetchRooms);
    return () => {
      socket.off("new-request", fetchRooms);
    };
  }, []);

  // --- KPI Calculations ---
  // We use useMemo to avoid recalculating on every render
  const totalPending = useMemo(() => {
    return rooms.reduce((acc, room) => acc + room._count.requests, 0);
  }, [rooms]);

  // --- JSX Structure ---
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      {/* KPI Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          title="Avg. Response Time"
          value="12m" // Placeholder - requires backend logic
          icon={<ClockIcon className="w-7 h-7" />}
          color="green"
        />
        <DashboardStatCard
          title="Highest Priority"
          value="Room 101" // Placeholder - requires backend logic
          icon={<BellAlertIcon className="w-7 h-7" />}
          color="red"
        />
      </div>

      {/* Rooms List Section */}
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
                className="bg-gray-800/50 border border-white/20 rounded-xl p-5 shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                onClick={() => navigate(`/dashboard/room/${room.id}`)}
              >
                <h3 className="text-xl font-semibold text-yellow-200">Room {room.roomNumber}</h3>
                <p className="text-sm text-gray-400 mt-2">
                  {room._count.requests} pending request{room._count.requests > 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;