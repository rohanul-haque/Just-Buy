import config from "@/config";
import { createClient } from "redis";

export const redisClient = createClient({
  username: config.REDIS_USER,
  password: config.REDIS_PASSWORD,
  socket: {
    host: config.REDIS_HOST,
    port: Number(config.REDIS_PORT),
  },
});
