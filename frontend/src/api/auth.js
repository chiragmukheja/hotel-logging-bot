import axios from 'axios';


export const register = async (email, password) => {
  const res = await axios.post(`${import.meta.env.API_BASE}/auth/register`, { email, password });
  return res.data;
};

export const login = async (email, password) => {
  const res = await axios.post(`${import.meta.env.API_BASE}/auth/login`, { email, password });
  return res.data;
};
