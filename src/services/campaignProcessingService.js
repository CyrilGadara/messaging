const whatsappService = require("./whatsappService");
const emailService = require("./emailService");
const smsService = require("./smsService");
const messagingConfig = require("../config/messagingConfig");
const CampaignModel = require("../models/CampaignModel");
const CampaignQueueModel = require("../models/CampaignQueueModel");
const ContactModel = require("../models/ContactModel");
const MessagesModel = require("../models/MessagesModel");
const logger = require("../utils/logger");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const campaignProcessingService = {
    processContact: async (contact, campaign) => {
        try {
            // Whatsapp
            const messageParams = {
                1: contact.name,
                2: campaign.job_role,
                3: campaign.company_name,
                4: campaign.location,
                5: campaign.job_type,
            };

            const message = await MessagesModel.create({
                userId: campaign.user_id,
                campaignId: campaign.id,
                contactId: contact.id,
                type: "whatsapp",
                templateName: "JOB_OPPORTUNITY",
            });

            const result = await whatsappService.sendWhatsappMessage(contact.phone_number, "JOB_OPPORTUNITY", messageParams);

            if (result.success) {
                await ContactModel.updateWhatsAppStatus(contact.id, "sent");
                await MessagesModel.updateStatus(message.id, result.message, "sent", result.body);
            } else {
                await ContactModel.updateWhatsAppStatus(contact.id, "failed");
            }

            // SMS
            const applyLink = `https://google.com`;
            const smsParams = {
                name: contact.name,
                job_role: campaign.job_role,
                company_name: campaign.company_name,
                location: campaign.location,
                job_type: campaign.job_type,
                applyLink,
            };
            const smsMessage = await MessagesModel.create({
                userId: campaign.user_id,
                campaignId: campaign.id,
                contactId: contact.id,
                type: "sms",
                templateName: "JOB_OPPORTUNITY",
            });

            const smsResult = await smsService.sendSMS(contact.phone_number, "JOB_OPPORTUNITY", smsParams);
            if (smsResult.success) {
                await ContactModel.updateSMSStatus(contact.id, "sent");

                await MessagesModel.updateStatus(smsMessage.id, smsResult.messageId, "sent", smsResult.body);
            } else {
                await ContactModel.updateSMSStatus(contact.id, "failed");
            }

            // Email
            const yesLink = `http://localhost:11123/apply/${campaign.id}/${contact.id}`;
            const noLink = `https://your-website.com/job-response`;
            const unsubscribeLink = `https://your-website.com/unsubscribe`;
            const emailParams = [
                contact.name,
                campaign.job_role,
                campaign.company_name,
                campaign.location,
                campaign.job_type,
                yesLink,
                noLink,
                unsubscribeLink,
            ];

            const emailMessage = await MessagesModel.create({
                userId: campaign.user_id,
                campaignId: campaign.id,
                contactId: contact.id,
                type: "email",
                templateName: "JOB_OPPORTUNITY",
            });

            const emailResult = await emailService.sendEmail(contact.email, "JOB_OPPORTUNITY", emailParams);

            if (emailResult.success) {
                await ContactModel.updateEmailStatus(contact.id, "sent");

                await MessagesModel.updateStatus(emailMessage.id, emailResult.messageId, "sent", emailResult.html);
            } else {
                await ContactModel.updateEmailStatus(contact.id, "failed");
            }
            await CampaignModel.incrementProcessedCount(campaign.id);
            await sleep(5000);

            return result;
        } catch (error) {
            logger.error("Error in campaignProcessingService.processContact: ", error);
            throw new Error("Failed to process contact");
        }
    },
    processCampaign: async (queueEntry) => {
        try {
            const campaign = await CampaignModel.findById(queueEntry.campaign_id);
            const contacts = await ContactModel.findPendingContactsByCampaignId(campaign.id);

            //Update queue entry to processing
            await CampaignQueueModel.updateStatus(queueEntry.id, "processing");

            let processedCount = await CampaignModel.getProcessedCount(campaign.id);

            //Process each contact
            for (const contact of contacts) {
                try {
                    if (contact.phone_number) {
                        await campaignProcessingService.processContact(contact, campaign);
                        processedCount++;

                        // Update processed count
                        // await CampaignModel.updateProcessedCount(campaign.id, processedCount);
                    }
                } catch (error) {
                    logger.error(`Failed to process contact ${contact.id}: ${error}`);
                }
            }

            // Update final statuses
            await CampaignQueueModel.updateStatus(queueEntry.id, "completed");
            await CampaignModel.updateStatus(campaign.id, "completed");

            logger.info(`Campaign ${campaign.id} processed successfully`);
        } catch (error) {
            logger.error("Error in campaignProcessingService.processCampaign: ", error);
            await CampaignQueueModel.updateStatus(queueEntry.id, "failed");
            await CampaignModel.updateStatus(campaign.id, "failed");

            throw new Error("Failed to process campaign");
        }
    },
    startProcessing: async () => {
        try {
            logger.info("Starting campaign processing...");

            const queueEntry = await CampaignQueueModel.getNextQueued();

            if (queueEntry) {
                logger.info(`Found queued campaign: ${queueEntry.campaign_id}`);

                await campaignProcessingService.processCampaign(queueEntry);
            }
        } catch (error) {
            logger.error("Error in campaignProcessingService.startProcessing: ", error);
        }
    },
};

Object.freeze(campaignProcessingService);

module.exports = campaignProcessingService;
