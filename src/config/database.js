require("dotenv").config({ path: "../../.env" });

const baseConfig = {
    client: process.env.DB_CLIENT || "mssql",
    connection: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT, 10) || 1433,
        options: {
            encrypt: false,
            trustServerCertificate: true,
            enableArithAbort: true,
            // trustedConnection: true,
            instanceName: "SQLEXPRESS",
        },
    },
    pool: {
        min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
        max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    },
    migrations: {
        tableName: "knex_migrations",
        directory: "../migrations",
    },
    seeds: {
        directory: "../seeds",
    },
};

const environments = {
    development: {
        ...baseConfig,
        debug: false,
    },
    test: {
        ...baseConfig,
        connection: {
            ...baseConfig.connection,
            database: process.env.TEST_DB_NAME || `${process.env.DB_NAME}_test`,
        },
    },
    staging: {
        ...baseConfig,
        pool: {
            min: 2,
            max: 10,
        },
    },
    production: {
        ...baseConfig,
        pool: {
            min: 5,
            max: 30,
        },
        connection: {
            ...baseConfig.connection,
            ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
        },
    },
};

const environment = process.env.NODE_ENV || "development";
const environmentConfig = environments[environment];

if (!environmentConfig) {
    throw new Error(`Invalid NODE_ENV: ${environment}`);
}

module.exports = environmentConfig;
