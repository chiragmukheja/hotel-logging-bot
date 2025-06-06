import axios from 'axios';


export const register = async (username, password) => {
  const res = await axios.post("https://hotel-logging-bot.onrender.com/auth/register", { username, password });
  return res.data;
};

export const login = async (username, password) => {
  const res = await axios.post("https://hotel-logging-bot.onrender.com/auth/login", { username, password });
  return res.data;
};
