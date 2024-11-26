const { getConnection, releaseConnection } = require("../db/db");
const logger = require("../utils/logger");
const uuidv4 = require("uuid").v4;

const MessagesModel = {
    create: async (messageData) => {
        let db;
        try {
            db = await getConnection();

            const message = {
                id: uuidv4(),
                campaing_id: messageData.campaingId,
                contact_id: messageData.contactId,
                type: "whatsapp",
                content: messageData.content,
                template_name: messageData.templateName,
                external_id: messageData.externalId,
                status: messageData.status,
                sent_at: messageData.sentAt || db.fn.now(),
                created_at: db.fn.now(),
                updated_at: db.fn.now(),
            };

            await db("messages").insert(message);
            logger.info(`Created message ${message.id}`);
            return message;
        } catch (error) {
            logger.error("Error in MessagesModel.create", error);
            throw new Error("Failed to create message");
        } finally {
            if (db) await releaseConnection(db);
        }
    },

    updateStatus: async (externalId, status) => {
        let db;
        try {
            db = await getConnection();

            const updateData = {
                status,
                updated_at: db.fn.now(),
            };

            await db("messages").where({ external_id: externalId }).update(updateData);

            logger.info(`Updated message ${externalId} status to ${status}`);
            return true;
        } catch (error) {
            logger.error("Error in MessagesModel.updateStatus", error);
            throw new Error("Failed to update message status");
        } finally {
            if (db) await releaseConnection(db);
        }
    },

    getMessagesByContact: async (contactId) => {
        let db;
        try {
            db = await getConnection();

            const messages = await db("messages").where({ contact_id: contactId }).orderBy("created_at", "desc");

            return messages;
        } catch (error) {
            logger.error("Error in MessagesModel.getMessagesByContact", error);
            throw new Error("Failed to get messages by contact");
        } finally {
            if (db) await releaseConnection(db);
        }
    },

    getCampaingStats: async (campaingId) => {
        let db;
        try {
            db = await getConnection();

            const stats = await db("messages").where({ campaing_id: campaingId }).select("status").count("* as count").groupBy("status");

            return stats.reduce((acc, curr) => {
                acc[curr.status] = curr.count;
                return acc;
            }, {});
        } catch (error) {
            logger.error("Error in MessagesModel.getCampaingStats", error);
            throw new Error("Failed to get campaing stats");
        } finally {
            if (db) await releaseConnection(db);
        }
    },

    // For webhook handling
    findByExternalId: async (externalId) => {
        let db;
        try {
            db = await getConnection();
            const message = await db("messages").where({ external_id: externalId }).first();
            return message;
        } catch (error) {
            logger.error("Error in MessageModel.findByExternalId: ", error);
            throw new Error("Failed to find message");
        } finally {
            if (db) await releaseConnection(db);
        }
    },

    // Get recent activities for a campaign
    getRecentActivities: async (campaignId, limit = 50, beforeId = null) => {
        let db;
        try {
            db = await getConnection();
            let query = db("messages")
                .where({ campaign_id: campaignId })
                .select("messages.*", "contacts.name as contact_name", "contacts.phone_number")
                .join("contacts", "messages.contact_id", "contacts.id")
                .orderBy("messages.created_at", "desc")
                .limit(limit);

            if (beforeId) {
                const beforeMessage = await db("messages").where({ id: beforeId }).select("created_at").first();
                if (beforeMessage) {
                    query = query.where("messages.created_at", "<", beforeMessage.created_at);
                }
            }

            return await query;
        } catch (error) {
            logger.error("Error in MessageModel.getRecentActivities: ", error);
            throw new Error("Failed to fetch activities");
        } finally {
            if (db) await releaseConnection(db);
        }
    },
};

Object.freeze(MessagesModel);

module.exports = MessagesModel;
