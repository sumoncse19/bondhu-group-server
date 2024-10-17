// src/server.ts
import app from './app'
import config from './app/config'
import mongoose from 'mongoose'
import { createServer } from 'http' // Required to create an HTTP server for Socket.IO
import initializeSocket from './socket' // Import the Socket.IO initialization function

async function main() {
  try {
    await mongoose.connect(config.database_url as string)

    const server = createServer(app) // Create an HTTP server using Express
    initializeSocket(server) // Initialize Socket.IO on the HTTP server

    server.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`)
    })
  } catch (error) {
    console.log(error)
  }
}

main()
