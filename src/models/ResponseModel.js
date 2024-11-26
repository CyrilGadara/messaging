const { getConnection, releaseConnection } = require("../config/db");
const logger = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");

const ResponseModel = {
    create: async (responseData) => {
        let db;

        try {
            db = await getConnection();

            const response = {
                id: uuidv4(),
                message_id: responseData.message_id,
                contact_id: responseData.contact_id,
                content: responseData.content,
                response_type: responseData.response_type,
                created_at: db.fn.now(),
                updated_at: db.fn.now(),
                external_id: responseData.external_id,
                campaign_id: responseData.campaign_id,
            };

            await db("message_responses").insert(response);
            logger.info(`Created response ${response.id}`);
            return response;
        } catch (error) {
            logger.error("Error in ResponseModel.create: ", error);
            throw new Error("Failed to create response");
        } finally {
            if (db) {
                releaseConnection(db);
            }
        }
    },
};

Object.freeze(ResponseModel);

module.exports = ResponseModel;
