const { getConnection, releaseConnection } = require("../config/db");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");

const UserModel = {
    create: async (userData) => {
        let db;
        try {
            db = await getConnection();
            const { username, email, password, role = "user" } = userData;
            const hashPassword = await bcrypt.hash(password, 10);
            const id = uuidv4();
            await db("users").insert({
                id,
                username,
                email,
                password: hashPassword,
                role,
            });

            logger.info(`User created successfully: ${id}`);
            return { id, username, email, role };
        } catch (error) {
            logger.error("Error in UserModel.create: ", error);
            throw new Error("Failed to create user");
        } finally {
            if (db) {
                await releaseConnection(db);
                logger.info("Database connection released");
            }
        }
    },

    findByEmail: async (email) => {
        let db;
        try {
            db = await getConnection();
            const user = await db("users").where({ email }).first();
            if (!user) {
                logger.info(`No user found for email/username: ${email}`);
                return null;
            }

            logger.info(`User found: ${user.id}`);
            return user;
        } catch (error) {
            logger.error(`Error in UserModel.findByEmail: ${error.message}`);
            throw new Error("Failed to find user");
        } finally {
            if (db) {
                await releaseConnection(db);
                logger.info("Database connection released");
            }
        }
    },

    findByUsername: async (username) => {
        let db;
        try {
            db = await getConnection();
            const user = await db("users").where({ username }).first();

            if (!user) {
                logger.info(`No user found for email/username: ${username}`);
                return null;
            }

            logger.info(`User found: ${user.id}`);
            return user;
        } catch (error) {
            logger.error(`Error in UserModel.findByUsername: ${error.message}`);
            throw new Error("Failed to find user");
        } finally {
            if (db) {
                await releaseConnection(db);
                logger.info("Database connection released");
            }
        }
    },
    findById: async (id) => {
        let db;
        try {
            db = await getConnection();
            const user = await db("users").select("id", "username", "email", "role", "status", "company_name", "company_logo").where({ id }).first();

            if (!user) {
                logger.info(`No user found for id: ${id}`);
                return null;
            }

            logger.info(`User found: ${user.id}`);
            return user;
        } catch (error) {
            logger.error(`Error in UserModel.findById: ${error.message}`);
            throw new Error("Failed to find user");
        } finally {
            if (db) {
                await releaseConnection(db);
                logger.info("Database connection released");
            }
        }
    },
    findAll: async () => {
        let db;
        try {
            db = await getConnection();
            const users = await db("users").select("*").orderBy("created_at", "desc");
            return users;
        } catch (error) {
            logger.error(`Error in UserModel.findAll: ${error.message}`);
            throw new Error("Failed to find users");
        } finally {
            if (db) {
                await releaseConnection(db);
                logger.info("Database connection released");
            }
        }
    },
    updateUser: async (userId, updateData) => {
        let db;
        try {
            db = await getConnection();

            // Update the user in the database
            const result = await db("users").where({ id: userId }).update(updateData);

            if (result === 0) {
                return null; // No user updated
            }

            const updatedUser = await db("users").where({ id: userId }).first();
            return updatedUser;
        } catch (error) {
            logger.error(`Error in UserModel.updateUser: ${error.message}`);
            throw new Error("Failed to update user");
        } finally {
            if (db) {
                await releaseConnection(db);
                logger.info("Database connection released");
            }
        }
    },
    deleteUser: async (id) => {
        let db;
        try {
            db = await getConnection();
            const result = await db("users").where({ id }).del();
            if (result === 0) {
                return null; // No user deleted
            }
            return result;
        } catch (error) {
            logger.error(`Error in UserModel.deleteUser: ${error.message}`);
            throw new Error("Failed to delete user");
        } finally {
            if (db) {
                await releaseConnection(db);
                logger.info("Database connection released");
            }
        }
    },
};

Object.freeze(UserModel);

module.exports = UserModel;
