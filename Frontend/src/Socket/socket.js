import { io } from "socket.io-client";

 const socket = io("http://localhost:5000", {
   withCredentials: true,
   reconnection: true,
   reconnectionAttempts: 5,
   reconnectionDelay: 1000,
 });
 
 socket.on("connect", () => {
   console.log("🔌 [Socket.js] Socket connected:", socket.id);
 });
 
 socket.on("disconnect", (reason) => {
   console.log("🔌 [Socket.js] Socket disconnected:", socket.id, "Reason:", reason);
 });
 
 export default socket;
