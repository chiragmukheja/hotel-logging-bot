import { useEffect, useState } from 'react';
import { getAllPendingRequests, markRequestAsDone } from '../api/requests';

function RequestList() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const data = await getAllPendingRequests();
    setRequests(data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleMarkDone = async (id) => {
    await markRequestAsDone(id);
    fetchRequests();
  };

  return (
    <div>
      <h2>Pending Guest Requests</h2>
      <ul>
        {requests.map((req) => (
          <li key={req.id}>
            <strong>{req.guestPhone}</strong>: {req.requestText}
            <button onClick={() => handleMarkDone(req.id)} style={{ marginLeft: '1rem' }}>
              Mark as Done
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RequestList;
