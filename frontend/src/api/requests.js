import axios from 'axios';

const BASE_URL = 'https://hotel-logging-bot.onrender.com/requests';

export const getAllPendingRequests = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

export const markRequestAsDone = async (id) => {
  const res = await axios.put(`${BASE_URL}/${id}/complete`);
  return res.data;
};

export const getRoomSummary = async () => {
  const res = await axios.get(`${BASE_URL}/rooms`);
  return res.data;
};

// ✅ Updated to fetch room detail by stayId
export const getRoomDetails = async (stayId) => {
  const res = await axios.get(`${BASE_URL}/rooms/${stayId}`);
  return res.data;
};

// ✅ Also updated to use stayId for updating name
export const updateGuestName = async (telegramId, name) => {
  const res = await fetch(`${BASE_URL}/guest/${telegramId}/update-name`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to update guest name");
  return res.json();
};
