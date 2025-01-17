require("dotenv").config();

module.exports = {
    development: {
        client: process.env.DB_CLIENT,
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
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: "knex_migrations",
            directory: "./src/migrations",
        },
        seeds: {
            directory: "./src/seeds",
        },
        debugger: true,
    },
};
