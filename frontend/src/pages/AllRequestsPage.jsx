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
        <div className="flex items-center bg-gray-800/60 rounded-lg p-1">
          {['pending', 'COMPLETED', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors capitalize ${
                filterStatus === status
                  ? 'bg-cyan-500 text-white'
                  : 'text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              {status === 'COMPLETED' ? 'Completed' : status}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search room, guest, or request..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800/60 border border-white/10 rounded-lg py-2 pl-4 pr-10 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
          <SearchIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="bg-gray-800/50 border border-white/10 rounded-xl shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-900/60 text-xs text-gray-400 uppercase">
              <tr>
                <th scope="col" className="px-6 py-3">Room</th>
                <th scope="col" className="px-6 py-3">Guest</th>
                <th scope="col" className="px-6 py-3">Request</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Received</th>
                <th scope="col" className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id} className="border-b border-gray-700/50 hover:bg-gray-700/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-yellow-300">{req.stay?.roomNumber}</td>
                  <td className="px-6 py-4">{req.stay?.guest?.name || 'N/A'}</td>
                  <td className="px-6 py-4 max-w-sm truncate" title={req.requestText}>{req.requestText}</td>
                  <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                  <td className="px-6 py-4 text-gray-400">{format(new Date(req.createdAt), 'dd MMM, hh:mm a')}</td>
                  <td className="px-6 py-4 text-center">
                    {req.status === 'pending' && (
                      <button
                        onClick={() => handleMarkAsDone(req.id)}
                        className="font-medium text-green-400 hover:text-green-300"
                      >
                        Mark as Done
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-400">
                    No requests match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllRequestsPage;