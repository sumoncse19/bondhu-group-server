import redisClient from '../../config/redis.config'
import { Email } from './common.types'

export function generateNextPageLink(
  baseUrl: string,
  page: number,
  limit: number,
): string {
  const nextPage = page + 1
  return `${baseUrl}?page=${nextPage}&limit=${limit}`
}

export function generatePrevPageLink(
  baseUrl: string,
  page: number,
  limit: number,
): string {
  const prevPage = page > 1 ? page - 1 : 1
  return `${baseUrl}?page=${prevPage}&limit=${limit}`
}

export function isValidEmail(email: Email): email is Email {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const clearUserCache = async (userId: string) => {
  await redisClient.del(`user:${userId}`)
  await redisClient.del('all_users')
}
