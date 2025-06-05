import { useEffect, useState } from 'react';
import { getAllPendingRequests, markRequestAsDone } from '../api/requests';
import { Loader2 } from 'lucide-react'; // Optional: needs `lucide-react`

function RequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const data = await getAllPendingRequests();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleMarkDone = async (id) => {
    await markRequestAsDone(id);
    fetchRequests();
  };

  return (
    <section>
      <h2 className="text-2xl sm:text-3xl font-bold text-yellow-300 mb-6">
        Pending Guest Requests
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin h-8 w-8 text-yellow-400" />
        </div>
      ) : requests.length === 0 ? (
        <p className="text-gray-500 text-center italic">🎉 All requests are completed.</p>
      ) : (
        <div className="space-y-5">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-md hover:shadow-lg transition duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div className="mb-2 sm:mb-0">
                  <p className="text-yellow-200 font-medium text-lg">{req.guestPhone}</p>
                  <p className="text-gray-300">{req.requestText}</p>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Status:</span>
                  <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-semibold">
                    Pending
                  </span>
                  <button
                    onClick={() => handleMarkDone(req.id)}
                    className="ml-4 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded-lg transition duration-200"
                  >
                    Mark as Done
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default RequestList;
