const { getConnection, releaseConnection } = require("../config/db");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

const ConversationModel = {
    create: async (conversationData) => {
        let db;
        try {
            db = await getConnection();
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
};

Object.freeze(ConversationModel);

module.exports = ConversationModel;
