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
    getAllMessages: async (req, res) => {
        try {
            const messages = await ConversationModel.getMessagesByContactIdAndCampaignId(req.params.contactid, req.params.campaignid);

            res.json({
                success: true,
                messages,
            });
        } catch (error) {
            logger.error("Error in ConversationController.getAllMessages", error);
            res.status(500).json({
                success: false,
                message: "Failed to get all messages",
            });
        }
    },
};

Object.freeze(ConversationController);

module.exports = ConversationController;
