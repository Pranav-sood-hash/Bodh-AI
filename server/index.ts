import "../src/polyfill";
import "dotenv/config";
import app from "../src/app";
import { connectRedis } from "../src/config/redis";

export function createServer() {
  // Connect to cache layer (fallback to memory if local Redis is down)
  connectRedis();
  return app;
}
