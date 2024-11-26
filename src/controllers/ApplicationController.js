const logger = require("../utils/logger");
const { validationResult } = require("express-validator");
const ApplicationModel = require("../models/ApplicationModel");
const CampaignModel = require("../models/CampaignModel");
const ContactModel = require("../models/ContactModel");
const ConversationModel = require("../models/ConversationModel");
const whatsappService = require("../services/whatsappService");

const ApplicationController = {
    getCandidateDetails: async (req, res) => {
        try {
            console.log(req.params);
            const campaign = await CampaignModel.findById(req.params.campaignid);
            const contact = await ContactModel.findById(req.params.contactid);

            res.render("application/apply", {
                campaign,
                contact,
            });
        } catch (error) {
            logger.error("Error in ApplicationController.getCandidateDetails: ", error);
            res.status(500).render("error", {
                message: "Failed to load candidate details",
            });
        }
    },
    checkIfApplicationExists: async (req, res) => {
        try {
            const existingApplication = await ApplicationModel.findByCampaignIdAndContactId(req.params.campaignid, req.params.contactid);

            if (existingApplication) {
                return res.status(400).json({
                    success: false,
                    message: "Application already exists",
                });
            }

            res.status(200).json({
                success: true,
            });
        } catch (error) {
            logger.error("Error in ApplicationController.checkIfApplicationExists: ", error);
            res.status(500).render("error", {
                message: "Failed to check if application exists",
            });
        }
    },
    submitApplication: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
            }

            const existingApplication = await ApplicationModel.findByCampaignIdAndContactId(req.params.campaignid, req.params.contactid);

            if (existingApplication) {
                return res.status(400).json({
                    success: false,
                    message: "Application already exists",
                });
            }

            const application = await ApplicationModel.create({
                campaignId: req.params.campaignid,
                contactId: req.params.contactid,
                jobStatus: req.body.jobStatus,
                expectedSalary: req.body.expectedSalary,
                noticePeriod: req.body.noticePeriod,
                additionalDetails: req.body.additionalDetails,
            });

            const contact = await ContactModel.findById(req.params.contactid);

            const result = await whatsappService.sendChatWhatsappMessage(
                contact.phone_number,
                "Thank you for sharing your details. Our recruitment team will review your information and get back to you shortly with the next steps in the hiring process."
            );

            const conversation = await ConversationModel.create({
                campaign_id: req.params.campaignid,
                contact_id: req.params.contactid,
                message: result.body,
                external_id: result.message,
                message_type: "sent",
                channel: "whatsapp",
                status: result.status,
            });

            res.status(200).json({ success: true });
        } catch (error) {
            logger.error("Error in ApplicationController.submitApplication: ", error);
            res.status(500).render("error", {
                message: "Failed to submit application",
            });
        }
    },
};

Object.freeze(ApplicationController);

module.exports = ApplicationController;
