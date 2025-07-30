import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoomSummary } from "../api/requests";
import { getDashboardStats } from "../api/stats";
import { socket } from "../socket";
import DashboardStatCard from "./Layout/DashboardStatCard";
import { BellAlertIcon, CheckCircleIcon, ClockIcon, ListIcon } from "./Layout/Icons";

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
        {/* ... The rest of your JSX for the rooms list is unchanged ... */}
      </div>
    </div>
  );
}

export default DashboardPage;