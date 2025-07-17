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

export const getRoomDetails = async (roomNumber) => {
  const res = await axios.get(`${BASE_URL}/rooms/${roomNumber}`);
  return res.data;
};

export const updateGuestName = async (telegramId, name) => {
  const res = await fetch(`/requests/guest/${telegramId}/update-name`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to update guest name");
  return res.json();
};
