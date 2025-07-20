// socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.DEV
  ? "http://localhost:8080"
  : "https://hotel-logging-bot.onrender.com"; // use exact deployed Render URL

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket"],
});
