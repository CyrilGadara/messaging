const { getConnection, releaseConnection } = require("../config/db");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

const ConversationModel = {
    create: async (conversationData) => {
        let db;
        try {
            db = await getConnection();
            console.log("__________________________________");
            console.log(conversationData);
            console.log("__________________________________");
            const conversation = {
                id: uuidv4(),
                campaign_id: conversationData.campaign_id,
                contact_id: conversationData.contact_id,
                message: conversationData.message,
                external_id: conversationData.external_id,
                message_type: conversationData.message_type,
                channel: conversationData.channel,
                status: conversationData.status,
                created_at: new Date(),
            };

            await db("conversations").insert(conversation);
            return conversation;
        } catch (error) {
            logger.error("Error in ConversationModel.create", error);
            throw new Error("Failed to create conversation");
        } finally {
            if (db) releaseConnection(db);
        }
    },
    updateStatus: async (id, externamId, message, status) => {
        let db;
        try {
            db = await getConnection();

            await db("conversations").where({ id }).update({
                external_id: externamId,
                message: message,
                status: status,
            });
        } catch (error) {
            logger.error("Error in ConversationModel.updateStatus", error);
            throw new Error("Failed to update conversation status");
        } finally {
            if (db) releaseConnection(db);
        }
    },
    getLastMessageByContactId: async (contactId) => {
        let db;
        try {
            db = await getConnection();

            const message = await db("conversations").where({ contact_id: contactId }).orderBy("created_at", "desc").first();

            return message;
        } catch (error) {
            logger.error("Error in ConversationModel.getLastMessageByContactId", error);
            throw new Error("Failed to get last message by contact id");
        } finally {
            if (db) releaseConnection(db);
        }
    },
    getMessagesByContactIdAndCampaignId: async (contactId, campaignId) => {
        let db;
        try {
            db = await getConnection();

            const messages = await db("conversations")
                .where({ contact_id: contactId, campaign_id: campaignId })
                .orderBy("created_at", "asc")
                .select("*");

            return messages;
        } catch (error) {
            logger.error("Error in ConversationModel.getMessagesByContactIdAndCampaignId", error);
            throw new Error("Failed to get messages by contact id and campaign id");
        } finally {
            if (db) releaseConnection(db);
        }
    },
};

Object.freeze(ConversationModel);

module.exports = ConversationModel;
