const logger = require("../utils/logger");
const ConversationModel = require("../models/ConversationModel");
const ContactModel = require("../models/ContactModel");
const whatsappService = require("../services/whatsappService");

const ConversationController = {
    create: async (req, res) => {
        try {
            console.log(req.params, req.body);
            const contact = await ContactModel.findById(req.params.contactid);

            const result = await whatsappService.sendChatWhatsappMessage(contact.phone_number, req.body.message);
            console.log(result);
            await ConversationModel.create({
                campaign_id: req.params.campaignid,
                contact_id: req.params.contactid,
                message: result.body,
                external_id: result.message,
                message_type: "sent",
                channel: "whatsapp",
            });
            return res.json({
                success: true,
            });
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
