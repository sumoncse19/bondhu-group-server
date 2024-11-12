import Redis from 'ioredis'
import config from './index'

const redisClient = new Redis({
  host: config.redis_host || 'localhost',
  port: Number(config.redis_port) || 6379,
  password: config.redis_password,
  retryStrategy(times: number) {
    if (times > 3) {
      console.error('Redis connection failed, stopping retries')
      return null
    }
    return Math.min(times * 50, 2000)
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 10000,
})

// Event handlers
redisClient.on('connect', () => {
  console.log('Redis client connected')
})

redisClient.on('error', (err: Error & { code?: string }) => {
  console.error('Redis Client Error:', err.message)
  if (err.code) {
    console.error('Error Code:', err.code)
  }
})

redisClient.on('ready', () => {
  console.log('Redis client ready and connected')
})

redisClient.on('reconnecting', () => {
  console.log('Redis client reconnecting...')
})

export default redisClient
