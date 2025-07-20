import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoomDetails, markRequestAsDone, updateGuestName } from "../api/requests";
import { socket } from "../socket";


function RoomDetail() {
  const { stayId } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getRoomDetails(stayId)
      .then((data) => {
        setRoomData(data);
        setNameInput(data.name || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch room data:", err);
        setLoading(false);
      });

    const handleNewRequest = (request) => {
        console.log("🔁 Incoming socket request:", request.stayId, "vs", stayId);

        // Only update if the request is for the current stay
        if (request.stayId?.trim() === stayId?.trim()) {
        setRoomData((prev) => ({
            ...prev,
            requests: [request, ...prev.requests],
        }));
        }
    };

    socket.on("new-request", handleNewRequest);

    return () => {
        socket.off("new-request", handleNewRequest); // clean up on unmount
    };
  }, [stayId]);

  const handleMarkDone = async (id) => {
    try {
      await markRequestAsDone(id);
      setRoomData((prev) => ({
        ...prev,
        requests: prev.requests.map((r) =>
          r.id === id ? { ...r, status: "COMPLETED" } : r
        ),
      }));
    } catch (err) {
      console.error("Failed to mark as done", err);
    }
  };

  const handleNameSave = async () => {
    try {
      await updateGuestName(roomData.telegramId, nameInput);
      setRoomData((prev) => ({
        ...prev,
        name: nameInput,
      }));
      setEditingName(false);
    } catch (err) {
      console.error("Failed to update guest name", err);
    }
  };

  if (loading) return <p className="text-gray-300">Loading room data...</p>;
  if (!roomData || !roomData.roomNumber) return <p className="text-red-400">Room not found.</p>;

  return (
    <div>
      <button
        onClick={() => navigate("/dashboard")}
        className="text-white py-2 rounded-md transition"
      >
        ← Back to Dashboard
      </button>

      <h2 className="text-3xl font-bold text-yellow-400 mb-6">
        Room {roomData.roomNumber}
      </h2>

      <div className="mb-8 p-4 rounded-lg bg-gray-800 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-2">Guest Information</h3>
        <p className="text-gray-300">
          Name:{" "}
          {editingName ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
              autoFocus
              className="bg-gray-700 text-white p-1 rounded"
            />
          ) : (
            <span
              className="text-yellow-300 cursor-pointer hover:underline"
              onClick={() => setEditingName(true)}
            >
              {roomData.name || "Click to add"}
            </span>
          )}
        </p>
        <p className="text-gray-300">
          Telegram ID:{" "}
          <span className="text-yellow-300">{roomData.telegramId}</span>
        </p>
        <p className="text-gray-300">
          Check-in Time:{" "}
          <span className="text-yellow-300">
            {new Date(roomData.checkInAt).toLocaleString()}
          </span>
        </p>
      </div>

      <h3 className="text-xl font-semibold text-white mb-4">Request History</h3>
      {roomData.requests.length === 0 ? (
        <p className="text-gray-400 italic">No requests made yet.</p>
      ) : (
        <ul className="space-y-4">
          {roomData.requests.map((req) => (
            <li
              key={req.id}
              className="p-4 bg-gray-900 border border-gray-700 rounded-lg"
            >
              <p className="text-white">{req.requestText}</p>
              <p className="text-sm text-gray-400">
                Created: {new Date(req.createdAt).toLocaleString()}
              </p>
              <p
                className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  req.status?.toUpperCase() === "PENDING"
                    ? "bg-yellow-500 text-black"
                    : "bg-green-700 text-white"
                }`}
              >
                {req.status}
              </p>
              {req.status?.toUpperCase() === "PENDING" && (
                <button
                  onClick={() => handleMarkDone(req.id)}
                  className="ml-4 mt-1.5 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-lg text-sm transition"
                >
                  Mark as Done
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RoomDetail;
