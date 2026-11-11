import app from "@/app";
import config from "@/config";
import db from "@/lib/db";
import { redisClient } from "@/lib/redis";
import { logger } from "@/lib/winston";

let server: ReturnType<typeof app.listen>;

const startServer = async () => {
  try {
    await db.connectToMongoDB();
    await redisClient.connect();

    server = app.listen(config.PORT, () => {
      logger.info(`Server running on http://localhost:${config.PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();

const gracefulShutdown = async (signal: string) => {
  logger.warn(`${signal} received. Shutting down server...`);

  server.close(async () => {
    try {
      await db.disconnectFromMongoDB();

      logger.info("MongoDB disconnected.");
      logger.info("Server shutdown completed.");

      process.exit(0);
    } catch (error) {
      logger.error("Error during shutdown", error);
      process.exit(1);
    }
  });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", reason);

  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", error);
  process.exit(1);
});
