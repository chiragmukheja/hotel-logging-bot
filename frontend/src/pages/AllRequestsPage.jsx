import { useEffect, useState } from 'react';
import { getAllRequests } from '../api/requests';
import { format } from 'date-fns';

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

  useEffect(() => {
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
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading requests...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">All Guest Requests</h1>

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
                <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-gray-700/50 hover:bg-gray-700/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-yellow-300">{req.stay.roomNumber}</td>
                  <td className="px-6 py-4">{req.stay.guest.name || 'N/A'}</td>
                  <td className="px-6 py-4 max-w-sm truncate">{req.requestText}</td> {/* ✅ Corrected field */}
                  <td className="px-6 py-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {format(new Date(req.createdAt), 'dd MMM, hh:mm a')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* We can add action buttons here later */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllRequestsPage;