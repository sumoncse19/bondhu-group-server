import { Server as SocketIOServer } from 'socket.io'
import http from 'http'

export const userSocketMap = new Map<string, string>() // Export userSocketMap

export let io: SocketIOServer

export default function initializeSocket(server: http.Server): void {
  const allowedOrigins = [
    'https://bondhu-group-client.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
  ]

  io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
      methods: ['GET', 'POST'],
      credentials: true, // Allow cookies or credentials (JWT, etc.)
    },
  })

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id)

    socket.on('register', (userId: string) => {
      userSocketMap.set(userId, socket.id) // Store the user's socket id
    })

    socket.on('chatMessage', (data) => {
      console.log('Chat message received:', data.content)
      io.emit('chatMessage', data) // Broadcast to all clients
    })

    socket.on('notification', (data) => {
      console.log('Notification received:', data.message)
      io.emit('notification', data) // Broadcast to all clients
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
      userSocketMap.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          userSocketMap.delete(userId) // Remove the user from the map
        }
      })
    })
  })
}
