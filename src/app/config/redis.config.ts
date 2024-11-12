import Redis from 'ioredis'
import config from './index'

const redisClient = new Redis({
  host: config.redis_host || 'localhost',
  port: Number(config.redis_port) || 6379,
  password: config.redis_password,
  tls: process.env.NODE_ENV === 'production' ? {} : undefined,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) {
      console.error('Redis connection failed, stopping retries')
      return null
    }
    return Math.min(times * 50, 2000)
  },
})

redisClient.on('connect', () => {
  console.log('Redis client connected')
})

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err)
})

export default redisClient
