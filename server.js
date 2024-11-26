// server.js
require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const { getConnection, closeConnection } = require("./src/config/db");
const logger = require("./src/utils/logger");
const cluster = require("cluster");
const os = require("os");
const processManager = require("./src/scripts/manageProcessor");

const PORT = process.env.PORT || 3000;

if (cluster.isMaster && process.env.NODE_ENV === "production") {
    const numCPUs = os.cpus().length;
    logger.info(`Master ${process.pid} is running`);
    logger.info(`Forking ${numCPUs} workers...`);

    // Start campaign processor in production master
    logger.info("Starting campaign processor in production master");
    processManager.start().catch((error) => {
        logger.error("Failed to start campaign processor in production:", error);
    });

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker) => {
        logger.error(`Worker ${worker.process.pid} died`);
        cluster.fork(); // Fork a new worker
    });
} else {
    const server = http.createServer(app);

    async function startServer() {
        try {
            // Test database connection
            const db = await getConnection();
            await db.raw("SELECT 1");
            logger.info("Database connection successful");
            await closeConnection(); // Close the connection after testing

            server.listen(PORT, () => {
                logger.info(`Server running on port http://localhost:${PORT}`);
                logger.info(`Environment: ${process.env.NODE_ENV}`);
            });

            // Start campaign processor only in development
            if (process.env.NODE_ENV === "development") {
                logger.info("Starting campaign processor in development");
                try {
                    await processManager.start();
                    logger.info("Campaign processor started successfully");
                } catch (error) {
                    logger.error("Failed to start campaign processor in development:", error);
                    // Continue running the server even if the processor fails to start
                }
            }
        } catch (error) {
            logger.error("Unable to connect to the database:", error);
            process.exit(1); // Exit if database connection fails
        }
    }

    // Graceful shutdown
    async function shutdown() {
        logger.info("Shutting down gracefully...");

        // Stop processor if in development or production master
        if (process.env.NODE_ENV === "development" || (process.env.NODE_ENV === "production" && cluster.isMaster)) {
            await processManager.stop();
            logger.info("Campaign processor stopped");
        }

        server.close(async () => {
            logger.info("HTTP server closed");
            try {
                await closeConnection();
                logger.info("Database connection closed");
            } catch (error) {
                logger.error("Error closing database connection:", error);
            }
            process.exit(0);
        });
    }

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    startServer().catch((error) => logger.error("Error starting server:", error));
}
