"use client"

import { useEffect, useState } from "react"
import io from "socket.io-client"

const SOCKET_SERVER_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"

const WebSocketTest = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL)

    socket.on("connect", () => {
      setIsConnected(true)
    })

    socket.on("disconnect", () => {
      setIsConnected(false)
    })

    socket.on("message", (message) => {
      setLastMessage(message)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const sendMessage = () => {
    const socket = io(SOCKET_SERVER_URL)
    socket.emit("message", "Hello, server!")
  }

  return (
    <div>
      <p>Connected: {"" + isConnected}</p>
      <p>Last message: {lastMessage || "-"}</p>
      <button onClick={sendMessage}>Send message</button>
    </div>
  )
}

export default WebSocketTest