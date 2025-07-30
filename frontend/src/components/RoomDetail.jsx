import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRoomDetails, markRequestAsDone, updateGuestName } from '../api/requests';
import { socket } from '../socket';
import { format } from 'date-fns';

// A reusable StatusBadge component for consistent styling.
const StatusBadge = ({ status }) => {
  const baseClasses = "px-3 py-1 text-xs font-medium rounded-full capitalize";
  const statusClasses = {
    pending: "bg-yellow-500/20 text-yellow-300",
    COMPLETED: "bg-green-500/20 text-green-400",
  };
  return (
    <span className={`${baseClasses} ${statusClasses[status] || 'bg-gray-500/20 text-gray-300'}`}>
      {status.toLowerCase()}
    </span>
  );
};

function RoomDetail() {
  // --- HOOKS & STATE ---
  const { stayId } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ✅ State for handling the editable name feature
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // --- DATA FETCHING & REAL-TIME LOGIC ---
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await getRoomDetails(stayId);
        setDetails(data);
        setNameInput(data.name || ""); // Initialize the name input
      } catch (err) {
        console.error("Failed to fetch room details:", err);
        setError('Failed to load room details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();

    // ✅ Real-time socket listener for new requests
    const handleNewRequest = (request) => {
      // Check if the incoming request belongs to the currently viewed stay
      if (request.stayId?.trim() === stayId?.trim()) {
        setDetails((prev) => ({
          ...prev,
          requests: [request, ...prev.requests],
        }));
      }
    };
    socket.on("new-request", handleNewRequest);

    // Cleanup the socket listener when the component unmounts
    return () => {
      socket.off("new-request", handleNewRequest);
    };
  }, [stayId]);

  // --- ACTION HANDLERS ---
  const handleMarkAsDone = async (requestId) => {
    try {
      await markRequestAsDone(requestId);
      setDetails(prevDetails => ({
        ...prevDetails,
        requests: prevDetails.requests.map(req =>
          req.id === requestId ? { ...req, status: 'COMPLETED' } : req
        ),
      }));
    } catch (err) {
      console.error("Failed to mark request as done", err);
    }
  };
  
  // ✅ Handler for saving the guest's name
  const handleNameSave = async () => {
    if (details.name === nameInput) {
        setEditingName(false);
        return;
    }
    try {
      await updateGuestName(details.telegramId, nameInput);
      setDetails((prev) => ({ ...prev, name: nameInput }));
      setEditingName(false);
    } catch (err) {
      console.error("Failed to update guest name", err);
    }
  };


  // --- RENDER LOGIC ---
  if (loading) return <p className="text-center mt-10">Loading Room Details...</p>;
  if (error) return <p className="text-center mt-10 text-red-400">{error}</p>;
  if (!details) return null;

  return (
    <div className="space-y-6">
      <Link to="/dashboard" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-white">Room <span className="text-yellow-400">{details.roomNumber}</span></h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-800/50 border border-white/10 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Guest Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Name</p>
                {/* ✅ Conditional rendering for the editable name input */}
                {editingName ? (
                   <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onBlur={handleNameSave}
                    onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                    autoFocus
                    className="w-full bg-gray-700 text-white p-1.5 rounded-md border border-cyan-500"
                  />
                ) : (
                  <p 
                    className="font-medium text-yellow-300 cursor-pointer hover:underline"
                    onClick={() => setEditingName(true)}
                  >
                    {details.name || "Click to add name"}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-400">Telegram ID</p>
                <p className="font-medium">{details.telegramId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Check-in Time</p>
                <p className="font-medium">{format(new Date(details.checkInAt), 'dd MMM yyyy, hh:mm a')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-white mb-4">Request History</h2>
          <div className="space-y-4">
            {details.requests.map(req => (
              <div key={req.id} className="bg-gray-800/50 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className='flex-grow'>
                  <p className="text-gray-200">{req.requestText}</p>
                  <p className="text-xs text-gray-500 mt-1">{format(new Date(req.createdAt), 'dd MMM, hh:mm a')}</p>
                </div>
                <div className="flex items-center space-x-4 flex-shrink-0">
                  <StatusBadge status={req.status} />
                  {req.status === 'pending' && (
                    <button
                      onClick={() => handleMarkAsDone(req.id)}
                      className="font-medium text-green-400 hover:text-green-300 text-sm whitespace-nowrap"
                    >
                      Mark as Done
                    </button>
                  )}
                </div>
              </div>
            ))}
            {details.requests.length === 0 && (
              <div className="text-center py-10 bg-gray-800/30 rounded-lg">
                <p className="text-gray-400">No requests have been made for this stay.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDetail;