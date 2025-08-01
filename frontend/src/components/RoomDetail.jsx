import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRoomDetails, markRequestAsDone, updateGuestName } from '../api/requests';
import { adminCheckoutStay, adminTransferStay } from '../api/admin';
import { socket } from '../socket';
import { format } from 'date-fns';

// A reusable StatusBadge component for consistent styling.
const StatusBadge = ({ status = 'loading' }) => {
  const baseClasses = "px-3 py-1 text-xs font-medium rounded-full capitalize";
  const statusClasses = {
    pending: "bg-yellow-500/20 text-yellow-300",
    COMPLETED: "bg-green-500/20 text-green-400",
    ACTIVE: "bg-blue-500/20 text-blue-300",
    INACTIVE: "bg-gray-500/20 text-gray-400",
  };
  return (
    <span className={`${baseClasses} ${statusClasses[status] || 'bg-gray-500/20 text-gray-300'}`}>
      {status.toLowerCase().replace('_', ' ')}
    </span>
  );
};

function RoomDetail() {
  const { stayId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getRoomDetails(stayId);
      setDetails(data);
      setNameInput(data.name || "");
    } catch (err) {
      console.error("Failed to fetch room details:", err);
      setError('Failed to load room details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();

    // ✅ YOUR EXISTING REAL-TIME SOCKET LISTENER (PRESERVED)
    const handleNewRequest = (request) => {
      if (request.stayId?.trim() === stayId?.trim()) {
        setDetails((prev) => ({
          ...prev,
          requests: [request, ...prev.requests],
        }));
      }
    };
    socket.on("new-request", handleNewRequest);

    return () => {
      socket.off("new-request", handleNewRequest);
    };
  }, [stayId]);

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
  
  // ✅ YOUR EXISTING EDITABLE NAME LOGIC (PRESERVED)
  const handleNameSave = async () => {
    if (!details || details.name === nameInput) {
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

  // ✅ NEW ADMIN ACTION HANDLERS
  const handleAdminCheckout = async () => {
    if (window.confirm('Are you sure you want to check out this guest? This action cannot be undone.')) {
      try {
        await adminCheckoutStay(stayId);
        alert('Guest checked out successfully.');
        navigate('/dashboard');
      } catch (err) {
        console.error("Admin checkout failed:", err);
        alert('Error: Could not check out the guest.');
      }
    }
  };
  
  const handleAdminTransfer = async () => {
    const newRoomNumber = window.prompt("Enter the new room number for this guest:");
    if (newRoomNumber && newRoomNumber.trim() !== "") {
      try {
        await adminTransferStay(stayId, newRoomNumber.trim());
        alert('Guest transferred successfully!');
        fetchDetails(); 
      } catch (err) {
        console.error("Admin transfer failed:", err);
        alert(`Error: ${err.response?.data?.message || 'Could not transfer guest.'}`);
      }
    }
  };

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

      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Room <span className="text-yellow-400">{details.roomNumber}</span></h1>
        <StatusBadge status={details.status} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-800/50 border border-white/10 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Guest Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Name</p>
                {/* ✅ YOUR EDITABLE NAME UI (PRESERVED) */}
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

            {/* ✅ NEW ADMIN CONTROLS UI */}
            {details.status === 'ACTIVE' && (
              <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                 <h3 className="text-md font-semibold text-gray-300">Admin Controls</h3>
                <button
                  onClick={handleAdminTransfer}
                  className="w-full text-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Transfer Room
                </button>
                <button
                  onClick={handleAdminCheckout}
                  className="w-full text-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Checkout Guest
                </button>
              </div>
            )}
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