import "dotenv/config";
import http from "http";
import app from "./src/app";
import { connectRedis } from "./src/config/redis";
import { logger } from "./src/utils/logger";
import { PORT } from "./src/config/constants";
import { initSocket } from "./src/services/socket.service";
import { initCronJobs } from "./src/services/cron.service";

const startServer = async () => {
  // Connect to cache layer
  await connectRedis();

  const server = http.createServer(app);
  initSocket(server);
  initCronJobs();

  server.listen(PORT, () => {
    logger.info(`BodhAI backend server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
  });
};

startServer().catch((err) => {
  logger.error("Failed to start server:", err);
  process.exit(1);
});
