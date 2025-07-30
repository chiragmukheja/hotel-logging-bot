import { useEffect, useState, useMemo } from 'react';
import { getAllRequests, markRequestAsDone } from '../api/requests';
import { format } from 'date-fns';
import { SearchIcon } from '../components/Layout/Icons';
import { socket } from '../socket'; 

// StatusBadge component remains the same
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

const AllRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ 2. This useEffect hook is now responsible for initial fetch AND real-time updates
  useEffect(() => {
    // Initial data fetch
    const fetchRequests = async () => {
      try {
        const data = await getAllRequests();
        setRequests(data);
      } catch (err) {
        console.error("Failed to fetch requests", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();

    // --- REAL-TIME UPDATES ---
    // Function to handle a new request event from the server
    const handleNewRequest = (newRequestData) => {
      // We need to add guest and room info to the new request to match our list's structure
      // Your backend might already send this, but if not, we can adjust.
      // Assuming the backend sends the full request object with relations:
      setRequests(prevRequests => [newRequestData, ...prevRequests]);
    };

    // Listen for the 'new-request' event
    socket.on('new-request', handleNewRequest);

    // Crucial: Cleanup the listener when the component unmounts
    return () => {
      socket.off('new-request', handleNewRequest);
    };
  }, []); // Empty dependency array means this runs once on mount

  // ... (the rest of the component is unchanged)

  const filteredRequests = useMemo(() => {
    return requests
      .filter(req => {
        if (filterStatus === 'all') return true;
        return req.status === filterStatus;
      })
      .filter(req => {
        const searchLower = searchTerm.toLowerCase();
        // Added a check to prevent error if guest or stay is null
        return (
          (req.stay?.roomNumber?.toLowerCase() || '').includes(searchLower) ||
          (req.stay?.guest?.name?.toLowerCase() || '').includes(searchLower) ||
          (req.requestText?.toLowerCase() || '').includes(searchLower)
        );
      });
  }, [requests, filterStatus, searchTerm]);

  const handleMarkAsDone = async (requestId) => {
    try {
      await markRequestAsDone(requestId);
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === requestId ? { ...req, status: 'COMPLETED' } : req
        )
      );
    } catch (err) {
      console.error("Failed to mark request as done", err);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading requests...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">All Guest Requests</h1>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* ... (Filter Buttons and Search Bar remain exactly the same) ... */}
      </div>

      {/* Mobile View: List of Cards (hidden on medium screens and up) */}
      <div className="space-y-4 md:hidden">
        {filteredRequests.map((req) => (
          <div key={req.id} className="bg-gray-800/50 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-yellow-300">Room {req.stay?.roomNumber}</p>
                <p className="text-sm text-gray-400">{req.stay?.guest?.name || 'N/A'}</p>
              </div>
              <StatusBadge status={req.status} />
            </div>
            <p className="text-gray-200">{req.requestText}</p>
            <div className="flex justify-between items-center text-xs text-gray-500 border-t border-white/10 pt-3 mt-3">
              <span>{format(new Date(req.createdAt), 'dd MMM, hh:mm a')}</span>
              {req.status === 'pending' && (
                <button
                  onClick={() => handleMarkAsDone(req.id)}
                  className="font-medium text-green-400 hover:text-green-300"
                >
                  Mark as Done
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Desktop View: Table (hidden on small screens) */}
      <div className="hidden md:block bg-gray-800/50 border border-white/10 rounded-xl shadow-lg">
        {/* ... (The entire <table> structure remains here exactly as it was) ... */}
      </div>

      {/* Common "No Results" message */}
      {filteredRequests.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            No requests match your criteria.
          </div>
        )}
    </div>
  );
};

export default AllRequestsPage;