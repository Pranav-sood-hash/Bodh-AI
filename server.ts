import "dotenv/config";
import app from "./src/app";
import { connectRedis } from "./src/config/redis";
import { logger } from "./src/utils/logger";
import { PORT } from "./src/config/constants";

const startServer = async () => {
  // Connect to cache layer
  await connectRedis();

  app.listen(PORT, () => {
    logger.info(`BodhAI backend server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
  });
};

startServer().catch((err) => {
  logger.error("Failed to start server:", err);
  process.exit(1);
});
