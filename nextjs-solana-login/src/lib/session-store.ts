import type { SynqSessionStore } from '@synqauth/nextjs'
import { redisSessionStore } from '@synqauth/nextjs/stores/redis'
import { upstashSessionStore } from '@synqauth/nextjs/stores/upstash'
import { Redis } from '@upstash/redis'
import { createClient } from 'redis'

// Where sessions live (https://docs.synq.build/guides/session-stores).
// Without a store, a session lives in its sealed cookie, which suits one
// server process, as `npm run dev` runs. A host with several processes
// (Vercel, replicas behind a load balancer) needs a store they all share,
// and synqAuth() refuses the cookie there:
//
// * REDIS_URL: a Redis or Valkey of your own, through node-redis, which the
//   store connects on its first request
// * UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN, or the KV_REST_API_*
//   pair Vercel's Redis (Upstash, from the Vercel Marketplace) sets
export function sessionStore(): SynqSessionStore | undefined {
  if (process.env.REDIS_URL) {
    const redis = createClient({ url: process.env.REDIS_URL })
    // node-redis stops the process on an error nothing listens for.
    redis.on('error', (error) => console.error('Redis:', error))
    return redisSessionStore(redis)
  }
  if (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) {
    return upstashSessionStore(Redis.fromEnv())
  }
  return undefined
}
