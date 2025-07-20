import { io } from "socket.io-client";

const SOCKET_URL = "https://hotel-logging-bot.onrender.com";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("🟢 Socket connected (frontend)", socket.id);
});

socket.on("disconnect", () => {
  console.log("🔴 Socket disconnected (frontend)");
});

socket.on("new_request", (payload) => {
  console.log("📦 Global new_request payload received:", payload);
});