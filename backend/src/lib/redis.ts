/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */
/**
 * Third-Party Module
 */
import { createClient } from "redis";

/**
 * Application Module
 */
import config from "@/config";

/**
 * Redis Client
 */
export const redisClient = createClient({
  username: config.REDIS_USER,
  password: config.REDIS_PASSWORD,
  socket: {
    host: config.REDIS_HOST,
    port: Number(config.REDIS_PORT),
  },
});
