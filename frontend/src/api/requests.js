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
