import io from "socket.io-client"

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000"

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})

socket.on("connect", () => {
  console.log("Connected to WebSocket server")
})

socket.on("connect_error", (error) => {
  console.error("WebSocket connection error:", error)
})

export default socket

