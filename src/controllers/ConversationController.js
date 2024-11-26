const logger = require("../utils/logger");
const ConversationModel = require("../models/ConversationModel");

const ConversationController = {
    create: async (req, res) => {
        try {
        } catch (error) {
            logger.error("Error in ConversationController.create", error);
            res.status(500).json({
                success: false,
                message: "Failed to create conversation",
            });
        }
    },
};

Object.freeze(ConversationController);

module.exports = ConversationController;
