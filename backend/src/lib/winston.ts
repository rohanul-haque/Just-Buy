import config from "@/config";
import winston from "winston";

const { combine, timestamp, errors, align, printf, colorize } = winston.format;

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({
    format: "YYYY-MM-DD hh:mm:ss A",
  }),
  errors({ stack: true }),
  align(),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? `\n${JSON.stringify(meta, null, 2)}`
      : "";

    return stack
      ? `${timestamp} [${level}] : ${stack}${metaStr}`
      : `${timestamp} [${level}] : ${message}${metaStr}`;
  }),
);

const logger = winston.createLogger({
  level: config.LOG_LEVEL,

  format: combine(errors({ stack: true }), timestamp()),

  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],

  silent: config.NODE_ENV === "test",
});

export { logger };
