import { Redis } from "@upstash/redis";

// Upstash Redis 客户端
// 需要在 .env.local 或 Vercel 环境变量中配置：
// UPSTASH_REDIS_REST_URL=xxx
// UPSTASH_REDIS_REST_TOKEN=xxx
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export default redis;
