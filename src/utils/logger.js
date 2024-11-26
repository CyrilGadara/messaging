const winston = require("winston");
require("winston-daily-rotate-file");

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, errors } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    if (stack) {
        msg += `\n${stack}`;
    }
    return msg;
});

// Create a daily rotate file transport
const fileRotateTransport = new transports.DailyRotateFile({
    filename: "logs/application-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
    zippedArchive: true,
});

const logger = createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(timestamp(), errors({ stack: true }), logFormat),
    transports: [fileRotateTransport, new transports.File({ filename: "logs/error.log", level: "error" })],
});

// If we're not in production, log to the console too
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new transports.Console({
            format: combine(
                colorize(),
                timestamp(),
                printf(({ level, message, timestamp, stack }) => {
                    let msg = `${timestamp} ${level}: ${message}`;
                    if (stack) {
                        msg += `\n${stack}`;
                    }
                    return msg;
                })
            ),
        })
    );
}

// Handling uncaught exceptions and unhandled rejections
logger.exceptions.handle(new transports.File({ filename: "logs/exceptions.log" }));
process.on("unhandledRejection", (ex) => {
    throw ex;
});

module.exports = logger;
