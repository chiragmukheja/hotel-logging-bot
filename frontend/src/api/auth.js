import axios from 'axios';


export const register = async (email, password) => {
  const res = await axios.post("https://hotel-logging-bot.onrender.com/auth/register", { email, password });
  return res.data;
};

export const login = async (email, password) => {
  const res = await axios.post("https://hotel-logging-bot.onrender.com/auth/login", { email, password });
  return res.data;
};
