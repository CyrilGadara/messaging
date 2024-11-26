const { getConnection, releaseConnection } = require("../config/db");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");
const { create } = require("./CampaignQueueModel");

const MessagesModel = {
    create: async (messageData) => {
        let db;
        try {
            db = await getConnection();

            const message = {
                id: uuidv4(),
                user_id: messageData.userId,
                contact_id: messageData.contactId,
                campaign_id: messageData.campaignId,
                type: messageData.type,
                template_name: messageData.templateName,
                content: messageData.content,
                status: "pending",
                created_at: db.fn.now(),
                updated_at: db.fn.now(),
            };

            await db("messages").insert(message);
            logger.info(`Created message ${message.id}`);
            return message;
        } catch (error) {
            logger.error("Error in MessagesModel.create: ", error);
            throw new Error("Failed to create message");
        } finally {
            if (db) {
                releaseConnection(db);
            }
        }
    },
    updateStatus: async (id, externalId, status, body) => {
        let db;
        try {
            db = await getConnection();
            //update externalId and status using contactId
            await db("messages").where({ id }).update({
                external_id: externalId,
                status: status,
                content: body,
                updated_at: db.fn.now(),
            });
        } catch (error) {
            logger.error("Error in MessagesModel.updateStatus: ", error);
            throw new Error("Failed to update message status");
        } finally {
            if (db) {
                releaseConnection(db);
            }
        }
    },
    getLastMessageByContactId: async (contactId) => {
        let db;
        try {
            db = await getConnection();

            const message = await db("messages").where({ contact_id: contactId }).orderBy("created_at", "desc").first();
            return message;
        } catch (error) {
            logger.error("Error in MessagesModel.getLastMessageByContactId: ", error);
            throw new Error("Failed to get last message");
        } finally {
            if (db) {
                releaseConnection(db);
            }
        }
    },
};

Object.freeze(MessagesModel);

module.exports = MessagesModel;
