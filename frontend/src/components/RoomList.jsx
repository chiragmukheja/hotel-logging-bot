import { useEffect, useState } from "react";
import { getRoomSummary } from "../api/requests";
import { useNavigate } from "react-router-dom";

function RoomList() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getRoomSummary().then(setRooms);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-yellow-300 mb-6">Rooms with Pending Requests</h2>
      {rooms.length === 0 ? (
        <p className="text-gray-400 italic text-center">🎉 All guest requests are completed!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {rooms.map((room) => (
            <div
              key={room.stayId}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-md hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/dashboard/room/${room.stayId}`)}
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
  );
}

export default RoomList;
