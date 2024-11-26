// src/scripts/campaignProcessor.js
const campaignProcessingService = require("../services/campaignProcessingService");
const logger = require("../utils/logger");

// Utility function for delay between checks
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const DEFAULT_SLEEP_DURATION = 10000; // Default wait time between processing attempts
const ERROR_SLEEP_DURATION = 10000; // Wait time after an error
const MAX_RETRIES = 5; // Maximum number of retries before exiting

async function startProcessing() {
    logger.info("Campaign processor started running...");

    // Send ready message to parent if we're being run as a child process
    if (process.send) {
        process.send({ status: "ready" });
    }

    let retryCount = 0; // Track the number of consecutive errors

    while (true) {
        try {
            await campaignProcessingService.startProcessing();
            retryCount = 0; // Reset retry count on success
            await sleep(DEFAULT_SLEEP_DURATION);
        } catch (error) {
            logger.error("Error in campaign processor:", error);
            retryCount++;

            if (retryCount >= MAX_RETRIES) {
                logger.error("Max retries reached. Exiting campaign processor...");
                process.exit(1); // Exit after too many errors
            }

            await sleep(ERROR_SLEEP_DURATION);
        }
    }
}

// Handle shutdown signals
process.on("SIGTERM", () => {
    logger.info("Campaign processor received SIGTERM...");
    process.exit(0);
});

process.on("SIGINT", () => {
    logger.info("Campaign processor received SIGINT...");
    process.exit(0);
});

// Handle uncaught errors
process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception:", error);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});

// Start the processor
logger.info("Campaign processor initializing...");
startProcessing().catch((error) => {
    logger.error("Fatal error in campaign processor:", error);
    process.exit(1);
});
