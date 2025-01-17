const { getConnection, releaseConnection } = require("../config/db");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

const UnsubscribeModel = {
    unsubscribe: async (unsubscribeData) => {
        let db;
        try {
            db = await getConnection();

            const unsubscribeEntry = {
                id: uuidv4(),
                email: unsubscribeData.email,
                phone_number: unsubscribeData.phoneNumber,
                reason: unsubscribeData.reason,
                unsubscribed_at: db.fn.now(),
            };

            await db("unsubscribed_contacts").insert(unsubscribeEntry);

            return unsubscribeEntry;
        } catch (error) {
            logger.error("Error in UnsubscribeModel.create: ", error);
            throw new Error("Failed to create unsubscribe entry");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
    isUnsibscribed: async (email, phoneNumber) => {
        let db;
        try {
            db = await getConnection();

            const unsubscribed = await db("unsubscribed_contacts")
                // .where({
                //     email,
                //     phone_number: phoneNumber,
                // })
                .where("email", email)
                .orWhere("phone_number", phoneNumber)
                .first();
            return unsubscribed !== undefined;
        } catch (error) {
            logger.error("Error in UnsubscribeModel.isUnsubscribed: ", error);
            throw new Error("Failed to check if user is unsubscribed");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
    findAll: async () => {
        let db;
        try {
            db = await getConnection();

            const unsubscribedContacts = await db("unsubscribed_contacts")
                .select("id", "email", "phone_number", "reason", "unsubscribed_at")
                .orderBy("unsubscribed_at", "desc");
            return unsubscribedContacts;
        } catch (error) {
            logger.error("Error in UnsubscribeModel.findAll: ", error);
            throw new Error("Failed to find all unsubscribed contacts");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
};

Object.freeze(UnsubscribeModel);

module.exports = UnsubscribeModel;
