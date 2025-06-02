import { useState } from 'react';
import { createRequest } from '../api/requests';

function RequestForm() {
  const [guestPhone, setGuestPhone] = useState('');
  const [requestText, setRequestText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createRequest(guestPhone, requestText);
    setGuestPhone('');
    setRequestText('');
    alert('Request submitted!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Guest Phone"
        value={guestPhone}
        onChange={(e) => setGuestPhone(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Request Text"
        value={requestText}
        onChange={(e) => setRequestText(e.target.value)}
        required
      />
      <button type="submit">Submit Request</button>
    </form>
  );
}

export default RequestForm;
