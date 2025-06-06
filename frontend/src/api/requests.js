import axios from 'axios';


export const getAllPendingRequests = async () => {
  const res = await axios.get(`${import.meta.env.API_BASE}/requests`);
  return res.data;
};

export const markRequestAsDone = async (id) => {
  const res = await axios.put(`${import.meta.env.API_BASE}/${id}/complete`);
  return res.data;
};
