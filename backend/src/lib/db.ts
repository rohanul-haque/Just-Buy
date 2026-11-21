import config from "@/config";
import { logger } from "@/lib/winston";
import mongoose from "mongoose";
import type { ConnectOptions } from "mongoose";

const clientOptions: ConnectOptions = {
  dbName: "jus-buy-db",
  appName: "Jus-Buy-API",
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};

const connectToMongoDB = async (): Promise<void> => {
  if (!config.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  try {
    await mongoose.connect(config.MONGO_URI, clientOptions);

    logger.info("Connected to the database successfully", {
      url: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    logger.error("Error connecting to MongoDB:", error);
  }
};

const disconnectFromMongoDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("Disconnected from the database successfully", {
      url: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    logger.error("Error disconnecting from MongoDB:", error);
  }
};

const db = { connectToMongoDB, disconnectFromMongoDB };

export default db;
