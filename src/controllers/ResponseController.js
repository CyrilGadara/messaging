require("dotenv").config();
const logger = require("../utils/logger");
const whatsappService = require("../services/whatsappService");
const ContactModel = require("../models/ContactModel");
const CampaignModel = require("../models/CampaignModel");
const ResponseModel = require("../models/ResponseModel");
const MessagesModel = require("../models/MessagesModel");
const ConversationModel = require("../models/ConversationModel");

const { getIO } = require("../config/socket");

const ResponseController = {
    // https://timberwolf-mastiff-9776.twil.io/demo-reply
    create: async (req, res) => {
        try {
            const { ProfileName, Body, From, To, MessageSid } = req.body;

            const phoneNumber = From.replace("whatsapp:+91", "");
            const contact = await ContactModel.findByPhoneNumber(phoneNumber);
            const campaign = await CampaignModel.findById(contact.campaign_id);
            const message = await MessagesModel.getLastMessageByContactId(contact.id);

            // conversation
            const conversation = await ConversationModel.getLastMessageByContactId(contact.id);

            const jobTitle = campaign.job_role;
            const companyName = campaign.company_name;
            let responseTemplate = "";
            let response_type = "";
            let applicationLink = "";
            let templateData = {};

            const receivedConversation = await ConversationModel.create({
                campaign_id: campaign.id,
                contact_id: contact.id,
                message: Body,
                external_id: MessageSid,
                message_type: "received",
                channel: "whatsapp",
            });

            console.log("===============================================");
            console.log("now emmit receiveMessage");
            console.log("===============================================");
            const io = getIO();

            io.emit("receiveMessage", {
                message: Body,
                message_type: "received",
                contactId: contact.id,
                campaignId: campaign.id,
                created_at: receivedConversation.created_at,
            });

            if (["👍", "👍🏻", "👍🏼", "👍🏽", "👍🏾", "👍🏿"].includes(Body.toLowerCase())) {
                responseTemplate = "INTERESTED_RESPONSE";
                response_type = "interested";
                applicationLink = `${process.env.URL}/apply/${campaign.id}/${contact.id}`;
                templateData = {
                    jobTitle: jobTitle,
                    companyName: companyName,
                    applicationLink: applicationLink,
                };
            } else if (["👎", "👎🏻", "👎🏼", "👎🏽", "👎🏾", "👎🏿"].includes(Body.toLowerCase())) {
                responseTemplate = "NOT_INTERESTED_RESPONSE";
                response_type = "not_interested";
            } else if (["1", "2", "3", "4", "5"].includes(Body)) {
                responseTemplate = "REASON_FOLLOWUP";
                response_type = "reason_followup";
                const reasons = [
                    "Not interested in this type of role",
                    "Location doesn't suit me",
                    "Compensation not in my expected range",
                    "Not looking for new opportunities right now",
                    "Other",
                ];
                templateData = {
                    reason: reasons[parseInt(Body) - 1],
                };
            } else {
                return {
                    success: false,
                    message: "Unrecognized input",
                };
            }

            const result = await whatsappService.sendWhatsAppResponseMessage(From, responseTemplate, templateData);

            await ResponseModel.create({
                message_id: message.id,
                contact_id: contact.id,
                content: result.body,
                response_type: response_type,
                external_id: result.message,
                campaign_id: campaign.id,
            });

            const conversationResponse = await ConversationModel.create({
                campaign_id: campaign.id,
                contact_id: contact.id,
                message: result.body,
                external_id: result.message,
                message_type: "sent",
                channel: "whatsapp",
                status: "sent",
            });

            res.json({
                success: true,
                message: "Webhook received",
                body: Body,
                from: From,
                to: To,
                profileName: ProfileName,
            });
        } catch (error) {
            logger.error("Error in ResponseController.create: ", error);
            res.status(500).json({
                success: false,
                message: "Failed to create response",
            });
        }
    },
};

Object.freeze(ResponseController);

module.exports = ResponseController;
