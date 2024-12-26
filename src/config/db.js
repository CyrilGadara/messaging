const knex = require("knex");
const config = require("./database");
const logger = require("../utils/logger");

let db;

async function createConnection() {
    const connection = knex(config);

    try {
        // await connection.raw("SET time_zone='+00:00';"); // mysql
        // logger.info("Database timezone set to UTC"); // mysql
        // await connection.raw("SET TIME ZONE 'UTC';"); // pg
        // logger.info("Database timezone set to UTC"); // pg
        await connection.raw("SELECT 1");
        logger.info("Database connected successfully");
    } catch (err) {
        logger.error("Database connection failed:", err);
        process.exit(1);
    }

    return connection;
}

async function getConnection() {
    if (!db) {
        db = await createConnection();
    } else {
        // Check if the connection is still valid
        try {
            await db.raw("SELECT 1");
        } catch (err) {
            logger.warn("Existing connection is invalid, creating a new one");
            await closeConnection();
            db = await createConnection();
        }
    }
    return db;
}

async function closeConnection() {
    if (db) {
        try {
            await db.destroy();
            logger.info("Database connection closed");
        } catch (err) {
            logger.error("Error closing database connection:", err);
        } finally {
            db = null;
        }
    }
}

// New function to release a connection (for use after transactions)
async function releaseConnection(connection) {
    // In Knex, we don't need to explicitly release connections
    // They are automatically released back to the pool
    // This function is here for consistency and future-proofing
    logger.debug("Connection released back to the pool");
}

module.exports = {
    getConnection,
    closeConnection,
    releaseConnection,
};
